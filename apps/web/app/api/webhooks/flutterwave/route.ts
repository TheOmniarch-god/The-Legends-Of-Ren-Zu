import { randomBytes } from "node:crypto";
import { paymentCodes, transactions } from "@renzu-bts/db/schema/renzu";
import { eq } from "drizzle-orm";

import { db } from "@/server/services";

const FLW_WORDS: Record<string, string[]> = {
	gu_master: [
		"reputationgu",
		"wineorigin",
		"faithlight",
		"strengthpath",
		"aperturefist",
		"primevalseed",
		"wisdomchain",
		"firststepper",
	],
	gu_immortal: [
		"northdarkice",
		"soulseal",
		"weboffate",
		"ordinaryabyss",
		"dreamwalker",
		"immortalaperture",
		"fateweaver",
		"freedomseeker",
	],
	venerable: [
		"reverendinsanity",
		"heavenpursuit",
		"strongeatweak",
		"selftrue",
		"peakvenerable",
		"fatebows",
		"lightningwill",
		"renzuascendant",
	],
};
const FLW_TIER_NAMES: Record<string, string> = {
	gu_master: "Gu Master",
	gu_immortal: "Gu Immortal",
	venerable: "Venerable",
};
const FLW_AMOUNT_TO_TIER: Record<number, string> = {
	499: "gu_master",
	999: "gu_immortal",
	2999: "venerable",
};

export async function POST(request: Request) {
	const rawBody = await request.text();
	const signature = request.headers.get("verif-hash");
	if (
		!process.env.FLW_WEBHOOK_HASH ||
		signature !== process.env.FLW_WEBHOOK_HASH
	) {
		return Response.json({ error: "Invalid signature" }, { status: 401 });
	}

	try {
		const event = JSON.parse(rawBody);
		if (event?.event !== "charge.completed") {
			return Response.json({ received: true, ignored: true });
		}
		const transactionId = event?.data?.id;
		const txRef = event?.data?.tx_ref;
		if (!transactionId || !txRef) {
			return Response.json({
				received: true,
				ignored: true,
				reason: "missing id/tx_ref",
			});
		}

		const existing = await db
			.select()
			.from(paymentCodes)
			.where(eq(paymentCodes.paymentReference, txRef))
			.limit(1);
		if (existing[0]) return Response.json({ received: true, duplicate: true });

		const verifyRes = await fetch(
			`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
			{
				headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
			},
		);
		const verifyData = (await verifyRes.json()) as {
			status?: string;
			message?: string;
			data?: {
				status?: string;
				amount?: number | string;
				currency?: string;
				customer?: { email?: string };
			};
		};
		if (
			!verifyRes.ok ||
			verifyData?.status !== "success" ||
			!verifyData?.data
		) {
			throw new Error(verifyData?.message || "Flutterwave verify failed");
		}
		const verified = verifyData.data;
		if (verified.status !== "successful") {
			return Response.json({
				received: true,
				ignored: true,
				reason: "not successful after verify",
			});
		}

		const amountMinor = Math.round(Number(verified.amount || 0) * 100);
		const tier = FLW_AMOUNT_TO_TIER[amountMinor];
		if (!tier) {
			return Response.json({
				received: true,
				ignored: true,
				reason: "unrecognized amount",
			});
		}
		if (process.env.FLW_EXPECTED_CURRENCY) {
			const expected = process.env.FLW_EXPECTED_CURRENCY.trim().toUpperCase();
			const actual = String(verified.currency || "")
				.trim()
				.toUpperCase();
			if (expected && actual !== expected) {
				return Response.json({
					received: true,
					ignored: true,
					reason: "currency mismatch",
				});
			}
		}

		const email =
			verified?.customer?.email || event?.data?.customer?.email || null;
		const words = FLW_WORDS[tier] ?? FLW_WORDS.gu_master ?? ["renzu"];
		const pick = words[Math.floor(Math.random() * words.length)] ?? "renzu";
		const code = `${pick}-${randomBytes(3).toString("hex")}`;
		const appUrl = (
			process.env.PUBLIC_SITE_URL ||
			"https://thelegendsofrenzu.theomniarch.com.ng"
		).replace(/\/$/, "");

		await db.insert(paymentCodes).values({
			code,
			tier,
			used: false,
			paymentReference: txRef,
			paymentProvider: "flutterwave",
			flutterwaveTransactionId: String(transactionId),
			paystackReference: txRef,
			customerEmail: email,
			email,
		});
		await db.insert(transactions).values({
			reference: txRef,
			amount: amountMinor,
			currency: verified.currency || "",
			plan: tier,
			status: "successful_flutterwave",
			email,
		});

		if (email && process.env.RESEND_API_KEY) {
			const tierName = FLW_TIER_NAMES[tier] || tier;
			await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					from: "The Omniarch <no-reply@theomniarch.com.ng>",
					to: email,
					subject: `Your ${tierName} Realm Token`,
					html: `<div style="margin:0;padding:24px;background:#050403;font-family:Georgia,serif;color:#f7ead0;"><div style="max-width:620px;margin:0 auto;"><h1 style="color:#fff4d6;">Your Realm Token</h1><p>Your Flutterwave payment has been verified. This token unlocks your <strong>${tierName}</strong> realm.</p><div style="text-align:center;font-size:26px;letter-spacing:0.13em;color:#fff4d6;padding:20px;">${code}</div><p>Login to The Legends of Ren Zu, open Treasure Yellow Heaven, then redeem this token under <strong>Realm Token</strong>.</p><p><a href="${appUrl}" style="color:#fff4d6;">Open Treasure Yellow Heaven</a></p></div></div>`,
				}),
			}).catch((e) => console.error("Realm token email send failed:", e));
		}

		return Response.json({ received: true });
	} catch (err) {
		console.error("flutterwave-webhook error:", err);
		return Response.json(
			{ error: "Webhook processing failed" },
			{ status: 500 },
		);
	}
}

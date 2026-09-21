import { ORPCError } from "@orpc/server";
import {
	cryptoPayments,
	profiles,
	transactions,
} from "@renzu-bts/db/schema/renzu";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

const USDT_TRC20_ADDRESS = "TBnjQq7kCuF3NBYMQcniF2pzVVLfEnMmEU";
const TRON_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const TRONSCAN_TX_URL = "https://apilist.tronscanapi.com/api/transaction-info";

const PLAN_PRICES: Record<string, number> = {
	gu_master: 5,
	gu_immortal: 10,
	venerable: 30,
};

const TIER_GRANTS: Record<string, { narrations: number; chats: number }> = {
	gu_master: { narrations: 42, chats: 100 },
	gu_immortal: { narrations: 500, chats: 999999 },
	venerable: { narrations: 999999, chats: 999999 },
};

function todayKey() {
	return new Date().toISOString().slice(0, 10);
}

function tierRank(tier: string) {
	switch (tier) {
		case "venerable":
			return 4;
		case "gu_immortal":
			return 3;
		case "gu_master":
			return 2;
		default:
			return 1;
	}
}

function first<T>(rows: T[], what = "record"): T {
	const row = rows[0];
	if (row === undefined)
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Could not load ${what}`,
		});
	return row;
}

function toBaseUnits(amount: unknown, decimals = 6): bigint {
	const raw = String(amount || "0").trim();
	if (!raw) return 0n;
	if (/^\d+$/.test(raw)) return BigInt(raw);
	const splitParts = raw.split(".");
	const whole = splitParts[0] || "0";
	const frac = splitParts[1] || "";
	const safeWhole = whole.replace(/\D/g, "") || "0";
	const safeFrac = frac
		.replace(/\D/g, "")
		.padEnd(decimals, "0")
		.slice(0, decimals);
	return BigInt(safeWhole + safeFrac);
}

function sameAddress(a: unknown, b: unknown) {
	return (
		String(a || "")
			.trim()
			.toLowerCase() ===
		String(b || "")
			.trim()
			.toLowerCase()
	);
}

type TronTxData = {
	confirmed?: boolean;
	contractRet?: string;
	receipt?: { result?: string };
	trc20TransferInfo?: unknown;
	trc20Transfer_info?: unknown;
	trc20_transfer_info?: unknown;
	tokenTransferInfo?: unknown;
	tokenTransfer_info?: unknown;
	token_transfer_info?: unknown;
};

type TronTransfer = {
	contract_address?: string;
	contractAddress?: string;
	symbol?: string;
	to_address?: string;
	toAddress?: string;
	to?: string;
	to_address_tag?: string;
	decimals?: number | string;
	amount_str?: string;
	amountStr?: string;
	quant?: string;
	amount?: string | number;
	value?: string | number;
	tokenInfo?: {
		tokenId?: string;
		tokenAbbr?: string;
		tokenName?: string;
		tokenDecimal?: number | string;
		contract_address?: string;
	};
	token_info?: {
		tokenId?: string;
		tokenAbbr?: string;
		tokenDecimal?: number | string;
	};
};

function txLooksSuccessful(data: unknown) {
	if (!data || typeof data !== "object") return false;
	const d = data as TronTxData;
	if (d.confirmed === false) return false;
	if (d.contractRet && String(d.contractRet).toUpperCase() !== "SUCCESS")
		return false;
	if (d.receipt?.result && String(d.receipt.result).toUpperCase() !== "SUCCESS")
		return false;
	return true;
}

function collectTransfers(data: unknown): TronTransfer[] {
	const out: TronTransfer[] = [];
	const d = (data ?? {}) as TronTxData;
	const candidates = [
		d?.trc20TransferInfo,
		d?.trc20Transfer_info,
		d?.trc20_transfer_info,
		d?.tokenTransferInfo,
		d?.tokenTransfer_info,
		d?.token_transfer_info,
	];
	for (const item of candidates) {
		if (Array.isArray(item)) out.push(...(item as TronTransfer[]));
		else if (item && typeof item === "object") out.push(item as TronTransfer);
	}
	return out;
}

function findValidUsdtTransfer(data: unknown, plan: string) {
	const required = BigInt(Math.round((PLAN_PRICES[plan] || 0) * 1_000_000));
	for (const t of collectTransfers(data)) {
		const contract =
			t.contract_address ||
			t.contractAddress ||
			t.tokenInfo?.tokenId ||
			t.token_info?.tokenId ||
			t.tokenInfo?.contract_address ||
			"";
		const symbol =
			t.symbol ||
			t.tokenInfo?.tokenAbbr ||
			t.token_info?.tokenAbbr ||
			t.tokenInfo?.tokenName ||
			"";
		const to = t.to_address || t.toAddress || t.to || t.to_address_tag || "";
		const decimals = Number(
			t.decimals ||
				t.tokenInfo?.tokenDecimal ||
				t.token_info?.tokenDecimal ||
				6,
		);
		const amountRaw =
			t.amount_str || t.amountStr || t.quant || t.amount || t.value || "0";
		const amountBase = toBaseUnits(
			amountRaw,
			Number.isFinite(decimals) ? decimals : 6,
		);
		const isUsdt =
			sameAddress(contract, TRON_USDT_CONTRACT) ||
			String(symbol).toUpperCase().includes("USDT");
		if (
			isUsdt &&
			sameAddress(to, USDT_TRC20_ADDRESS) &&
			amountBase >= required
		) {
			return { amountBase, amountUsdt: Number(amountBase) / 1_000_000 };
		}
	}
	return null;
}

export const paymentsRouter = {
	// POST /api/verify-crypto-payment equivalent (login required).
	verifyCrypto: protectedProcedure
		.input(
			z.object({
				plan: z.enum(["gu_master", "gu_immortal", "venerable"]),
				txHash: z.string().min(24).max(120),
				deviceId: z.string().max(180).optional().default(""),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, session } = context;
			const user = session?.user;
			if (!user) throw new Error("Unauthorized");
			const { plan } = input;
			const txHash = input.txHash.trim().replace(/\s+/g, "");
			const deviceId = input.deviceId.trim();

			const profileRows = await db
				.select()
				.from(profiles)
				.where(eq(profiles.id, user.id))
				.limit(1);
			let profile = profileRows[0];
			if (!profile) {
				const created = await db
					.insert(profiles)
					.values({
						id: user.id,
						email: user.email ?? null,
						username: "",
						tier: "mortal",
						lastResetDate: todayKey(),
						collectedGu: [],
					})
					.returning();
				const fresh = created[0];
				if (!fresh)
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Could not create profile",
					});
				profile = fresh;
			}

			const txRes = await fetch(
				`${TRONSCAN_TX_URL}?hash=${encodeURIComponent(txHash)}`,
				{ headers: { Accept: "application/json" } },
			);
			const txData = await txRes.json().catch(() => ({}));
			if (!txRes.ok)
				throw new ORPCError("BAD_GATEWAY", {
					message: "Tronscan lookup failed",
				});
			if (!txLooksSuccessful(txData)) {
				throw new ORPCError("BAD_REQUEST", {
					message:
						"Transaction is not confirmed as successful yet. Try again shortly.",
				});
			}
			const valid = findValidUsdtTransfer(txData, plan);
			if (!valid) {
				throw new ORPCError("BAD_REQUEST", {
					message: `Could not find a confirmed ${PLAN_PRICES[plan]} USDT TRC-20 transfer to The Omniarch wallet.`,
				});
			}

			let paymentId: number | null = null;
			try {
				const inserted = await db
					.insert(cryptoPayments)
					.values({
						userId: user.id,
						deviceId: deviceId || null,
						email: user.email ?? null,
						plan,
						amountUsdt: String(valid.amountUsdt),
						requiredUsdt: String(PLAN_PRICES[plan]),
						currency: "USDT",
						network: "TRON_TRC20",
						walletAddress: USDT_TRC20_ADDRESS,
						tokenContract: TRON_USDT_CONTRACT,
						txHash,
						status: "verifying",
						raw: txData,
					})
					.returning({ id: cryptoPayments.id });
				const firstInsert = inserted[0];
				if (!firstInsert)
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Could not record payment",
					});
				paymentId = firstInsert.id;
			} catch (err) {
				const code =
					typeof err === "object" && err !== null
						? String((err as { code?: unknown }).code)
						: "";
				const message = err instanceof Error ? err.message : String(err);
				if (code === "23505" || message.includes("unique")) {
					throw new ORPCError("CONFLICT", {
						message: "This transaction hash has already been used.",
					});
				}
				throw err;
			}

			try {
				const grant = TIER_GRANTS[plan];
				if (!grant)
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Unknown realm",
					});
				const finalTier =
					tierRank(plan) >= tierRank(profile.tier || "mortal")
						? plan
						: profile.tier;
				const updated = await db
					.update(profiles)
					.set({
						tier: finalTier,
						narrationsRemaining: Math.max(
							profile.narrationsRemaining || 0,
							grant.narrations,
						),
						chatsRemaining: Math.max(profile.chatsRemaining || 0, grant.chats),
						updatedAt: new Date(),
					})
					.where(eq(profiles.id, user.id))
					.returning();
				const firstUpdated = first(updated, "profile");

				await db
					.update(cryptoPayments)
					.set({
						status: "approved",
						approvedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(cryptoPayments.id, paymentId));
				await db.insert(transactions).values({
					deviceId: deviceId || user.id,
					email: user.email ?? null,
					username: firstUpdated.username || "",
					reference: txHash,
					amount: Math.round(valid.amountUsdt * 100),
					currency: "USDT_TRC20",
					plan,
					status: "successful_crypto",
				});

				const row = firstUpdated;
				return {
					success: true,
					accountMode: "email",
					tier: row.tier,
					redeemedTier: plan,
					amountUsdt: valid.amountUsdt,
					narrationsRemaining: row.narrationsRemaining || 0,
					chatsRemaining: row.chatsRemaining || 0,
					userEmail: row.email || user.email || "",
					userName: row.username || "",
				};
			} catch (err) {
				await db
					.update(cryptoPayments)
					.set({
						status: "failed",
						failureReason: (err as Error).message,
						updatedAt: new Date(),
					})
					.where(eq(cryptoPayments.id, paymentId));
				throw err;
			}
		}),
};

import { ORPCError } from "@orpc/server";
import type { Database } from "@renzu-bts/db";
import {
	type CodexGu,
	deviceLinks,
	guestUsers,
	paymentCodes,
	profiles,
	transactions,
} from "@renzu-bts/db/schema/renzu";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";

const DAILY_CHAT_LIMIT = 3;
const DAILY_AUDIO_LIMIT = 2;

const TIER_GRANTS: Record<string, { narrations: number; chats: number }> = {
	gu_master: { narrations: 42, chats: 100 },
	gu_immortal: { narrations: 500, chats: 999999 },
	venerable: { narrations: 999999, chats: 999999 },
};

function todayKey() {
	return new Date().toISOString().slice(0, 10);
}

function normalizeTier(tier: unknown) {
	if (
		tier === "mortal" ||
		tier === "gu_master" ||
		tier === "gu_immortal" ||
		tier === "venerable"
	)
		return tier;
	return "mortal";
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

function cleanText(value: unknown, max = 160) {
	return String(value || "")
		.trim()
		.replace(/\s+/g, " ")
		.slice(0, max);
}

function first<T>(rows: T[], what = "record"): T {
	const row = rows[0];
	if (row === undefined)
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: `Could not load ${what}`,
		});
	return row;
}

type ProfileRow = typeof profiles.$inferSelect;
type GuestRow = typeof guestUsers.$inferSelect;
type AccountRow = ProfileRow | GuestRow;

function toFrontend(row: AccountRow, accountMode: "email" | "device") {
	return {
		tier: normalizeTier(row.tier),
		dailyChatUsed: row.dailyChatUsed || 0,
		dailyAudioUsed: row.dailyAudioUsed || 0,
		narrationsRemaining: row.narrationsRemaining || 0,
		chatsRemaining: row.chatsRemaining || 0,
		userEmail: row.email || "",
		userName: row.username || "",
		avatarChoice: row.avatarChoice || "",
		accountMode,
	};
}

async function getOrCreateProfile(
	db: Database,
	userId: string,
	email: string | null,
): Promise<ProfileRow> {
	const existing = await db
		.select()
		.from(profiles)
		.where(eq(profiles.id, userId))
		.limit(1);
	if (existing[0]) return existing[0];
	const created = await db
		.insert(profiles)
		.values({
			id: userId,
			email,
			username: "",
			tier: "mortal",
			dailyChatUsed: 0,
			dailyAudioUsed: 0,
			narrationsRemaining: 0,
			chatsRemaining: 0,
			lastResetDate: todayKey(),
			collectedGu: [],
		})
		.returning();
	return first(created, "profile");
}

async function getOrCreateGuest(
	db: Database,
	deviceId: string,
): Promise<GuestRow> {
	const existing = await db
		.select()
		.from(guestUsers)
		.where(eq(guestUsers.id, deviceId))
		.limit(1);
	if (existing[0]) return existing[0];
	const created = await db
		.insert(guestUsers)
		.values({ id: deviceId, tier: "mortal", lastResetDate: todayKey() })
		.returning();
	return first(created, "guest profile");
}

async function resetDaily(
	db: Database,
	table: "profiles" | "guests",
	id: string,
) {
	const patch = {
		dailyChatUsed: 0,
		dailyAudioUsed: 0,
		lastResetDate: todayKey(),
	};
	if (table === "profiles") {
		await db.update(profiles).set(patch).where(eq(profiles.id, id));
	} else {
		await db.update(guestUsers).set(patch).where(eq(guestUsers.id, id));
	}
}

export const readerRouter = {
	// GET /api/me equivalent. Session (better-auth cookie) wins; deviceId is the guest fallback.
	get: publicProcedure
		.input(z.object({ deviceId: z.string().max(180).optional().default("") }))
		.handler(async ({ input, context }) => {
			const { db, session } = context;
			const deviceId = input.deviceId.trim();

			if (session?.user) {
				let profile = await getOrCreateProfile(
					db,
					session.user.id,
					session.user.email ?? null,
				);
				if (profile.lastResetDate !== todayKey()) {
					await resetDaily(db, "profiles", profile.id);
					profile = {
						...profile,
						dailyChatUsed: 0,
						dailyAudioUsed: 0,
						lastResetDate: todayKey(),
					};
				}
				if (deviceId) {
					const guests = await db
						.select()
						.from(guestUsers)
						.where(eq(guestUsers.id, deviceId))
						.limit(1);
					const guest = guests[0];
					if (guest) {
						const guestTier = normalizeTier(guest.tier);
						const profileTier = normalizeTier(profile.tier);
						const patch: Partial<ProfileRow> = {};
						if (tierRank(guestTier) > tierRank(profileTier))
							patch.tier = guestTier;
						if (
							(guest.narrationsRemaining || 0) >
							(profile.narrationsRemaining || 0)
						)
							patch.narrationsRemaining = guest.narrationsRemaining;
						if ((guest.chatsRemaining || 0) > (profile.chatsRemaining || 0))
							patch.chatsRemaining = guest.chatsRemaining;
						if (!profile.avatarChoice && guest.avatarChoice)
							patch.avatarChoice = guest.avatarChoice;
						if (Object.keys(patch).length > 0) {
							const updated = await db
								.update(profiles)
								.set(patch)
								.where(eq(profiles.id, profile.id))
								.returning();
							profile = first(updated, "profile");
						}
					}
				}
				return toFrontend(profile, "email");
			}

			if (!deviceId)
				throw new ORPCError("BAD_REQUEST", { message: "Missing deviceId" });
			let guest = await getOrCreateGuest(db, deviceId);
			if (guest.lastResetDate !== todayKey()) {
				await resetDaily(db, "guests", deviceId);
				guest = {
					...guest,
					dailyChatUsed: 0,
					dailyAudioUsed: 0,
					lastResetDate: todayKey(),
				};
			}
			return toFrontend(guest, "device");
		}),

	// POST /api/update-profile equivalent.
	update: publicProcedure
		.input(
			z.object({
				deviceId: z.string().max(180).optional().default(""),
				username: z.string().max(60).optional().default(""),
				email: z.string().max(180).optional().default(""),
				avatarChoice: z.string().max(100).optional().default(""),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, session } = context;
			const username = cleanText(input.username, 60);
			const avatarChoice = cleanText(input.avatarChoice, 100);

			if (session?.user) {
				await getOrCreateProfile(
					db,
					session.user.id,
					session.user.email ?? null,
				);
				const patch: Partial<ProfileRow> = {
					username,
					email: session.user.email || cleanText(input.email, 180) || null,
					updatedAt: new Date(),
				};
				if (avatarChoice) patch.avatarChoice = avatarChoice;
				const updated = await db
					.update(profiles)
					.set(patch)
					.where(eq(profiles.id, session.user.id))
					.returning();
				const profile = first(updated, "profile");
				if (input.deviceId.trim()) {
					await db
						.insert(deviceLinks)
						.values({
							deviceId: input.deviceId.trim(),
							userId: session.user.id,
						})
						.onConflictDoUpdate({
							target: deviceLinks.deviceId,
							set: { userId: session.user.id, updatedAt: new Date() },
						});
				}
				return {
					success: true,
					accountMode: "email",
					userName: profile.username || "",
					userEmail: profile.email || "",
					avatarChoice: profile.avatarChoice || "",
				};
			}

			const deviceId = input.deviceId.trim();
			if (!deviceId)
				throw new ORPCError("BAD_REQUEST", { message: "Missing deviceId" });
			await getOrCreateGuest(db, deviceId);
			const patch: Partial<GuestRow> = {
				username,
				email: cleanText(input.email, 180),
			};
			if (avatarChoice) patch.avatarChoice = avatarChoice;
			const updated = await db
				.update(guestUsers)
				.set(patch)
				.where(eq(guestUsers.id, deviceId))
				.returning();
			const guest = first(updated, "guest profile");
			return {
				success: true,
				accountMode: "device",
				userName: guest.username || "",
				userEmail: guest.email || "",
				avatarChoice: guest.avatarChoice || "",
			};
		}),

	// POST /api/link-device equivalent (login required).
	linkDevice: protectedProcedure
		.input(
			z.object({
				deviceId: z.string().min(1).max(180),
				username: z.string().max(80).optional().default(""),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, session } = context;
			const user = session?.user;
			if (!user) throw new Error("Unauthorized");
			await db
				.insert(profiles)
				.values({
					id: user.id,
					email: user.email ?? null,
					username: input.username,
				})
				.onConflictDoNothing();
			await db
				.insert(deviceLinks)
				.values({ deviceId: input.deviceId.trim(), userId: user.id })
				.onConflictDoUpdate({
					target: deviceLinks.deviceId,
					set: { userId: user.id, updatedAt: new Date() },
				});
			const rows = await db
				.select()
				.from(profiles)
				.where(eq(profiles.id, user.id))
				.limit(1);
			return {
				success: true,
				profile: rows[0] ? toFrontend(rows[0], "email") : null,
			};
		}),

	// POST /api/use-credit equivalent.
	spend: publicProcedure
		.input(
			z.object({
				deviceId: z.string().max(180).optional().default(""),
				type: z.enum(["chat", "audio"]),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, session } = context;
			const today = todayKey();

			const touch = async (
				table: "profiles" | "guests",
				id: string,
				patch: Partial<ProfileRow> & Partial<GuestRow>,
			) => {
				if (table === "profiles") {
					return first(
						await db
							.update(profiles)
							.set(patch)
							.where(eq(profiles.id, id))
							.returning(),
						"profile",
					);
				}
				return first(
					await db
						.update(guestUsers)
						.set(patch)
						.where(eq(guestUsers.id, id))
						.returning(),
					"guest profile",
				);
			};

			const spendFrom = async (
				table: "profiles" | "guests",
				id: string,
				row: AccountRow,
				accountMode: "email" | "device",
			) => {
				const tier = normalizeTier(row.tier);
				const dailyChatUsed =
					row.lastResetDate === today ? row.dailyChatUsed || 0 : 0;
				const dailyAudioUsed =
					row.lastResetDate === today ? row.dailyAudioUsed || 0 : 0;

				if (tier === "venerable") {
					await touch(table, id, {
						dailyChatUsed: 0,
						dailyAudioUsed: 0,
						lastResetDate: today,
					});
					return {
						success: true,
						tier,
						dailyChatUsed: 0,
						dailyAudioUsed: 0,
						narrationsRemaining: row.narrationsRemaining || 0,
						chatsRemaining: row.chatsRemaining || 0,
						accountMode,
					};
				}
				if (tier === "gu_immortal") {
					if (input.type === "chat") {
						return {
							success: true,
							tier,
							dailyChatUsed,
							dailyAudioUsed,
							narrationsRemaining: row.narrationsRemaining || 0,
							chatsRemaining: row.chatsRemaining || 0,
							accountMode,
						};
					}
					if ((row.narrationsRemaining || 0) > 0) {
						const updated = await touch(table, id, {
							narrationsRemaining: (row.narrationsRemaining || 0) - 1,
							dailyChatUsed,
							dailyAudioUsed,
							lastResetDate: today,
						});
						return { ...toFrontend(updated, accountMode), success: true };
					}
					throw new ORPCError("PAYMENT_REQUIRED", {
						message: "Narrations exhausted",
					});
				}
				if (tier === "gu_master") {
					if (input.type === "audio") {
						if ((row.narrationsRemaining || 0) > 0) {
							const updated = await touch(table, id, {
								narrationsRemaining: (row.narrationsRemaining || 0) - 1,
								dailyChatUsed,
								dailyAudioUsed,
								lastResetDate: today,
							});
							return { ...toFrontend(updated, accountMode), success: true };
						}
						throw new ORPCError("PAYMENT_REQUIRED", {
							message: "Narrations exhausted",
						});
					}
					if ((row.chatsRemaining || 0) > 0) {
						const updated = await touch(table, id, {
							chatsRemaining: (row.chatsRemaining || 0) - 1,
							dailyChatUsed,
							dailyAudioUsed,
							lastResetDate: today,
						});
						return { ...toFrontend(updated, accountMode), success: true };
					}
					throw new ORPCError("PAYMENT_REQUIRED", {
						message: "Chats exhausted",
					});
				}
				if (input.type === "audio") {
					if (dailyAudioUsed < DAILY_AUDIO_LIMIT) {
						const updated = await touch(table, id, {
							dailyAudioUsed: dailyAudioUsed + 1,
							dailyChatUsed,
							lastResetDate: today,
						});
						return { ...toFrontend(updated, accountMode), success: true };
					}
					throw new ORPCError("PAYMENT_REQUIRED", {
						message: "Daily audio limit reached",
					});
				}
				if (dailyChatUsed < DAILY_CHAT_LIMIT) {
					const updated = await touch(table, id, {
						dailyChatUsed: dailyChatUsed + 1,
						dailyAudioUsed,
						lastResetDate: today,
					});
					return { ...toFrontend(updated, accountMode), success: true };
				}
				throw new ORPCError("PAYMENT_REQUIRED", {
					message: "Daily chat limit reached",
				});
			};

			if (session?.user) {
				const profile = await getOrCreateProfile(
					db,
					session.user.id,
					session.user.email ?? null,
				);
				return spendFrom("profiles", session.user.id, profile, "email");
			}

			const deviceId = input.deviceId.trim();
			if (!deviceId)
				throw new ORPCError("BAD_REQUEST", { message: "Missing deviceId" });
			const links = await db
				.select()
				.from(deviceLinks)
				.where(eq(deviceLinks.deviceId, deviceId))
				.limit(1);
			if (links[0]) {
				throw new ORPCError("UNAUTHORIZED", {
					message:
						"This device is linked to an account. Login to continue using AI or narration.",
				});
			}
			const guest = await getOrCreateGuest(db, deviceId);
			return spendFrom("guests", deviceId, guest, "device");
		}),

	// POST /api/redeem-code equivalent (login required).
	redeem: protectedProcedure
		.input(
			z.object({
				deviceId: z.string().max(180).optional().default(""),
				code: z.string().min(1).max(120),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, session } = context;
			const user = session?.user;
			if (!user) throw new Error("Unauthorized");
			const code = input.code.trim().toLowerCase();

			const grantRealm = async (tier: string) => {
				const grant = TIER_GRANTS[tier];
				if (!grant)
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "Token has an unrecognized realm.",
					});
				let profile = await getOrCreateProfile(db, user.id, user.email ?? null);
				const finalTier =
					tierRank(tier) >= tierRank(normalizeTier(profile.tier))
						? tier
						: normalizeTier(profile.tier);
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
				profile = first(updated, "profile");
				if (input.deviceId.trim()) {
					await db
						.insert(deviceLinks)
						.values({ deviceId: input.deviceId.trim(), userId: user.id })
						.onConflictDoNothing();
				}
				await db.insert(transactions).values({
					deviceId: input.deviceId.trim() || user.id,
					email: user.email ?? null,
					username: "",
					reference: code,
					amount: 0,
					currency: "NGN",
					plan: tier,
					status: "redeemed_via_code_email_account",
				});
				return {
					success: true,
					accountMode: "email",
					tier: profile.tier,
					redeemedTier: tier,
					narrationsRemaining: profile.narrationsRemaining || 0,
					chatsRemaining: profile.chatsRemaining || 0,
					userEmail: profile.email || user.email || "",
					userName: profile.username || "",
				};
			};

			const ownerGrantCode = String(process.env.OWNER_GRANT_CODE || "")
				.trim()
				.toLowerCase();
			if (ownerGrantCode && code === ownerGrantCode)
				return grantRealm("venerable");

			const rows = await db
				.select()
				.from(paymentCodes)
				.where(eq(paymentCodes.code, code))
				.limit(1);
			const codeRow = rows[0];
			if (!codeRow)
				throw new ORPCError("NOT_FOUND", { message: "Invalid token." });
			if (codeRow.used)
				throw new ORPCError("CONFLICT", {
					message: "This token has already been redeemed.",
				});
			const tier = normalizeTier(codeRow.tier);
			if (!TIER_GRANTS[tier])
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Token has an unrecognized realm.",
				});

			// Atomic claim: only one redeemer can flip used=false -> true.
			const claimed = await db
				.update(paymentCodes)
				.set({ used: true, deviceId: input.deviceId.trim() || null })
				.where(and(eq(paymentCodes.code, code), eq(paymentCodes.used, false)))
				.returning();
			first(claimed, "realm token");

			return grantRealm(tier);
		}),

	// GET /api/get-code equivalent: poll a Flutterwave reference until the webhook mints the token.
	pollToken: publicProcedure
		.input(z.object({ reference: z.string().min(1).max(220) }))
		.handler(async ({ input, context }) => {
			const { db } = context;
			const ref = input.reference.trim();
			const byNew = await db
				.select()
				.from(paymentCodes)
				.where(eq(paymentCodes.paymentReference, ref))
				.limit(1);
			const row =
				byNew[0] ||
				(
					await db
						.select()
						.from(paymentCodes)
						.where(eq(paymentCodes.paystackReference, ref))
						.limit(1)
				)[0];
			if (!row)
				throw new ORPCError("NOT_FOUND", {
					message: "Realm token not ready yet",
				});
			return {
				code: row.code,
				tier: row.tier,
				used: row.used,
				label: "Realm Token",
			};
		}),

	// Codex collection sync (GET+POST /api/collection equivalent).
	collection: {
		get: protectedProcedure.handler(async ({ context }) => {
			const profile = await getOrCreateProfile(
				context.db,
				// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
				context.session!.user.id,
				// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
				context.session!.user.email ?? null,
			);
			const list = Array.isArray(profile.collectedGu)
				? (profile.collectedGu as CodexGu[])
				: [];
			return { success: true, collectedGu: list };
		}),
		save: protectedProcedure
			.input(
				z.object({
					collectedGu: z
						.array(
							z.object({
								id: z.string().min(1).max(80),
								name: z.string().max(160).optional().default(""),
								symbol: z.string().max(16).optional().default(""),
								lore: z.string().max(500).optional().default(""),
								tier: z.string().max(40).optional().default("gu_master"),
								discoveredAt: z.number().optional(),
								source: z.string().max(120).optional().default(""),
								isMain: z.boolean().optional().default(false),
							}),
						)
						.max(2000),
				}),
			)
			.handler(async ({ input, context }) => {
				const { db, session } = context;
				const user = session?.user;
				if (!user) throw new Error("Unauthorized");
				const profile = await getOrCreateProfile(
					db,
					user.id,
					user.email ?? null,
				);
				const existing = (
					Array.isArray(profile.collectedGu) ? profile.collectedGu : []
				) as CodexGu[];
				const map = new Map<string, CodexGu>();
				for (const item of [...existing, ...input.collectedGu]) {
					if (!item?.id) continue;
					const prev = map.get(item.id) || ({} as CodexGu);
					map.set(item.id, {
						...prev,
						...item,
						discoveredAt: item.discoveredAt || prev.discoveredAt || Date.now(),
					});
				}
				const merged = Array.from(map.values());
				await db
					.update(profiles)
					.set({ collectedGu: merged, updatedAt: new Date() })
					.where(eq(profiles.id, user.id));
				return { success: true, collectedGu: merged };
			}),
	},

	config: publicProcedure.handler(() => ({
		siteUrl:
			process.env.PUBLIC_SITE_URL ||
			"https://thelegendsofrenzu.theomniarch.com.ng",
	})),
};

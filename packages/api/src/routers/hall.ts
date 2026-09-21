import { ORPCError } from "@orpc/server";
import { hallVenerables, profiles } from "@renzu-bts/db/schema/renzu";
import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";

const FOUNDER_EMAIL = "omniarchportal@gmail.com";

function cleanAvatarChoice(value: unknown) {
	const raw = String(value || "avatar_01").trim();
	if (/^avatar_\d{2}$/.test(raw)) return raw;
	if (/^\d{2}$/.test(raw)) return `avatar_${raw}`;
	return "avatar_01";
}

function normalize(row: typeof hallVenerables.$inferSelect) {
	return {
		id: row.id,
		userId: row.id,
		username: row.username || "Unnamed Venerable",
		title: row.title || "Venerable",
		avatarChoice: row.avatarChoice || "avatar_01",
		avatarId: row.avatarChoice || "avatar_01",
		codexCount: row.codexCount || 0,
		totalGu: row.totalGu || 0,
		isMyriad: !!row.isMyriad,
		displayOrder: row.displayOrder ?? 100,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const hallRouter = {
	list: publicProcedure.handler(async ({ context }) => {
		const { db, session } = context;
		const rows = await db
			.select()
			.from(hallVenerables)
			.orderBy(
				asc(hallVenerables.displayOrder),
				desc(hallVenerables.isMyriad),
				desc(hallVenerables.codexCount),
				asc(hallVenerables.createdAt),
			)
			.limit(100);
		const entries = rows.map(normalize);
		let optedIn = false;
		let myEntry: ReturnType<typeof normalize> | null = null;
		if (session?.user) {
			const mine = await db
				.select()
				.from(hallVenerables)
				.where(eq(hallVenerables.id, session.user.id))
				.limit(1);
			if (mine[0]) {
				optedIn = true;
				myEntry = normalize(mine[0]);
			}
		}
		return { success: true, entries, list: entries, optedIn, myEntry };
	}),

	opt: protectedProcedure
		.input(
			z.object({
				optIn: z.boolean(),
				avatarChoice: z.string().max(20).optional().default("avatar_01"),
				username: z.string().max(80).optional().default(""),
				codexCount: z.number().int().min(0).optional(),
				totalGu: z.number().int().min(0).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db, session } = context;
			const user = session?.user;
			if (!user) throw new Error("Unauthorized");

			if (!input.optIn) {
				await db.delete(hallVenerables).where(eq(hallVenerables.id, user.id));
				const rows = await db
					.select()
					.from(hallVenerables)
					.orderBy(asc(hallVenerables.displayOrder))
					.limit(100);
				const entries = rows.map(normalize);
				return {
					success: true,
					optedIn: false,
					entries,
					list: entries,
					myEntry: null,
				};
			}

			const profileRows = await db
				.select()
				.from(profiles)
				.where(eq(profiles.id, user.id))
				.limit(1);
			const profile = profileRows[0];
			if (!profile)
				throw new ORPCError("NOT_FOUND", { message: "Profile not found." });
			if (profile.tier !== "venerable")
				throw new ORPCError("FORBIDDEN", {
					message: "Venerable realm required.",
				});

			const avatarChoice = cleanAvatarChoice(
				input.avatarChoice || profile.avatarChoice,
			);
			const collectedGu = Array.isArray(profile.collectedGu)
				? profile.collectedGu
				: [];
			const codexCount =
				input.codexCount !== undefined
					? Math.max(0, input.codexCount)
					: collectedGu.filter((g) => g && g.status !== "trace").length;
			const totalGu =
				input.totalGu !== undefined ? Math.max(0, input.totalGu) : 0;
			const email = String(profile.email || user.email || "").toLowerCase();
			const isFounder = email === FOUNDER_EMAIL;
			const finalTotalGu = totalGu || codexCount;
			const finalCodexCount =
				isFounder && finalTotalGu > 0 ? finalTotalGu : codexCount;
			const isMyriad =
				isFounder || (finalTotalGu > 0 && finalCodexCount >= finalTotalGu);
			const username = isFounder
				? "The Omniarch"
				: String(
						profile.username ||
							input.username ||
							user.email ||
							"Unnamed Venerable",
					)
						.trim()
						.slice(0, 80);

			await db
				.update(profiles)
				.set({ avatarChoice, updatedAt: new Date() })
				.where(eq(profiles.id, user.id));

			const saved = await db
				.insert(hallVenerables)
				.values({
					id: user.id,
					username,
					title: isFounder ? "Founder · Supreme Venerable" : "Venerable",
					avatarChoice,
					codexCount: finalCodexCount,
					totalGu: finalTotalGu,
					isMyriad,
					displayOrder: isFounder ? 0 : 100,
					updatedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: hallVenerables.id,
					set: {
						username,
						title: isFounder ? "Founder · Supreme Venerable" : "Venerable",
						avatarChoice,
						codexCount: finalCodexCount,
						totalGu: finalTotalGu,
						isMyriad,
						displayOrder: isFounder ? 0 : 100,
						updatedAt: new Date(),
					},
				})
				.returning();

			const rows = await db
				.select()
				.from(hallVenerables)
				.orderBy(
					asc(hallVenerables.displayOrder),
					desc(hallVenerables.isMyriad),
					desc(hallVenerables.codexCount),
					asc(hallVenerables.createdAt),
				)
				.limit(100);
			const entries = rows.map(normalize);
			const entry = saved[0] ? normalize(saved[0]) : null;
			return {
				success: true,
				optedIn: true,
				entry,
				myEntry: entry,
				entries,
				list: entries,
			};
		}),
};

import {
	annotations,
	bookmarks,
	highlights,
	notes,
	readingProgress,
} from "@renzu-bts/db/schema/renzu";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

const chapterRef = {
	chapterNum: z.string().min(1).max(40),
	chapterTitle: z.string().max(200),
	sentenceIdx: z.number().int(),
};

export const libraryRouter = {
	bookmarks: {
		list: protectedProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select()
				.from(bookmarks)
				// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
				.where(eq(bookmarks.userId, context.session!.user.id))
				.orderBy(desc(bookmarks.createdAt));
			return { success: true, bookmarks: rows };
		}),
		save: protectedProcedure
			.input(
				z.object({
					type: z.enum(["chapter", "sentence"]).optional().default("chapter"),
					...chapterRef,
					sentenceIdx: z.number().int().optional().default(-1),
					text: z.string().max(2000).optional().default(""),
				}),
			)
			.handler(async ({ input, context }) => {
				const { db, session } = context;
				const userId = session?.user.id;
				if (!userId) throw new Error("Unauthorized");
				const existing = await db
					.select()
					.from(bookmarks)
					.where(
						and(
							eq(bookmarks.userId, userId),
							eq(bookmarks.type, input.type),
							eq(bookmarks.chapterNum, input.chapterNum),
							eq(bookmarks.sentenceIdx, input.sentenceIdx),
						),
					)
					.limit(1);
				if (existing[0]) return { success: true, bookmark: existing[0] };
				const created = await db
					.insert(bookmarks)
					.values({
						userId,
						type: input.type,
						chapterNum: input.chapterNum,
						chapterTitle: input.chapterTitle,
						sentenceIdx: input.sentenceIdx,
						text: input.text,
					})
					.returning();
				return { success: true, bookmark: created[0] };
			}),
		remove: protectedProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				await context.db.delete(bookmarks).where(
					and(
						eq(bookmarks.id, input.id),
						// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
						eq(bookmarks.userId, context.session!.user.id),
					),
				);
				return { success: true };
			}),
	},

	annotations: {
		list: protectedProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select()
				.from(annotations)
				// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
				.where(eq(annotations.userId, context.session!.user.id))
				.orderBy(desc(annotations.updatedAt));
			return { success: true, annotations: rows };
		}),
		save: protectedProcedure
			.input(
				z.object({
					type: z.enum(["highlight", "note"]).optional().default("highlight"),
					...chapterRef,
					text: z.string().max(4000).optional().default(""),
					note: z.string().max(4000).optional().default(""),
					color: z.string().max(24).optional().default("gold"),
				}),
			)
			.handler(async ({ input, context }) => {
				const { db, session } = context;
				const userId = session?.user.id;
				if (!userId) throw new Error("Unauthorized");
				const existing = await db
					.select()
					.from(annotations)
					.where(
						and(
							eq(annotations.userId, userId),
							eq(annotations.type, input.type),
							eq(annotations.chapterNum, input.chapterNum),
							eq(annotations.sentenceIdx, input.sentenceIdx),
						),
					)
					.limit(1);
				if (existing[0]) {
					const updated = await db
						.update(annotations)
						.set({
							text: input.text,
							note: input.note,
							color: input.color,
							chapterTitle: input.chapterTitle,
							updatedAt: new Date(),
						})
						.where(eq(annotations.id, existing[0].id))
						.returning();
					return { success: true, annotation: updated[0] };
				}
				const created = await db
					.insert(annotations)
					.values({
						userId,
						type: input.type,
						chapterNum: input.chapterNum,
						chapterTitle: input.chapterTitle,
						sentenceIdx: input.sentenceIdx,
						text: input.text,
						note: input.note,
						color: input.color,
					})
					.returning();
				return { success: true, annotation: created[0] };
			}),
		remove: protectedProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				await context.db.delete(annotations).where(
					and(
						eq(annotations.id, input.id),
						// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
						eq(annotations.userId, context.session!.user.id),
					),
				);
				return { success: true };
			}),
	},

	highlights: {
		list: protectedProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select()
				.from(highlights)
				// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
				.where(eq(highlights.userId, context.session!.user.id))
				.orderBy(desc(highlights.updatedAt));
			return { success: true, highlights: rows };
		}),
		save: protectedProcedure
			.input(
				z.object({
					...chapterRef,
					text: z.string().max(4000).optional().default(""),
					color: z.string().max(24).optional().default("gold"),
				}),
			)
			.handler(async ({ input, context }) => {
				const { db, session } = context;
				const userId = session?.user.id;
				if (!userId) throw new Error("Unauthorized");
				const existing = await db
					.select()
					.from(highlights)
					.where(
						and(
							eq(highlights.userId, userId),
							eq(highlights.chapterNum, input.chapterNum),
							eq(highlights.sentenceIdx, input.sentenceIdx),
						),
					)
					.limit(1);
				if (existing[0]) {
					const updated = await db
						.update(highlights)
						.set({
							text: input.text,
							color: input.color,
							chapterTitle: input.chapterTitle,
							updatedAt: new Date(),
						})
						.where(eq(highlights.id, existing[0].id))
						.returning();
					return { success: true, highlight: updated[0] };
				}
				const created = await db
					.insert(highlights)
					.values({
						userId,
						chapterNum: input.chapterNum,
						chapterTitle: input.chapterTitle,
						sentenceIdx: input.sentenceIdx,
						text: input.text,
						color: input.color,
					})
					.returning();
				return { success: true, highlight: created[0] };
			}),
		remove: protectedProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				await context.db.delete(highlights).where(
					and(
						eq(highlights.id, input.id),
						// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
						eq(highlights.userId, context.session!.user.id),
					),
				);
				return { success: true };
			}),
	},

	notes: {
		list: protectedProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select()
				.from(notes)
				// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
				.where(eq(notes.userId, context.session!.user.id))
				.orderBy(desc(notes.updatedAt));
			return { success: true, notes: rows };
		}),
		save: protectedProcedure
			.input(
				z.object({
					...chapterRef,
					text: z.string().max(4000).optional().default(""),
					note: z.string().min(1).max(8000),
				}),
			)
			.handler(async ({ input, context }) => {
				const { db, session } = context;
				const userId = session?.user.id;
				if (!userId) throw new Error("Unauthorized");
				const existing = await db
					.select()
					.from(notes)
					.where(
						and(
							eq(notes.userId, userId),
							eq(notes.chapterNum, input.chapterNum),
							eq(notes.sentenceIdx, input.sentenceIdx),
						),
					)
					.limit(1);
				if (existing[0]) {
					const updated = await db
						.update(notes)
						.set({
							text: input.text,
							note: input.note,
							chapterTitle: input.chapterTitle,
							updatedAt: new Date(),
						})
						.where(eq(notes.id, existing[0].id))
						.returning();
					return { success: true, note: updated[0] };
				}
				const created = await db
					.insert(notes)
					.values({
						userId,
						chapterNum: input.chapterNum,
						chapterTitle: input.chapterTitle,
						sentenceIdx: input.sentenceIdx,
						text: input.text,
						note: input.note,
					})
					.returning();
				return { success: true, note: created[0] };
			}),
		remove: protectedProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				await context.db.delete(notes).where(
					and(
						eq(notes.id, input.id),
						// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
						eq(notes.userId, context.session!.user.id),
					),
				);
				return { success: true };
			}),
	},

	progress: {
		list: protectedProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select()
				.from(readingProgress)
				// biome-ignore lint/style/noNonNullAssertion: protectedProcedure requireAuth guarantees a session
				.where(eq(readingProgress.userId, context.session!.user.id))
				.orderBy(desc(readingProgress.updatedAt));
			return { success: true, progress: rows };
		}),
		save: protectedProcedure
			.input(
				z.object({
					chapterNum: z.string().min(1).max(40),
					chapterTitle: z.string().max(200),
					scrollPercent: z.number().int().min(0).max(100).optional().default(0),
					completed: z.boolean().optional().default(false),
				}),
			)
			.handler(async ({ input, context }) => {
				const { db, session } = context;
				const userId = session?.user.id;
				if (!userId) throw new Error("Unauthorized");
				const existing = await db
					.select()
					.from(readingProgress)
					.where(
						and(
							eq(readingProgress.userId, userId),
							eq(readingProgress.chapterNum, input.chapterNum),
						),
					)
					.limit(1);
				if (existing[0]) {
					const updated = await db
						.update(readingProgress)
						.set({
							chapterTitle: input.chapterTitle,
							scrollPercent: input.scrollPercent,
							completed: input.completed,
							updatedAt: new Date(),
						})
						.where(eq(readingProgress.id, existing[0].id))
						.returning();
					return { success: true, progress: updated[0] };
				}
				const created = await db
					.insert(readingProgress)
					.values({
						userId,
						chapterNum: input.chapterNum,
						chapterTitle: input.chapterTitle,
						scrollPercent: input.scrollPercent,
						completed: input.completed,
					})
					.returning();
				return { success: true, progress: created[0] };
			}),
	},
};

import {
	categories,
	mediaAssets,
	posts,
	postsToTags,
	tags,
} from "@renzu-bts/db/schema/blog";
import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

const postType = z.enum(["chapter", "guide", "character", "theme", "post"]);

async function tagsForPosts(
	// biome-ignore lint/suspicious/noExplicitAny: drizzle db type varies by caller
	db: any,
	postIds: string[],
) {
	if (postIds.length === 0)
		return new Map<string, { id: string; name: string; slug: string }[]>();
	const links = (await db
		.select()
		.from(postsToTags)
		.where(inArray(postsToTags.postId, postIds))) as {
		postId: string;
		tagId: string;
	}[];
	const tagIds: string[] = [...new Set(links.map((l) => l.tagId))];
	if (tagIds.length === 0) return new Map();
	const tagRows = (await db
		.select()
		.from(tags)
		.where(inArray(tags.id, tagIds))) as {
		id: string;
		name: string;
		slug: string;
	}[];
	const byId = new Map(tagRows.map((t) => [t.id, t]));
	const out = new Map<string, { id: string; name: string; slug: string }[]>();
	for (const link of links) {
		const t = byId.get(link.tagId);
		if (!t) continue;
		const arr = out.get(link.postId) || [];
		arr.push({ id: t.id, name: t.name, slug: t.slug });
		out.set(link.postId, arr);
	}
	return out;
}

export const blogRouter = {
	/** Published posts for the public site. */
	list: publicProcedure
		.input(
			z.object({
				type: postType.optional(),
				search: z.string().max(200).optional().default(""),
				categoryId: z.string().optional(),
				tagSlug: z.string().optional(),
				featured: z.boolean().optional(),
				limit: z.number().int().min(1).max(100).optional().default(20),
				offset: z.number().int().min(0).optional().default(0),
			}),
		)
		.handler(async ({ input, context }) => {
			const { db } = context;
			const filters = [eq(posts.status, "published")];
			if (input.type) filters.push(eq(posts.type, input.type));
			if (input.categoryId)
				filters.push(eq(posts.categoryId, input.categoryId));
			if (input.featured !== undefined)
				filters.push(eq(posts.featured, input.featured));
			if (input.search) {
				const q = `%${input.search}%`;
				const cond = or(ilike(posts.title, q), ilike(posts.excerpt, q));
				if (cond) filters.push(cond);
			}
			let postIds: string[] | undefined;
			if (input.tagSlug) {
				const tagRows = await db
					.select()
					.from(tags)
					.where(eq(tags.slug, input.tagSlug))
					.limit(1);
				if (!tagRows[0]) return { success: true, posts: [], total: 0 };
				const links = await db
					.select()
					.from(postsToTags)
					.where(eq(postsToTags.tagId, tagRows[0].id));
				postIds = links.map((l) => l.postId);
				if (postIds.length === 0) return { success: true, posts: [], total: 0 };
				filters.push(inArray(posts.id, postIds));
			}
			const rows = await db
				.select()
				.from(posts)
				.where(and(...filters))
				.orderBy(
					desc(posts.featured),
					asc(posts.orderIndex),
					desc(posts.publishedAt),
				)
				.limit(input.limit)
				.offset(input.offset);
			const totalRows = await db
				.select({ value: count() })
				.from(posts)
				.where(and(...filters));
			const tagMap = await tagsForPosts(
				db,
				rows.map((r) => r.id),
			);
			return {
				success: true,
				posts: rows.map((r) => ({ ...r, tags: tagMap.get(r.id) || [] })),
				total: totalRows[0]?.value || 0,
			};
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string().min(1).max(200) }))
		.handler(async ({ input, context }) => {
			const rows = await context.db
				.select()
				.from(posts)
				.where(and(eq(posts.slug, input.slug), eq(posts.status, "published")))
				.limit(1);
			const post = rows[0];
			if (!post) return { success: false as const, post: null };
			const tagMap = await tagsForPosts(context.db, [post.id]);
			let category = null;
			if (post.categoryId) {
				const cat = await context.db
					.select()
					.from(categories)
					.where(eq(categories.id, post.categoryId))
					.limit(1);
				category = cat[0] || null;
			}
			return {
				success: true as const,
				post: { ...post, tags: tagMap.get(post.id) || [], category },
			};
		}),

	related: publicProcedure
		.input(
			z.object({
				id: z.string().min(1),
				type: postType.optional(),
				limit: z.number().int().min(1).max(12).optional().default(4),
			}),
		)
		.handler(async ({ input, context }) => {
			const filters = [eq(posts.status, "published")];
			if (input.type) filters.push(eq(posts.type, input.type));
			const rows = await context.db
				.select()
				.from(posts)
				.where(and(...filters))
				.orderBy(desc(posts.publishedAt))
				.limit(input.limit + 1);
			return {
				success: true,
				posts: rows.filter((r) => r.id !== input.id).slice(0, input.limit),
			};
		}),

	categories: {
		list: publicProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select()
				.from(categories)
				.orderBy(asc(categories.name));
			return { success: true, categories: rows };
		}),
	},

	tags: {
		list: publicProcedure.handler(async ({ context }) => {
			const rows = await context.db.select().from(tags).orderBy(asc(tags.name));
			return { success: true, tags: rows };
		}),
	},

	assets: {
		byPost: publicProcedure
			.input(z.object({ postId: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				const rows = await context.db
					.select()
					.from(mediaAssets)
					.where(eq(mediaAssets.postId, input.postId))
					.orderBy(desc(mediaAssets.createdAt));
				return { success: true, assets: rows };
			}),
	},
};

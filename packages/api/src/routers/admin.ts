import { user } from "@renzu-bts/db/schema/auth";
import {
	categories,
	mediaAssets,
	posts,
	postsToTags,
	tags,
} from "@renzu-bts/db/schema/blog";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, superAdminProcedure } from "../index";

export const slugSchema = z
	.string()
	.min(1)
	.max(200)
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		"Slug must be lowercase letters, numbers and dashes",
	);

const postType = z.enum(["chapter", "guide", "character", "theme", "post"]);
const postStatus = z.enum(["draft", "published", "archived"]);
const videoProvider = z.enum(["none", "upload", "youtube", "external"]);

const postInput = z.object({
	slug: slugSchema,
	type: postType.optional().default("post"),
	num: z.string().max(20).optional(),
	title: z.string().min(1).max(300),
	excerpt: z.string().max(2000).optional().default(""),
	content: z.string().max(500000).optional().default(""),
	coverImageUrl: z.string().max(2000).optional(),
	coverImagePath: z.string().max(1000).optional(),
	coverImageAlt: z.string().max(300).optional().default(""),
	videoUrl: z.string().max(2000).optional(),
	videoStoragePath: z.string().max(1000).optional(),
	videoProvider: videoProvider.optional().default("none"),
	status: postStatus.optional().default("draft"),
	featured: z.boolean().optional().default(false),
	orderIndex: z.number().int().min(0).max(100000).optional().default(0),
	categoryId: z.string().min(1).nullable().optional(),
	tagIds: z.array(z.string().min(1)).max(20).optional().default([]),
	seoTitle: z.string().max(300).optional(),
	seoDescription: z.string().max(500).optional(),
});

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 200);
}

export type PostChangeEvent = {
	id: string;
	type: string;
	slug: string;
	status: string;
};

let postChangeHook: ((event: PostChangeEvent) => void) | null = null;

/**
 * Registered by the hosting app (e.g. Next.js) to refresh caches and notify
 * search engines whenever a post is created, updated, published or removed.
 * The api package itself stays runtime-agnostic — the host provides the
 * Next.js-specific revalidation / IndexNow calls.
 */
export function onPostChange(hook: (event: PostChangeEvent) => void) {
	postChangeHook = hook;
}

function emitPostChange(
	post: { id: string; type: string; slug: string; status: string } | undefined,
) {
	if (!post || !postChangeHook) return;
	try {
		postChangeHook({
			id: post.id,
			type: post.type,
			slug: post.slug,
			status: post.status,
		});
	} catch {
		// Notifications must never break publishing.
	}
}

export const adminRouter = {
	stats: adminProcedure.handler(async ({ context }) => {
		const { db } = context;
		const [total, published, drafts, media, users] = await Promise.all([
			db.select({ value: count() }).from(posts),
			db
				.select({ value: count() })
				.from(posts)
				.where(eq(posts.status, "published")),
			db
				.select({ value: count() })
				.from(posts)
				.where(eq(posts.status, "draft")),
			db.select({ value: count() }).from(mediaAssets),
			db.select({ value: count() }).from(user),
		]);
		const byType = await db
			.select({ type: posts.type, value: count() })
			.from(posts)
			.groupBy(posts.type);
		return {
			success: true,
			stats: {
				total: total[0]?.value || 0,
				published: published[0]?.value || 0,
				drafts: drafts[0]?.value || 0,
				media: media[0]?.value || 0,
				users: users[0]?.value || 0,
				byType,
			},
		};
	}),

	posts: {
		list: adminProcedure
			.input(
				z.object({
					type: postType.optional(),
					status: postStatus.optional(),
					search: z.string().max(200).optional().default(""),
					limit: z.number().int().min(1).max(100).optional().default(20),
					offset: z.number().int().min(0).optional().default(0),
				}),
			)
			.handler(async ({ input, context }) => {
				const filters = [];
				if (input.type) filters.push(eq(posts.type, input.type));
				if (input.status) filters.push(eq(posts.status, input.status));
				if (input.search) {
					const q = `%${input.search}%`;
					const cond = or(ilike(posts.title, q), ilike(posts.slug, q));
					if (cond) filters.push(cond);
				}
				const where = filters.length > 0 ? and(...filters) : undefined;
				const rows = await context.db
					.select()
					.from(posts)
					.where(where as never)
					.orderBy(desc(posts.updatedAt))
					.limit(input.limit)
					.offset(input.offset);
				const totalRows = await context.db
					.select({ value: count() })
					.from(posts)
					.where(where as never);
				return { success: true, posts: rows, total: totalRows[0]?.value || 0 };
			}),

		get: adminProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				const rows = await context.db
					.select()
					.from(posts)
					.where(eq(posts.id, input.id))
					.limit(1);
				const post = rows[0];
				if (!post) throw new Error("Post not found");
				const links = await context.db
					.select()
					.from(postsToTags)
					.where(eq(postsToTags.postId, post.id));
				return { success: true, post, tagIds: links.map((l) => l.tagId) };
			}),

		create: adminProcedure
			.input(postInput)
			.handler(async ({ input, context }) => {
				const { db, session } = context;
				const slug = slugify(input.slug) || slugify(input.title);
				const existing = await db
					.select()
					.from(posts)
					.where(eq(posts.slug, slug))
					.limit(1);
				if (existing[0]) throw new Error("Slug already exists");
				const now = new Date();
				const created = await db
					.insert(posts)
					.values({
						slug,
						type: input.type,
						num: input.num || null,
						title: input.title,
						excerpt: input.excerpt || "",
						content: input.content || "",
						coverImageUrl: input.coverImageUrl || null,
						coverImagePath: input.coverImagePath || null,
						coverImageAlt: input.coverImageAlt || "",
						videoUrl: input.videoUrl || null,
						videoStoragePath: input.videoStoragePath || null,
						videoProvider: input.videoProvider,
						status: input.status,
						featured: input.featured,
						orderIndex: input.orderIndex,
						categoryId: input.categoryId || null,
						seoTitle: input.seoTitle || null,
						seoDescription: input.seoDescription || null,
						authorId: session?.user.id || null,
						publishedAt: input.status === "published" ? now : null,
					})
					.returning();
				const post = created[0];
				if (input.tagIds && input.tagIds.length > 0 && post) {
					await db
						.insert(postsToTags)
						.values(input.tagIds.map((tagId) => ({ postId: post.id, tagId })));
				}
				if (post && (post.coverImagePath || post.videoStoragePath)) {
					const bucket = post.coverImagePath ? "blog-images" : "blog-videos";
					const path = (post.coverImagePath || post.videoStoragePath) as string;
					const url = (post.coverImageUrl || post.videoUrl) as string;
					if (path && url) {
						await db.insert(mediaAssets).values({
							bucket,
							path,
							url,
							kind: post.coverImagePath ? "image" : "video",
							postId: post.id,
							uploadedBy: session?.user.id || null,
						});
					}
				}
				emitPostChange(post);
				return { success: true, post };
			}),

		update: adminProcedure
			.input(postInput.partial().extend({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				const { db } = context;
				const { id, tagIds, slug, ...rest } = input;
				const patch: Record<string, unknown> = {
					...rest,
					updatedAt: new Date(),
				};
				if (slug) {
					const clean = slugify(slug);
					const existing = await db
						.select()
						.from(posts)
						.where(eq(posts.slug, clean))
						.limit(1);
					if (existing[0] && existing[0].id !== id)
						throw new Error("Slug already exists");
					patch.slug = clean;
				}
				if (rest.status === "published") patch.publishedAt = new Date();
				Object.keys(patch).forEach(
					(k) => patch[k] === undefined && delete patch[k],
				);
				const updated = await db
					.update(posts)
					.set(patch as never)
					.where(eq(posts.id, id))
					.returning();
				if (tagIds !== undefined) {
					await db.delete(postsToTags).where(eq(postsToTags.postId, id));
					if (tagIds.length > 0) {
						await db
							.insert(postsToTags)
							.values(tagIds.map((tagId) => ({ postId: id, tagId })));
					}
				}
				emitPostChange(updated[0]);
				return { success: true, post: updated[0] };
			}),

		setStatus: adminProcedure
			.input(z.object({ id: z.string().min(1), status: postStatus }))
			.handler(async ({ input, context }) => {
				const updated = await context.db
					.update(posts)
					.set({
						status: input.status,
						publishedAt: input.status === "published" ? new Date() : null,
						updatedAt: new Date(),
					})
					.where(eq(posts.id, input.id))
					.returning();
				emitPostChange(updated[0]);
				return { success: true, post: updated[0] };
			}),

		remove: superAdminProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				const existing = await context.db
					.select()
					.from(posts)
					.where(eq(posts.id, input.id))
					.limit(1);
				await context.db
					.delete(postsToTags)
					.where(eq(postsToTags.postId, input.id));
				await context.db.delete(posts).where(eq(posts.id, input.id));
				if (existing[0]) emitPostChange({ ...existing[0], status: "deleted" });
				return { success: true };
			}),
	},

	categories: {
		list: adminProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select()
				.from(categories)
				.orderBy(asc(categories.name));
			return { success: true, categories: rows };
		}),
		create: adminProcedure
			.input(
				z.object({
					name: z.string().min(1).max(120),
					slug: slugSchema.optional(),
					description: z.string().max(1000).optional().default(""),
				}),
			)
			.handler(async ({ input, context }) => {
				const created = await context.db
					.insert(categories)
					.values({
						name: input.name,
						slug: input.slug || slugify(input.name),
						description: input.description || "",
					})
					.returning();
				return { success: true, category: created[0] };
			}),
		remove: superAdminProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				await context.db.delete(categories).where(eq(categories.id, input.id));
				return { success: true };
			}),
	},

	tags: {
		list: adminProcedure.handler(async ({ context }) => {
			const rows = await context.db.select().from(tags).orderBy(asc(tags.name));
			return { success: true, tags: rows };
		}),
		create: adminProcedure
			.input(
				z.object({
					name: z.string().min(1).max(80),
					slug: slugSchema.optional(),
				}),
			)
			.handler(async ({ input, context }) => {
				const created = await context.db
					.insert(tags)
					.values({ name: input.name, slug: input.slug || slugify(input.name) })
					.returning();
				return { success: true, tag: created[0] };
			}),
		remove: superAdminProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				await context.db
					.delete(postsToTags)
					.where(eq(postsToTags.tagId, input.id));
				await context.db.delete(tags).where(eq(tags.id, input.id));
				return { success: true };
			}),
	},

	media: {
		list: adminProcedure
			.input(
				z.object({
					kind: z.enum(["image", "video"]).optional(),
					limit: z.number().int().min(1).max(100).optional().default(40),
					offset: z.number().int().min(0).optional().default(0),
				}),
			)
			.handler(async ({ input, context }) => {
				const where = input.kind ? eq(mediaAssets.kind, input.kind) : undefined;
				const rows = await context.db
					.select()
					.from(mediaAssets)
					.where(where as never)
					.orderBy(desc(mediaAssets.createdAt))
					.limit(input.limit)
					.offset(input.offset);
				return { success: true, assets: rows };
			}),
		record: adminProcedure
			.input(
				z.object({
					bucket: z.string().min(1).max(100),
					path: z.string().min(1).max(1000),
					url: z.string().min(1).max(2000),
					kind: z.enum(["image", "video"]).optional().default("image"),
					mimeType: z.string().max(120).optional(),
					size: z.number().int().min(0).optional(),
					alt: z.string().max(300).optional().default(""),
					postId: z.string().min(1).optional(),
				}),
			)
			.handler(async ({ input, context }) => {
				const created = await context.db
					.insert(mediaAssets)
					.values({
						bucket: input.bucket,
						path: input.path,
						url: input.url,
						kind: input.kind,
						mimeType: input.mimeType || null,
						size: input.size ?? null,
						alt: input.alt || "",
						postId: input.postId || null,
						uploadedBy: context.session?.user.id || null,
					})
					.returning();
				return { success: true, asset: created[0] };
			}),
		remove: superAdminProcedure
			.input(z.object({ id: z.string().min(1) }))
			.handler(async ({ input, context }) => {
				const rows = await context.db
					.select()
					.from(mediaAssets)
					.where(eq(mediaAssets.id, input.id))
					.limit(1);
				await context.db
					.delete(mediaAssets)
					.where(eq(mediaAssets.id, input.id));
				// Storage object deletion happens in the web API route (service role).
				return { success: true, asset: rows[0] || null };
			}),
	},

	users: {
		list: superAdminProcedure.handler(async ({ context }) => {
			const rows = await context.db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				})
				.from(user)
				.orderBy(asc(user.email))
				.limit(200);
			return { success: true, users: rows };
		}),
		setRole: superAdminProcedure
			.input(
				z.object({
					id: z.string().min(1),
					role: z.enum(["admin", "editor", "reader"]),
				}),
			)
			.handler(async ({ input, context }) => {
				const updated = await context.db
					.update(user)
					.set({ role: input.role })
					.where(eq(user.id, input.id))
					.returning({ id: user.id, email: user.email, role: user.role });
				return { success: true, user: updated[0] };
			}),
	},
};

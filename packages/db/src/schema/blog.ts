import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
};

const uuidPk = () =>
	text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

/** Content type: chapter | guide | character | theme | post */
export const categories = pgTable("categories", {
	id: uuidPk(),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	description: text("description").default("").notNull(),
	...timestamps,
});

export const tags = pgTable("tags", {
	id: uuidPk(),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	...timestamps,
});

export const posts = pgTable(
	"posts",
	{
		id: uuidPk(),
		slug: text("slug").notNull().unique(),
		type: text("type").default("post").notNull(),
		// Legacy chapter number like "1" or "4 & 5" (chapters only)
		num: text("num"),
		title: text("title").notNull(),
		excerpt: text("excerpt").default("").notNull(),
		// Markdown body
		content: text("content").default("").notNull(),
		// Cover image (Supabase Storage public URL + storage path)
		coverImageUrl: text("cover_image_url"),
		coverImagePath: text("cover_image_path"),
		coverImageAlt: text("cover_image_alt").default("").notNull(),
		// Video: either uploaded to Supabase Storage or an external URL (YouTube etc.)
		videoUrl: text("video_url"),
		videoStoragePath: text("video_storage_path"),
		videoProvider: text("video_provider").default("none").notNull(),
		status: text("status").default("draft").notNull(),
		featured: boolean("featured").default(false).notNull(),
		orderIndex: integer("order_index").default(0).notNull(),
		categoryId: text("category_id").references(() => categories.id, {
			onDelete: "set null",
		}),
		seoTitle: text("seo_title"),
		seoDescription: text("seo_description"),
		authorId: text("author_id"),
		publishedAt: timestamp("published_at", { withTimezone: true }),
		...timestamps,
	},
	(table) => [
		uniqueIndex("posts_slug_idx").on(table.slug),
		index("posts_status_idx").on(table.status),
		index("posts_type_idx").on(table.type),
	],
);

export const postsToTags = pgTable("posts_to_tags", {
	postId: text("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	tagId: text("tag_id")
		.notNull()
		.references(() => tags.id, { onDelete: "cascade" }),
});

export const mediaAssets = pgTable(
	"media_assets",
	{
		id: uuidPk(),
		bucket: text("bucket").notNull(),
		path: text("path").notNull(),
		url: text("url").notNull(),
		kind: text("kind").default("image").notNull(),
		mimeType: text("mime_type"),
		size: integer("size"),
		alt: text("alt").default("").notNull(),
		postId: text("post_id").references(() => posts.id, {
			onDelete: "set null",
		}),
		uploadedBy: text("uploaded_by"),
		...timestamps,
	},
	(table) => [index("media_assets_post_idx").on(table.postId)],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;

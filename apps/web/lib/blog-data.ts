import { posts, postsToTags, tags } from "@renzu-bts/db/schema/blog";
import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/server/services";

export type DbPost = typeof posts.$inferSelect;

export async function getPublishedPostBySlug(
	slug: string,
): Promise<
	(DbPost & { tags: { id: string; name: string; slug: string }[] }) | null
> {
	try {
		const rows = await db
			.select()
			.from(posts)
			.where(and(eq(posts.slug, slug), eq(posts.status, "published")))
			.limit(1);
		const post = rows[0];
		if (!post) return null;
		const links = await db
			.select()
			.from(postsToTags)
			.where(eq(postsToTags.postId, post.id));
		let tagRows: { id: string; name: string; slug: string }[] = [];
		if (links.length > 0) {
			tagRows = await db
				.select({ id: tags.id, name: tags.name, slug: tags.slug })
				.from(tags)
				.where(
					inArray(
						tags.id,
						links.map((l) => l.tagId),
					),
				);
		}
		return { ...post, tags: tagRows };
	} catch {
		return null;
	}
}

export async function listPublishedPosts(type?: string, limit = 100) {
	try {
		const where = type
			? and(eq(posts.status, "published"), eq(posts.type, type))
			: eq(posts.status, "published");
		return await db
			.select()
			.from(posts)
			.where(where)
			.orderBy(asc(posts.orderIndex), desc(posts.publishedAt))
			.limit(limit);
	} catch {
		return [];
	}
}

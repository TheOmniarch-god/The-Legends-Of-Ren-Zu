/**
 * One-time migration: static files -> Supabase Postgres (blog tables).
 *
 * Usage:
 *   1. Point DATABASE_URL at Supabase (apps/web/.env) and run `bun run db:push`.
 *   2. bun run blog:seed
 *
 * Safe to re-run: inserts use onConflictDoNothing on slug.
 */
import { categories, createDb, posts } from "@renzu-bts/db";
import { sql } from "drizzle-orm";

import { chapters } from "../apps/web/data/chapters";
import { guidePages } from "../apps/web/data/guides";

const DATABASE_URL = process.env.DATABASE_URL || "";
if (!DATABASE_URL) {
	console.error("DATABASE_URL is not set.");
	process.exit(1);
}

function teaser(body: string, length: number) {
	const flat = body.replace(/\s+/g, " ").trim();
	return flat.length > length ? `${flat.slice(0, length).trim()}…` : flat;
}

function guideType(path: string): "guide" | "character" | "theme" | "post" {
	if (path.startsWith("/characters/")) return "character";
	if (path.startsWith("/themes/")) return "theme";
	if (path.startsWith("/guides/")) return "guide";
	return "post";
}

function slugFromPath(path: string) {
	return path.replace(/^\//, "").replace(/\/$/, "").split("/").pop() || path;
}

const HUB_PATHS = new Set([
	"/guides/",
	"/characters/",
	"/themes/",
	"/chapters/",
	"/about/",
	"/faq/",
]);

async function main() {
	const db = createDb({ DATABASE_URL });
	const now = new Date();

	const categorySeeds = [
		{
			name: "Chapters",
			slug: "chapters",
			description: "The Legends of Ren Zu chapters",
		},
		{
			name: "Guides",
			slug: "guides",
			description: "Reading guides and explainers",
		},
		{ name: "Characters", slug: "characters", description: "Character guides" },
		{ name: "Themes", slug: "themes", description: "Theme guides" },
	];
	for (const c of categorySeeds) {
		await db
			.insert(categories)
			.values(c)
			.onConflictDoNothing({ target: categories.slug });
	}
	const catRows = await db.select().from(categories);
	const catBySlug = new Map(catRows.map((c) => [c.slug, c.id]));

	let chapterCount = 0;
	for (let i = 0; i < chapters.length; i++) {
		const c = chapters[i];
		if (!c) continue;
		await db
			.insert(posts)
			.values({
				slug: c.slug,
				type: "chapter",
				num: c.num,
				title: c.title,
				excerpt: teaser(c.body, 160),
				content: c.body,
				status: "published",
				featured: i < 3,
				orderIndex: i,
				categoryId: catBySlug.get("chapters") || null,
				seoTitle: `Part ${c.num}: ${c.title} | The Legends of Ren Zu`,
				seoDescription: teaser(c.body, 150),
				publishedAt: now,
			})
			.onConflictDoNothing({ target: posts.slug });
		chapterCount++;
	}

	let guideCount = 0;
	for (const [path, page] of Object.entries(guidePages)) {
		if (HUB_PATHS.has(path)) continue;
		const type = guideType(path);
		const slug = slugFromPath(path);
		const catSlug = type === "post" ? undefined : `${type}s`;
		await db
			.insert(posts)
			.values({
				slug,
				type,
				title: page.title.replace(/ \| .*$/, ""),
				excerpt: page.description,
				content: page.markdown,
				status: "published",
				featured: false,
				orderIndex: 0,
				categoryId: (catSlug && catBySlug.get(catSlug)) || null,
				seoTitle: page.title,
				seoDescription: page.description,
				publishedAt: now,
			})
			.onConflictDoNothing({ target: posts.slug });
		guideCount++;
	}

	// Touch updated_at so sitemaps sort sanely
	await db.execute(sql`select 1`);
	console.log(
		`Seeded ${chapterCount} chapters and ${guideCount} guides/characters/themes.`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

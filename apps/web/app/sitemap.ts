import type { MetadataRoute } from "next";

import { chapters } from "@/data/chapters";
import { guidePages } from "@/data/guides";
import { listPublishedPosts } from "@/lib/blog-data";
import { SITE_URL } from "@/lib/seo";

function blogPath(post: { type: string; slug: string }) {
	switch (post.type) {
		case "chapter":
			return `/chapters/${post.slug}`;
		case "guide":
			return `/guides/${post.slug}`;
		case "character":
			return `/characters/${post.slug}`;
		case "theme":
			return `/themes/${post.slug}`;
		default:
			return `/blog/${post.slug}`;
	}
}

/** Strip trailing slash for canonical sitemap URLs (root excepted). */
function canonical(path: string): string {
	if (path === "/") return SITE_URL;
	return `${SITE_URL}${path.replace(/\/+$/, "")}`;
}

// Backstop: refresh the sitemap from the DB at most every 10 minutes.
// Publishing also triggers instant revalidation via the onPostChange hook.
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();
	const chapterUrls: MetadataRoute.Sitemap = chapters.map((c) => ({
		url: canonical(`/chapters/${c.slug}`),
		lastModified: now,
		changeFrequency: "monthly",
		priority: 0.8,
	}));
	// guidePages keys carry trailing slashes internally — normalize for output.
	const guideUrls: MetadataRoute.Sitemap = Object.keys(guidePages).map(
		(path) => ({
			url: canonical(path),
			lastModified: now,
			changeFrequency: "monthly",
			priority: path.match(/\/(guides|characters|themes)\/[^/]+/) ? 0.8 : 0.9,
		}),
	);
	let blogUrls: MetadataRoute.Sitemap = [];
	try {
		const dbPosts = await listPublishedPosts(undefined, 500);
		const seen = new Set<string>();
		blogUrls = dbPosts
			.map((p) => ({
				url: canonical(blogPath(p)),
				lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
				changeFrequency: "weekly" as const,
				priority: 0.8,
			}))
			.filter((entry) => {
				if (seen.has(entry.url)) return false;
				seen.add(entry.url);
				return true;
			});
	} catch {
		blogUrls = [];
	}
	// NOTE: /admin, /dashboard, /login, /api, /ask and /ai are intentionally
	// excluded — thin, private, or interactive content that must not compete
	// in search. They are also disallowed / noindexed at the route level.
	return [
		{
			url: SITE_URL,
			lastModified: now,
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: canonical("/chapters"),
			lastModified: now,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: canonical("/blog"),
			lastModified: now,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: canonical("/guides"),
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: canonical("/characters"),
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: canonical("/themes"),
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: canonical("/about"),
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: canonical("/faq"),
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		...chapterUrls,
		...guideUrls,
		...blogUrls,
	];
}

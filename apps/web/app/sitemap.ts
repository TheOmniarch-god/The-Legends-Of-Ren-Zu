import type { MetadataRoute } from "next";

import { chapters } from "@/data/chapters";
import { guidePages } from "@/data/guides";
import { listPublishedPosts } from "@/lib/blog-data";

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL ||
	"https://thelegendsofrenzu.theomniarch.com.ng";

function blogPath(post: { type: string; slug: string }) {
	switch (post.type) {
		case "chapter":
			return `/chapters/${post.slug}/`;
		case "guide":
			return `/guides/${post.slug}/`;
		case "character":
			return `/characters/${post.slug}/`;
		case "theme":
			return `/themes/${post.slug}/`;
		default:
			return `/blog/${post.slug}/`;
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();
	const chapterUrls = chapters.map((c) => ({
		url: `${SITE_URL}/chapters/${c.slug}/`,
		lastModified: now,
	}));
	const guideUrls = Object.keys(guidePages).map((path) => ({
		url: `${SITE_URL}${path}`,
		lastModified: now,
	}));
	let blogUrls: { url: string; lastModified: Date }[] = [];
	try {
		const dbPosts = await listPublishedPosts(undefined, 500);
		const seen = new Set<string>();
		blogUrls = dbPosts
			.map((p) => ({
				url: `${SITE_URL}${blogPath(p)}`,
				lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
			}))
			.filter((entry) => {
				if (seen.has(entry.url)) return false;
				seen.add(entry.url);
				return true;
			});
	} catch {
		blogUrls = [];
	}
	return [
		{ url: SITE_URL, lastModified: now },
		{ url: `${SITE_URL}/chapters/`, lastModified: now },
		{ url: `${SITE_URL}/blog/`, lastModified: now },
		{ url: `${SITE_URL}/admin/`, lastModified: now },
		{ url: `${SITE_URL}/ask/`, lastModified: now },
		...chapterUrls,
		...guideUrls,
		...blogUrls,
	];
}

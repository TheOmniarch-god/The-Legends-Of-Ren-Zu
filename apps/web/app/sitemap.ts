import type { MetadataRoute } from "next";

import { chapters } from "@/data/chapters";
import { guidePages } from "@/data/guides";

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL ||
	"https://thelegendsofrenzu.theomniarch.com.ng";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();
	const chapterUrls = chapters.map((c) => ({
		url: `${SITE_URL}/chapters/${c.slug}/`,
		lastModified: now,
	}));
	const guideUrls = Object.keys(guidePages).map((path) => ({
		url: `${SITE_URL}${path}`,
		lastModified: now,
	}));
	return [
		{ url: SITE_URL, lastModified: now },
		{ url: `${SITE_URL}/chapters/`, lastModified: now },
		{ url: `${SITE_URL}/ask/`, lastModified: now },
		...chapterUrls,
		...guideUrls,
	];
}

import type { Metadata } from "next";

export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
	"https://thelegendsofrenzu.theomniarch.com.ng";

export const SITE_NAME = "The Legends of Ren Zu";
export const SITE_LOCALE = "en_US";
export const SITE_TWITTER_HANDLE = "@theomniarch";

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
	if (/^https?:\/\//i.test(path)) return path;
	const clean = path.startsWith("/") ? path : `/${path}`;
	return `${SITE_URL}${clean}`;
}

/** Normalize a slug path to a canonical URL (no trailing slash, except root). */
export function canonicalUrl(path: string): string {
	if (path === "/") return SITE_URL;
	const noTrailing = path.replace(/\/+$/, "");
	return absoluteUrl(noTrailing || "/");
}

/** Ensure an image URL is absolute for Open Graph / Twitter cards. */
export function absoluteImageUrl(url?: string | null): string | undefined {
	if (!url) return undefined;
	if (/^https?:\/\//i.test(url)) return url;
	return absoluteUrl(url);
}

/** Site-relative path for a webnovel post, by type (no trailing slash). */
export function postPath(type: string, slug: string): string {
	switch (type) {
		case "chapter":
			return `/chapters/${slug}`;
		case "guide":
			return `/guides/${slug}`;
		case "character":
			return `/characters/${slug}`;
		case "theme":
			return `/themes/${slug}`;
		default:
			return `/blog/${slug}`;
	}
}

/** Keep meta descriptions inside Google's ~155-char display limit. */
export function truncateDescription(
	value?: string | null,
	max = 155,
): string | undefined {
	if (!value) return undefined;
	const clean = value.replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	return `${clean.slice(0, max - 1).trimEnd()}…`;
}

type ArticleMetaInput = {
	path: string;
	title: string;
	description?: string;
	coverImageUrl?: string | null;
	coverImageAlt?: string | null;
	tags?: { name: string }[] | string[];
	publishedAt?: string | Date | null;
	updatedAt?: string | Date | null;
	section?: string;
};

/**
 * Shared builder for dynamic article-type routes (chapters, blog, guides,
 * characters, themes). Guarantees: canonical, Open Graph article, Twitter
 * summary_large_image, robots index/follow.
 */
export function buildArticleMetadata({
	path,
	title,
	description,
	coverImageUrl,
	coverImageAlt,
	tags,
	publishedAt,
	updatedAt,
	section,
}: ArticleMetaInput): Metadata {
	const canonical = canonicalUrl(path);
	const ogImage = absoluteImageUrl(coverImageUrl);
	const tagNames = (tags ?? []).map((t) =>
		typeof t === "string" ? t : t.name,
	);
	const shortDescription = truncateDescription(description);

	return {
		title,
		description: shortDescription,
		alternates: { canonical },
		openGraph: {
			type: "article",
			siteName: SITE_NAME,
			locale: SITE_LOCALE,
			url: canonical,
			title,
			description: shortDescription,
			images: ogImage
				? [
						{
							url: ogImage,
							width: 1200,
							height: 630,
							alt: coverImageAlt || title,
						},
					]
				: undefined,
			publishedTime: publishedAt
				? new Date(publishedAt).toISOString()
				: undefined,
			modifiedTime: updatedAt ? new Date(updatedAt).toISOString() : undefined,
			authors: ["Gu Zhen Ren"],
			section,
			tags: tagNames.length > 0 ? tagNames : undefined,
		},
		twitter: {
			card: ogImage ? "summary_large_image" : "summary",
			site: SITE_TWITTER_HANDLE,
			title,
			description: shortDescription,
			images: ogImage ? [ogImage] : undefined,
		},
		robots: { index: true, follow: true },
	};
}

/** JSON-LD Article graph for a dynamic route. */
export function articleJsonLd({
	path,
	headline,
	description,
	coverImageUrl,
	publishedAt,
	updatedAt,
}: {
	path: string;
	headline: string;
	description?: string;
	coverImageUrl?: string | null;
	updatedAt?: string | Date | null;
	publishedAt?: string | Date | null;
}) {
	const canonical = canonicalUrl(path);
	const image = absoluteImageUrl(coverImageUrl);
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Article",
				"@id": `${canonical}#article`,
				mainEntityOfPage: canonical,
				headline,
				description,
				image: image ? [image] : undefined,
				author: { "@type": "Person", name: "Gu Zhen Ren" },
				publisher: {
					"@type": "Organization",
					name: SITE_NAME,
					url: SITE_URL,
				},
				datePublished: publishedAt
					? new Date(publishedAt).toISOString()
					: undefined,
				dateModified: updatedAt
					? new Date(updatedAt).toISOString()
					: publishedAt
						? new Date(publishedAt).toISOString()
						: undefined,
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{
						"@type": "ListItem",
						position: 1,
						name: "Home",
						item: SITE_URL,
					},
					{
						"@type": "ListItem",
						position: 2,
						name: headline,
						item: canonical,
					},
				],
			},
		],
	};
}

/** JSON-LD BreadcrumbList for hub / static pages. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.name,
			item: canonicalUrl(item.path),
		})),
	};
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog-data";
import { articleJsonLd, buildArticleMetadata } from "@/lib/seo";

const THEME_SLUGS = [
	"hope-gu",
	"fate-and-freedom",
	"wisdom-strength-and-self",
	"fate-gu",
	"freedom-gu",
];

// Allow new admin-published themes to render on demand, then cache.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
	const slugs = new Set(THEME_SLUGS);
	try {
		const dbThemes = await listPublishedPosts("theme", 500);
		for (const post of dbThemes) slugs.add(post.slug);
		for (const key of Object.keys(guidePages)) {
			const match = key.match(/^\/themes\/([^/]+)\/$/);
			if (match?.[1]) slugs.add(match[1]);
		}
	} catch {
		// DB unreachable at build time — fall back to static slugs.
	}
	return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const path = `/themes/${slug}`;
	const post = await getPublishedPostBySlug(slug);
	if (post && post.type === "theme") {
		return buildArticleMetadata({
			path,
			title: post.seoTitle || `${post.title} | The Legends of Ren Zu`,
			description: post.seoDescription || post.excerpt || undefined,
			coverImageUrl: post.coverImageUrl,
			coverImageAlt: post.coverImageAlt,
			tags: post.tags,
			publishedAt: post.publishedAt,
			updatedAt: post.updatedAt,
			section: "Themes",
		});
	}
	const page = guidePages[`/themes/${slug}/`];
	if (!page) return { robots: { index: false, follow: true } };
	return buildArticleMetadata({
		path,
		title: page.title,
		description: page.description,
		section: "Themes",
	});
}

export default async function ThemePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const path = `/themes/${slug}`;
	const post = await getPublishedPostBySlug(slug);
	if (post && post.type === "theme") {
		const jsonLd = articleJsonLd({
			path,
			headline: post.title,
			description: post.seoDescription || post.excerpt || undefined,
			coverImageUrl: post.coverImageUrl,
			publishedAt: post.publishedAt,
			updatedAt: post.updatedAt,
		});
		return (
			<>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				<BlogArticle
					post={{
						slug: post.slug,
						type: post.type,
						title: post.title,
						excerpt: post.excerpt,
						content: post.content,
						coverImageUrl: post.coverImageUrl,
						coverImageAlt: post.coverImageAlt,
						videoUrl: post.videoUrl,
						videoProvider: post.videoProvider,
						tags: post.tags,
					}}
					eyebrow="Theme guide"
					backHref="/themes"
					backLabel="Themes"
				/>
			</>
		);
	}
	const page = guidePages[`/themes/${slug}/`];
	if (!page) notFound();
	const staticJsonLd = articleJsonLd({
		path,
		headline: page.title,
		description: page.description,
	});
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(staticJsonLd) }}
			/>
			<GuideArticle
				eyebrow="Theme guide"
				title={page.title.replace(" | The Legends of Ren Zu Theme Guide", "")}
				lead={page.description}
				markdown={page.markdown}
				backHref="/themes/"
				backLabel="Themes"
			/>
		</>
	);
}

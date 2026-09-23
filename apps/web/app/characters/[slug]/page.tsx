import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog-data";
import { articleJsonLd, buildArticleMetadata } from "@/lib/seo";

const CHARACTER_SLUGS = [
	"ren-zu",
	"verdant-great-sun",
	"desolate-ancient-moon",
	"northern-dark-ice-soul",
	"boundless-forest-samsara",
];

// Allow new admin-published characters to render on demand, then cache.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
	const slugs = new Set(CHARACTER_SLUGS);
	try {
		const dbCharacters = await listPublishedPosts("character", 500);
		for (const post of dbCharacters) slugs.add(post.slug);
		for (const key of Object.keys(guidePages)) {
			const match = key.match(/^\/characters\/([^/]+)\/$/);
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
	const path = `/characters/${slug}`;
	const post = await getPublishedPostBySlug(slug);
	if (post && post.type === "character") {
		return buildArticleMetadata({
			path,
			title: post.seoTitle || `${post.title} | The Legends of Ren Zu`,
			description: post.seoDescription || post.excerpt || undefined,
			coverImageUrl: post.coverImageUrl,
			coverImageAlt: post.coverImageAlt,
			tags: post.tags,
			publishedAt: post.publishedAt,
			updatedAt: post.updatedAt,
			section: "Characters",
		});
	}
	const page = guidePages[`/characters/${slug}/`];
	if (!page) return { robots: { index: false, follow: true } };
	return buildArticleMetadata({
		path,
		title: page.title,
		description: page.description,
		section: "Characters",
	});
}

export default async function CharacterPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const path = `/characters/${slug}`;
	const post = await getPublishedPostBySlug(slug);
	if (post && post.type === "character") {
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
					eyebrow="Character guide"
					backHref="/characters"
					backLabel="Characters"
				/>
			</>
		);
	}
	const page = guidePages[`/characters/${slug}/`];
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
				eyebrow="Character guide"
				title={page.title
					.replace(" | Character Guide", "")
					.replace(" | The Legends of Ren Zu Character Guide", "")}
				lead={page.description}
				markdown={page.markdown}
				backHref="/characters/"
				backLabel="Characters"
			/>
		</>
	);
}

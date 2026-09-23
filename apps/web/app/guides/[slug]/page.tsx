import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog-data";
import { articleJsonLd, buildArticleMetadata } from "@/lib/seo";

const GUIDE_SLUGS = [
	"reading-order",
	"ren-zu-summary",
	"the-legends-of-ren-zu-explained",
	"best-ren-zu-chapters",
	"hope-gu-meaning",
];

// Allow new admin-published guides to render on demand, then cache.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
	const slugs = new Set(GUIDE_SLUGS);
	try {
		const dbGuides = await listPublishedPosts("guide", 500);
		for (const post of dbGuides) slugs.add(post.slug);
		// Static guide pages baked into guidePages data.
		for (const key of Object.keys(guidePages)) {
			const match = key.match(/^\/guides\/([^/]+)\/$/);
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
	const path = `/guides/${slug}`;
	const post = await getPublishedPostBySlug(slug);
	if (post && (post.type === "guide" || post.type === "post")) {
		return buildArticleMetadata({
			path,
			title: post.seoTitle || `${post.title} | The Legends of Ren Zu`,
			description: post.seoDescription || post.excerpt || undefined,
			coverImageUrl: post.coverImageUrl,
			coverImageAlt: post.coverImageAlt,
			tags: post.tags,
			publishedAt: post.publishedAt,
			updatedAt: post.updatedAt,
			section: "Guides",
		});
	}
	const page = guidePages[`/guides/${slug}/`];
	if (!page) return { robots: { index: false, follow: true } };
	return buildArticleMetadata({
		path,
		title: page.title,
		description: page.description,
		section: "Guides",
	});
}

export default async function GuidePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const path = `/guides/${slug}`;
	const post = await getPublishedPostBySlug(slug);
	if (post && (post.type === "guide" || post.type === "post")) {
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
					eyebrow="Guide"
					backHref="/guides"
					backLabel="Guides"
				/>
			</>
		);
	}
	const page = guidePages[`/guides/${slug}/`];
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
				eyebrow="Guide"
				title={page.title
					.replace(" | The Omniarch", "")
					.replace(" | The Legends of Ren Zu", "")}
				lead={page.description}
				markdown={page.markdown}
				backHref="/guides/"
				backLabel="Guides"
			/>
		</>
	);
}

export function GuideHubLinks() {
	return (
		<ul className="space-y-2">
			{GUIDE_SLUGS.map((slug) => {
				const page = guidePages[`/guides/${slug}/`];
				if (!page) return null;
				return (
					<li key={slug}>
						<Link href={`/guides/${slug}`} className="underline">
							{page.title}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { getPublishedPostBySlug } from "@/lib/blog-data";

const GUIDE_SLUGS = [
	"reading-order",
	"ren-zu-summary",
	"the-legends-of-ren-zu-explained",
	"best-ren-zu-chapters",
	"hope-gu-meaning",
];

export function generateStaticParams() {
	return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (post && (post.type === "guide" || post.type === "post")) {
		return {
			title: post.seoTitle || `${post.title} | The Legends of Ren Zu`,
			description: post.seoDescription || post.excerpt || undefined,
			openGraph: {
				title: post.title,
				description: post.excerpt || undefined,
				type: "article",
				images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
			},
		};
	}
	const page = guidePages[`/guides/${slug}/`];
	if (!page) return {};
	return { title: page.title, description: page.description };
}

export default async function GuidePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (post && (post.type === "guide" || post.type === "post")) {
		return (
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
		);
	}
	const page = guidePages[`/guides/${slug}/`];
	if (!page) notFound();
	return (
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

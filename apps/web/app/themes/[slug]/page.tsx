import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { getPublishedPostBySlug } from "@/lib/blog-data";

const THEME_SLUGS = [
	"hope-gu",
	"fate-and-freedom",
	"wisdom-strength-and-self",
	"fate-gu",
	"freedom-gu",
];

export function generateStaticParams() {
	return THEME_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (post && post.type === "theme") {
		return {
			title: post.seoTitle || `${post.title} | The Legends of Ren Zu`,
			description: post.seoDescription || post.excerpt || undefined,
		};
	}
	const page = guidePages[`/themes/${slug}/`];
	if (!page) return {};
	return { title: page.title, description: page.description };
}

export default async function ThemePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (post && post.type === "theme") {
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
				eyebrow="Theme guide"
				backHref="/themes"
				backLabel="Themes"
			/>
		);
	}
	const page = guidePages[`/themes/${slug}/`];
	if (!page) notFound();
	return (
		<GuideArticle
			eyebrow="Theme guide"
			title={page.title.replace(" | The Legends of Ren Zu Theme Guide", "")}
			lead={page.description}
			markdown={page.markdown}
			backHref="/themes/"
			backLabel="Themes"
		/>
	);
}

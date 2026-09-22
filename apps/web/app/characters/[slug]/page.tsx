import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { getPublishedPostBySlug } from "@/lib/blog-data";

const CHARACTER_SLUGS = [
	"ren-zu",
	"verdant-great-sun",
	"desolate-ancient-moon",
	"northern-dark-ice-soul",
	"boundless-forest-samsara",
];

export function generateStaticParams() {
	return CHARACTER_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (post && post.type === "character") {
		return {
			title: post.seoTitle || `${post.title} | The Legends of Ren Zu`,
			description: post.seoDescription || post.excerpt || undefined,
		};
	}
	const page = guidePages[`/characters/${slug}/`];
	if (!page) return {};
	return { title: page.title, description: page.description };
}

export default async function CharacterPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (post && post.type === "character") {
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
				eyebrow="Character guide"
				backHref="/characters"
				backLabel="Characters"
			/>
		);
	}
	const page = guidePages[`/characters/${slug}/`];
	if (!page) notFound();
	return (
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
	);
}

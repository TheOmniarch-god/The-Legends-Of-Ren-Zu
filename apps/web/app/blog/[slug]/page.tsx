import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog-data";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (!post || (post.type !== "post" && post.type !== "guide")) return {};
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

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getPublishedPostBySlug(slug);
	if (!post) notFound();
	const siblings = await listPublishedPosts(post.type, 100);
	const index = siblings.findIndex((s) => s.slug === slug);
	const prev = siblings[index - 1];
	const next = siblings[index + 1];
	return (
		<BlogArticle
			post={{
				slug: post.slug,
				type: post.type,
				num: post.num,
				title: post.title,
				excerpt: post.excerpt,
				content: post.content,
				coverImageUrl: post.coverImageUrl,
				coverImageAlt: post.coverImageAlt,
				videoUrl: post.videoUrl,
				videoProvider: post.videoProvider,
				tags: post.tags,
			}}
			eyebrow={post.type === "post" ? "Webnovel" : post.type}
			backHref="/blog"
			backLabel="Webnovel"
			prev={
				prev
					? { slug: prev.slug, title: prev.title, num: prev.num, base: "/blog" }
					: null
			}
			next={
				next
					? { slug: next.slug, title: next.title, num: next.num, base: "/blog" }
					: null
			}
		/>
	);
}

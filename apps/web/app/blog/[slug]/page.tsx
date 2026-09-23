import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog-data";
import { articleJsonLd, buildArticleMetadata } from "@/lib/seo";

// Allow new admin-published posts to render on demand, then cache.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
	try {
		const dbPosts = await listPublishedPosts(undefined, 500);
		return dbPosts.map((p) => ({ slug: p.slug }));
	} catch {
		return [];
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const path = `/blog/${slug}`;
	const post = await getPublishedPostBySlug(slug);
	if (!post || (post.type !== "post" && post.type !== "guide"))
		return { robots: { index: false, follow: true } };
	return buildArticleMetadata({
		path,
		title: post.seoTitle || `${post.title} | The Legends of Ren Zu`,
		description: post.seoDescription || post.excerpt || undefined,
		coverImageUrl: post.coverImageUrl,
		coverImageAlt: post.coverImageAlt,
		tags: post.tags,
		publishedAt: post.publishedAt,
		updatedAt: post.updatedAt,
		section: "Webnovel",
	});
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
	const path = `/blog/${slug}`;
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
						? {
								slug: prev.slug,
								title: prev.title,
								num: prev.num,
								base: "/blog",
							}
						: null
				}
				next={
					next
						? {
								slug: next.slug,
								title: next.title,
								num: next.num,
								base: "/blog",
							}
						: null
				}
			/>
		</>
	);
}

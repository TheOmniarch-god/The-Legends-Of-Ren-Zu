import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { renderMarkdown } from "@/lib/markdown";

export type BlogPostView = {
	slug: string;
	type: string;
	num?: string | null;
	title: string;
	excerpt?: string | null;
	content: string;
	coverImageUrl?: string | null;
	coverImageAlt?: string | null;
	videoUrl?: string | null;
	videoProvider?: string | null;
	seoTitle?: string | null;
	seoDescription?: string | null;
	tags?: { id: string; name: string; slug: string }[];
	publishedAt?: string | Date | null;
};

function youtubeEmbed(url: string) {
	const match = url.match(
		/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
	);
	return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function VideoBlock({ post }: { post: BlogPostView }) {
	if (!post.videoUrl || post.videoProvider === "none") return null;
	if (post.videoProvider === "youtube") {
		const embed = youtubeEmbed(post.videoUrl);
		if (!embed) {
			return (
				<a href={post.videoUrl} className="typographic-link font-sans text-sm">
					Watch video →
				</a>
			);
		}
		return (
			<div className="aspect-video w-full overflow-hidden border border-rule bg-black">
				<iframe
					src={embed}
					title={`${post.title} video`}
					className="h-full w-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</div>
		);
	}
	if (post.videoProvider === "upload" || post.videoProvider === "external") {
		const isVideoFile = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(post.videoUrl);
		if (isVideoFile || post.videoProvider === "upload") {
			return (
				// biome-ignore lint/a11y/useMediaCaption: user-uploaded video has no caption track
				<video
					src={post.videoUrl}
					controls
					preload="metadata"
					className="w-full border border-rule bg-black"
				>
					Your browser does not support the video tag.
				</video>
			);
		}
		return (
			<a href={post.videoUrl} className="typographic-link font-sans text-sm">
				Watch video →
			</a>
		);
	}
	return null;
}

export function BlogArticle({
	post,
	eyebrow,
	backHref,
	backLabel,
	prev,
	next,
}: {
	post: BlogPostView;
	eyebrow: string;
	backHref: Route;
	backLabel: string;
	prev?: {
		slug: string;
		title: string;
		num?: string | null;
		base: string;
	} | null;
	next?: {
		slug: string;
		title: string;
		num?: string | null;
		base: string;
	} | null;
}) {
	// Content may be legacy plain-text paragraphs or markdown — renderMarkdown handles both.
	const paragraphs =
		!post.content.includes("#") && !post.content.includes("](")
			? post.content
					.split(/\n\s*\n+/)
					.map((p) => p.replace(/\s+/g, " ").trim())
					.filter(Boolean)
					.map((p) => `<p>${p.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
					.join("\n")
			: renderMarkdown(post.content);
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
			<article className="mx-auto max-w-3xl">
				<nav
					aria-label="Breadcrumb"
					className="mb-8 font-sans text-muted-foreground text-sm"
				>
					<Link href="/" className="typographic-link whitespace-nowrap">
						Home
					</Link>
					<span aria-hidden="true"> · </span>
					<Link href={backHref} className="typographic-link whitespace-nowrap">
						{backLabel}
					</Link>
				</nav>
				<p className="mb-3 font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
					{eyebrow}
				</p>
				<h1 className="text-balance font-display font-semibold text-4xl leading-[1.1] tracking-tight sm:text-5xl">
					{post.num ? `Part ${post.num}: ` : ""}
					{post.title}
				</h1>
				{post.excerpt && (
					<p className="mt-4 font-body text-muted-foreground text-xl leading-relaxed">
						{post.excerpt}
					</p>
				)}
				{post.coverImageUrl && (
					<figure className="mt-8">
						<Image
							src={post.coverImageUrl}
							alt={post.coverImageAlt || post.title}
							width={1200}
							height={675}
							className="w-full border border-rule object-cover"
							priority={false}
						/>
						{post.coverImageAlt && (
							<figcaption className="mt-2 font-sans text-muted-foreground text-xs">
								{post.coverImageAlt}
							</figcaption>
						)}
					</figure>
				)}
				{post.videoUrl && (
					<div className="mt-8">
						<VideoBlock post={post} />
					</div>
				)}
				<hr className="rule-double my-10" />
				<div
					className="legend-prose"
					dangerouslySetInnerHTML={{ __html: paragraphs }}
				/>
				{post.tags && post.tags.length > 0 && (
					<div className="mt-8 flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<Link
								key={tag.id}
								href={`/blog?tag=${tag.slug}` as Route}
								className="border border-rule px-2 py-1 font-sans text-muted-foreground text-xs"
							>
								#{tag.name}
							</Link>
						))}
					</div>
				)}
				{(prev || next) && (
					<>
						<hr className="rule-double my-10" />
						<div className="flex flex-wrap justify-between gap-x-8 gap-y-6">
							<div className="max-w-xs">
								{prev && (
									<>
										<p className="mb-1 font-sans text-muted-foreground text-xs uppercase tracking-[0.14em]">
											Previous
										</p>
										<Link
											href={`${prev.base}/${prev.slug}` as Route}
											className="typographic-link font-display text-lg leading-snug"
										>
											{prev.num ? `Part ${prev.num}: ` : ""}
											{prev.title}
										</Link>
									</>
								)}
							</div>
							<div className="max-w-xs text-right">
								{next && (
									<>
										<p className="mb-1 font-sans text-muted-foreground text-xs uppercase tracking-[0.14em]">
											Next
										</p>
										<Link
											href={`${next.base}/${next.slug}` as Route}
											className="typographic-link font-display text-lg leading-snug"
										>
											{next.num ? `Part ${next.num}: ` : ""}
											{next.title} →
										</Link>
									</>
								)}
							</div>
						</div>
					</>
				)}
			</article>
		</main>
	);
}

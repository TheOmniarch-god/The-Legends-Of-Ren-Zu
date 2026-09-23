import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog-article";
import { chapterBySlug, chapters, teaser } from "@/data/chapters";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog-data";
import { articleJsonLd, buildArticleMetadata } from "@/lib/seo";

// Allow new admin-published chapters to render on demand, then cache.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
	const staticSlugs = chapters.map((chapter) => ({ slug: chapter.slug }));
	try {
		const dbChapters = await listPublishedPosts("chapter", 500);
		const seen = new Set(staticSlugs.map((s) => s.slug));
		for (const post of dbChapters) {
			if (!seen.has(post.slug)) {
				seen.add(post.slug);
				staticSlugs.push({ slug: post.slug });
			}
		}
	} catch {
		// DB unreachable at build time — fall back to static chapters.
	}
	return staticSlugs;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const path = `/chapters/${slug}`;
	const post = await getPublishedPostBySlug(slug);
	if (post) {
		const title = `Part ${post.num || ""}: ${post.title} | The Legends of Ren Zu`;
		const description =
			post.seoDescription || post.excerpt || teaser(post.content, 120);
		return buildArticleMetadata({
			path,
			title,
			description,
			coverImageUrl: post.coverImageUrl,
			coverImageAlt: post.coverImageAlt,
			tags: post.tags,
			publishedAt: post.publishedAt,
			updatedAt: post.updatedAt,
			section: "Chapters",
		});
	}
	const chapter = chapterBySlug.get(slug);
	if (!chapter) return { robots: { index: false, follow: true } };
	const title = `Part ${chapter.num}: ${chapter.title} | The Legends of Ren Zu`;
	const description = `Read Part ${chapter.num}: ${chapter.title} from The Legends of Ren Zu. ${teaser(chapter.body, 120)}`;
	return buildArticleMetadata({
		path,
		title,
		description,
		section: "Chapters",
	});
}

function relatedLinks(body: string) {
	const t = body.toLowerCase();
	const links = [{ href: "/characters/ren-zu/", label: "Who is Ren Zu?" }];
	if (t.includes("hope"))
		links.push({ href: "/themes/hope-gu/", label: "Hope Gu theme guide" });
	if (t.includes("fate"))
		links.push({ href: "/themes/fate-gu/", label: "Fate Gu theme guide" });
	if (t.includes("freedom"))
		links.push({
			href: "/themes/freedom-gu/",
			label: "Freedom Gu theme guide",
		});
	if (t.includes("verdant great sun"))
		links.push({
			href: "/characters/verdant-great-sun/",
			label: "Verdant Great Sun",
		});
	if (t.includes("desolate ancient moon"))
		links.push({
			href: "/characters/desolate-ancient-moon/",
			label: "Desolate Ancient Moon",
		});
	links.push({ href: "/guides/", label: "All guides" });
	return links.slice(0, 6);
}

// Hallmark · Long Document: the page is literature — inline heads, 65ch,
// negative-space dividers, typographic links inside the flow.
export default async function ChapterPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	// DB-first: admin-managed version with cover image + video wins when present.
	const post = await getPublishedPostBySlug(slug);
	if (post) {
		const siblings = await listPublishedPosts("chapter", 200);
		const index = siblings.findIndex((s) => s.slug === slug);
		const prev = siblings[index - 1];
		const next = siblings[index + 1];
		const path = `/chapters/${slug}`;
		const headline = `Part ${post.num || ""}: ${post.title}`;
		const jsonLd = articleJsonLd({
			path,
			headline,
			description:
				post.seoDescription || post.excerpt || teaser(post.content, 160),
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
					eyebrow="The Legends of Ren Zu"
					backHref="/chapters"
					backLabel="Chapters"
					prev={
						prev
							? {
									slug: prev.slug,
									title: prev.title,
									num: prev.num,
									base: "/chapters",
								}
							: null
					}
					next={
						next
							? {
									slug: next.slug,
									title: next.title,
									num: next.num,
									base: "/chapters",
								}
							: null
					}
				/>
			</>
		);
	}

	const chapter = chapterBySlug.get(slug);
	if (!chapter) notFound();

	const index = chapters.findIndex((c) => c.slug === slug);
	const prev = chapters[index - 1];
	const next = chapters[index + 1];
	const paragraphs = chapter.body
		.split(/\n\s*\n+/)
		.map((p) => p.replace(/\s+/g, " ").trim())
		.filter(Boolean);
	const staticPath = `/chapters/${slug}`;
	const staticHeadline = `Part ${chapter.num}: ${chapter.title}`;
	const staticJsonLd = articleJsonLd({
		path: staticPath,
		headline: staticHeadline,
		description: teaser(chapter.body, 160),
	});

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(staticJsonLd) }}
			/>
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
						<Link
							href="/chapters"
							className="typographic-link whitespace-nowrap"
						>
							Chapters
						</Link>
						<span aria-hidden="true"> · </span>
						<span>Part {chapter.num}</span>
					</nav>
					<p className="mb-3 font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
						The Legends of Ren Zu
					</p>
					<h1 className="text-balance font-display font-semibold text-4xl leading-[1.1] tracking-tight sm:text-5xl">
						Part {chapter.num}: {chapter.title}
					</h1>
					<p className="mt-4 font-sans text-muted-foreground text-sm">
						Gu Zhen Ren · The Omniarch reader companion
					</p>
					<hr className="rule-double my-10" />
					<div className="legend-prose">
						{paragraphs.map((p, i) => (
							<p key={i}>{p}</p>
						))}
					</div>
					<hr className="rule-double my-10" />
					<div className="flex flex-wrap justify-between gap-x-8 gap-y-6">
						<div className="max-w-xs">
							{prev && (
								<>
									<p className="mb-1 font-sans text-muted-foreground text-xs uppercase tracking-[0.14em]">
										Previous
									</p>
									<Link
										href={`/chapters/${prev.slug}`}
										className="typographic-link font-display text-lg leading-snug"
									>
										Part {prev.num}: {prev.title}
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
										href={`/chapters/${next.slug}`}
										className="typographic-link font-display text-lg leading-snug"
									>
										Part {next.num}: {next.title} →
									</Link>
								</>
							)}
						</div>
					</div>
					<aside className="mt-12 border-rule border-t pt-6">
						<h2 className="font-display font-semibold text-2xl tracking-tight">
							Related guides
						</h2>
						<ul className="mt-4 space-y-2">
							{relatedLinks(chapter.body).map((l) => (
								<li key={l.href}>
									<a
										href={l.href}
										className="typographic-link font-body text-base"
									>
										{l.label}
									</a>
								</li>
							))}
						</ul>
					</aside>
				</article>
			</main>
		</>
	);
}

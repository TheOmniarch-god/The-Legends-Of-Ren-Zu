import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { chapters, teaser } from "@/data/chapters";
import { listPublishedPosts } from "@/lib/blog-data";
import { canonicalUrl, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
	title: "The Legends of Ren Zu Chapters | Archive and Reading Guide",
	description:
		"Browse every available chapter entry from The Legends of Ren Zu, then jump into guides, theme explainers, character pages, and the immersive reader.",
	alternates: { canonical: canonicalUrl("/chapters") },
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: canonicalUrl("/chapters"),
		title: "The Legends of Ren Zu Chapters | Archive and Reading Guide",
		description:
			"Browse every available chapter entry from The Legends of Ren Zu, then jump into guides, theme explainers, character pages, and the immersive reader.",
	},
	twitter: {
		card: "summary",
		title: "The Legends of Ren Zu Chapters | Archive and Reading Guide",
		description:
			"Browse every available chapter entry from The Legends of Ren Zu.",
	},
	robots: { index: true, follow: true },
};

// Hallmark · Catalogue: inventory header (count, no adjectives) + uniform
// hairline rows; card-internal link per row; no global CTA.
// DB-first: shows admin-managed chapters (with covers) when the blog DB is seeded.
// Backstop: refresh from the DB at most every 10 minutes (publishing also
// triggers instant revalidation via the onPostChange hook).
export const revalidate = 600;

export default async function ChaptersArchive() {
	const dbChapters = await listPublishedPosts("chapter", 200);
	const items =
		dbChapters.length > 0
			? dbChapters.map((p) => ({
					slug: p.slug,
					num: p.num || "",
					title: p.title,
					excerpt: p.excerpt || teaser(p.content, 160),
					cover: p.coverImageUrl,
					coverAlt: p.coverImageAlt,
					hasVideo: Boolean(p.videoUrl),
				}))
			: chapters.map((c) => ({
					slug: c.slug,
					num: c.num,
					title: c.title,
					excerpt: teaser(c.body, 160),
					cover: null as string | null,
					coverAlt: null as string | null,
					hasVideo: false,
				}));
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@graph": [
							{
								"@type": "CollectionPage",
								"@id": `${SITE_URL}/chapters#collection`,
								url: `${SITE_URL}/chapters`,
								name: "The Legends of Ren Zu Chapters",
								description:
									"Browse every available chapter entry from The Legends of Ren Zu.",
								mainEntity: {
									"@type": "ItemList",
									numberOfItems: items.length,
									itemListElement: items.map((item, i) => ({
										"@type": "ListItem",
										position: i + 1,
										url: `${SITE_URL}/chapters/${item.slug}`,
										name: `Part ${item.num}: ${item.title}`,
									})),
								},
							},
							{
								"@type": "BreadcrumbList",
								itemListElement: [
									{
										"@type": "ListItem",
										position: 1,
										name: "Home",
										item: SITE_URL,
									},
									{
										"@type": "ListItem",
										position: 2,
										name: "Chapters",
										item: `${SITE_URL}/chapters`,
									},
								],
							},
						],
					}),
				}}
			/>
			<main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
				<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
					The archive · {items.length} entries · Reverend Insanity
				</p>
				<h1 className="mt-3 font-display font-semibold text-4xl tracking-tight sm:text-5xl">
					Chapters
				</h1>
				<p className="mt-3 max-w-2xl font-body text-lg text-muted-foreground leading-relaxed">
					Read in order first — the symbols gain weight over time.
				</p>
				<div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
					<Link
						href="/guides/reading-order"
						className="typographic-link whitespace-nowrap font-sans text-sm"
					>
						Reading order
					</Link>
					<Link
						href="/blog"
						className="typographic-link whitespace-nowrap font-sans text-sm"
					>
						Webnovel
					</Link>
					<Link
						href="/guides"
						className="typographic-link whitespace-nowrap font-sans text-muted-foreground text-sm"
					>
						Guides
					</Link>
					<Link
						href="/characters"
						className="typographic-link whitespace-nowrap font-sans text-muted-foreground text-sm"
					>
						Characters
					</Link>
					<Link
						href="/themes"
						className="typographic-link whitespace-nowrap font-sans text-muted-foreground text-sm"
					>
						Themes
					</Link>
				</div>

				<ol className="mt-10">
					{items.map((chapter) => (
						<li
							key={chapter.slug}
							className="grid grid-cols-[minmax(0,3.5rem)_minmax(0,1fr)] gap-4 border-rule border-t py-5 last:border-b sm:grid-cols-[minmax(0,5rem)_minmax(0,1fr)_minmax(0,16rem)] sm:gap-6"
						>
							<p className="font-sans text-muted-foreground text-sm tabular-nums">
								{chapter.num}
							</p>
							<h2 className="font-display font-medium text-xl leading-snug">
								<Link
									href={`/chapters/${chapter.slug}`}
									className="typographic-link"
								>
									{chapter.title}
									{chapter.hasVideo ? " ▶" : ""}
								</Link>
								{chapter.cover && (
									<Link
										href={`/chapters/${chapter.slug}`}
										className="mt-3 block max-w-xs"
									>
										<Image
											src={chapter.cover}
											alt={chapter.coverAlt || chapter.title}
											width={320}
											height={180}
											className="aspect-video w-full border border-rule object-cover"
										/>
									</Link>
								)}
							</h2>
							<p className="col-start-2 font-body text-base text-muted-foreground leading-relaxed sm:col-start-3">
								{chapter.excerpt}
							</p>
						</li>
					))}
				</ol>
			</main>
		</>
	);
}

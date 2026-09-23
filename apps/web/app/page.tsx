import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { chapters, teaser } from "@/data/chapters";
import { listPublishedPosts } from "@/lib/blog-data";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
	title: "The Legends of Ren Zu | Read, Listen, and Ask",
	description:
		"Read, listen, annotate, and discuss The Legends of Ren Zu with The Omniarch reader.",
	alternates: { canonical: canonicalUrl("/") },
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: canonicalUrl("/"),
		title: "The Legends of Ren Zu | Read, Listen, and Ask",
		description:
			"Read, listen, annotate, and discuss The Legends of Ren Zu with The Omniarch reader.",
		images: [
			{
				url: "/assets/renzu-main-app-image.jpg",
				width: 1200,
				height: 630,
				alt: "The Legends of Ren Zu artwork",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "The Legends of Ren Zu | Read, Listen, and Ask",
		description:
			"Read, listen, annotate, and discuss The Legends of Ren Zu with The Omniarch reader.",
		images: ["/assets/renzu-main-app-image.jpg"],
	},
	robots: { index: true, follow: true },
};

// Home shows the latest webnovel posts — refresh from the DB at most every
// 10 minutes (publishing also triggers instant revalidation).
export const revalidate = 600;

// Hallmark · H3 Quote-Led knobs: quote-weight=roman display · attribution=under quote · length=80–160 chars
// Verbatim from Part 7 — no invented copy.
const HERO_QUOTE =
	"“Wine is both bitter and sweet, love is the same, and human lives are even more so.”";

function blogHref(post: { type: string; slug: string }): Route {
	switch (post.type) {
		case "chapter":
			return `/chapters/${post.slug}` as Route;
		case "guide":
			return `/guides/${post.slug}` as Route;
		case "character":
			return `/characters/${post.slug}` as Route;
		case "theme":
			return `/themes/${post.slug}` as Route;
		default:
			return `/blog/${post.slug}` as Route;
	}
}

export default async function Home() {
	const featured = chapters.slice(0, 6);
	const latest = (await listPublishedPosts(undefined, 4)).filter(
		(p) => p.coverImageUrl,
	);
	return (
		<main className="mx-auto w-full max-w-5xl px-4 sm:px-6">
			<section className="reveal grid gap-10 pt-12 pb-16 sm:pt-16">
				<div className="max-w-3xl">
					<p className="mb-5 font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
						Part 7 · The Origin of Wine
					</p>
					<blockquote className="text-balance font-display font-medium text-4xl leading-[1.15] tracking-tight sm:text-5xl">
						{HERO_QUOTE}
					</blockquote>
					<p className="mt-5 font-sans text-muted-foreground text-sm">
						— Wisdom Gu, to Verdant Great Sun
					</p>
					<div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
						<Link
							href="/chapters/part-1-strength-wisdom-and-hope"
							className="typographic-link whitespace-nowrap font-medium font-sans text-base"
						>
							Begin at Part 1 →
						</Link>
						<Link
							href="/guides/reading-order"
							className="typographic-link whitespace-nowrap font-sans text-base text-muted-foreground"
						>
							Reading order
						</Link>
						<Link
							href="/ask"
							className="typographic-link whitespace-nowrap font-sans text-base text-muted-foreground"
						>
							Ask the scholar
						</Link>
					</div>
				</div>
				<figure className="grid gap-10 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:items-end">
					<Image
						src="/assets/renzu-main-app-image.jpg"
						alt="The Legends of Ren Zu artwork"
						width={640}
						height={640}
						className="w-full border border-rule object-cover"
						priority
					/>
					<figcaption className="max-w-md font-body text-lg text-muted-foreground leading-relaxed">
						Ren Zu gave his youth for strength, his middle years for wisdom, and
						his heart to hope. Read every legend in order, keep notes in the
						margins, and ask the scholar anything about the Gu world.
					</figcaption>
				</figure>
			</section>

			<hr className="rule-double" />

			<section className="reveal py-14" style={{ "--i": 1 } as CSSProperties}>
				<div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
					<h2 className="font-display font-semibold text-3xl tracking-tight">
						Begin the legends
					</h2>
					<Link
						href="/chapters"
						className="typographic-link whitespace-nowrap font-sans text-sm"
					>
						The full archive — {chapters.length} chapters
					</Link>
				</div>
				<ol>
					{featured.map((chapter) => (
						<li
							key={chapter.slug}
							className="grid grid-cols-[minmax(0,3.5rem)_minmax(0,1fr)] gap-4 border-rule border-t py-5 last:border-b sm:grid-cols-[minmax(0,5rem)_minmax(0,1fr)_minmax(0,14rem)] sm:gap-6"
						>
							<p className="font-sans text-muted-foreground text-sm tabular-nums">
								{chapter.num}
							</p>
							<div>
								<h3 className="font-display font-medium text-xl leading-snug">
									<Link
										href={`/chapters/${chapter.slug}`}
										className="typographic-link"
									>
										{chapter.title}
									</Link>
								</h3>
								<p className="mt-1 font-body text-base text-muted-foreground leading-relaxed sm:hidden">
									{teaser(chapter.body, 120)}
								</p>
							</div>
							<p className="hidden font-body text-base text-muted-foreground leading-relaxed sm:block">
								{teaser(chapter.body, 140)}
							</p>
						</li>
					))}
				</ol>
			</section>

			<hr className="rule-double" />

			{latest.length > 0 && (
				<section className="reveal py-14" style={{ "--i": 2 } as CSSProperties}>
					<div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
						<h2 className="font-display font-semibold text-3xl tracking-tight">
							Fresh from the webnovel
						</h2>
						<Link
							href="/blog"
							className="typographic-link whitespace-nowrap font-sans text-sm"
						>
							All posts →
						</Link>
					</div>
					<div className="grid gap-6 sm:grid-cols-2">
						{latest.map((post) => (
							<Link
								key={post.id}
								href={blogHref(post)}
								className="group border border-rule"
							>
								{post.coverImageUrl && (
									<Image
										src={post.coverImageUrl}
										alt={post.coverImageAlt || post.title}
										width={640}
										height={360}
										className="aspect-video w-full object-cover"
									/>
								)}
								<div className="p-4">
									<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.14em]">
										{post.type}
									</p>
									<p className="mt-1 font-display text-xl leading-snug group-hover:underline">
										{post.title}
									</p>
								</div>
							</Link>
						))}
					</div>
				</section>
			)}

			<hr className="rule-double" />

			<section
				className="reveal grid gap-8 py-14 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
				style={{ "--i": 3 } as CSSProperties}
			>
				<h2 className="font-display font-semibold text-3xl tracking-tight">
					Three ways to keep reading
				</h2>
				<ul className="divide-y divide-rule border-rule border-y">
					<li className="py-4">
						<Link
							href="/chapters"
							className="typographic-link font-display text-xl"
						>
							Read in order →
						</Link>
						<p className="mt-1 font-body text-base text-muted-foreground">
							The archive, Part 1 onward. Symbols gain weight over time.
						</p>
					</li>
					<li className="py-4">
						<Link
							href="/guides/best-ren-zu-chapters"
							className="typographic-link font-display text-xl"
						>
							Sample the strongest chapters →
						</Link>
						<p className="mt-1 font-body text-base text-muted-foreground">
							Five entry points, chosen for emotional force.
						</p>
					</li>
					<li className="py-4">
						<Link href="/ask" className="typographic-link font-display text-xl">
							Ask the scholar →
						</Link>
						<p className="mt-1 font-body text-base text-muted-foreground">
							Hope Gu, Fate Gu, the Verdant Great Sun — questioned and answered.
						</p>
					</li>
				</ul>
			</section>
		</main>
	);
}

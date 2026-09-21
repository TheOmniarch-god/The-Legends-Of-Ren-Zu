import type { Metadata } from "next";
import Link from "next/link";

import { chapters, teaser } from "@/data/chapters";

export const metadata: Metadata = {
	title: "The Legends of Ren Zu Chapters | Archive and Reading Guide",
	description:
		"Browse every available chapter entry from The Legends of Ren Zu, then jump into guides, theme explainers, character pages, and the immersive reader.",
};

// Hallmark · Catalogue: inventory header (count, no adjectives) + uniform
// hairline rows; card-internal link per row; no global CTA.
export default function ChaptersArchive() {
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
			<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
				The archive · {chapters.length} entries · Reverend Insanity
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
				{chapters.map((chapter) => (
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
							</Link>
						</h2>
						<p className="col-start-2 font-body text-base text-muted-foreground leading-relaxed sm:col-start-3">
							{teaser(chapter.body, 160)}
						</p>
					</li>
				))}
			</ol>
		</main>
	);
}

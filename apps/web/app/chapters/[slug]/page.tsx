import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { chapterBySlug, chapters, teaser } from "@/data/chapters";

export function generateStaticParams() {
	return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const chapter = chapterBySlug.get(slug);
	if (!chapter) return {};
	const title = `Part ${chapter.num}: ${chapter.title} | The Legends of Ren Zu`;
	const description = `Read Part ${chapter.num}: ${chapter.title} from The Legends of Ren Zu. ${teaser(chapter.body, 120)}`;
	return {
		title,
		description,
		openGraph: { title, description, type: "article" },
	};
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
	const chapter = chapterBySlug.get(slug);
	if (!chapter) notFound();

	const index = chapters.findIndex((c) => c.slug === slug);
	const prev = chapters[index - 1];
	const next = chapters[index + 1];
	const paragraphs = chapter.body
		.split(/\n\s*\n+/)
		.map((p) => p.replace(/\s+/g, " ").trim())
		.filter(Boolean);

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
					<Link href="/chapters" className="typographic-link whitespace-nowrap">
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
	);
}

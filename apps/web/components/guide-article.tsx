import { renderMarkdown } from "@/lib/markdown";

// Hallmark · Long Document treatment shared by guides, characters, themes.
export function GuideArticle({
	eyebrow,
	title,
	lead,
	markdown,
	backHref,
	backLabel,
}: {
	eyebrow: string;
	title: string;
	lead: string;
	markdown: string;
	backHref: string;
	backLabel: string;
}) {
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
			<article className="mx-auto max-w-3xl">
				<nav
					aria-label="Breadcrumb"
					className="mb-8 font-sans text-muted-foreground text-sm"
				>
					<a href="/" className="typographic-link whitespace-nowrap">
						Home
					</a>
					<span aria-hidden="true"> · </span>
					<a href={backHref} className="typographic-link whitespace-nowrap">
						{backLabel}
					</a>
				</nav>
				<p className="mb-3 font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
					{eyebrow}
				</p>
				<h1 className="text-balance font-display font-semibold text-4xl leading-[1.1] tracking-tight sm:text-5xl">
					{title}
				</h1>
				<p className="mt-4 max-w-2xl font-body text-muted-foreground text-xl leading-relaxed">
					{lead}
				</p>
				<hr className="rule-double my-10" />
				<div
					className="legend-prose"
					dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
				/>
			</article>
		</main>
	);
}

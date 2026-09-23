import Link from "next/link";

// Hallmark · Ft1 Mast-headed knobs: wordmark-size=xl · tagline=roman body · links-row=inline
export default function SiteFooter() {
	return (
		<footer className="px-4 pb-10 sm:px-6">
			<div className="mx-auto w-full max-w-5xl">
				<hr className="rule-double mb-6" />
				<div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
					<div>
						<p className="font-display font-semibold text-xl">
							The Legends of Ren Zu
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Read every legend, slowly. A companion to Reverend Insanity by Gu
							Zhen Ren.
						</p>
					</div>
					<p className="flex flex-wrap gap-x-4 gap-y-1 font-sans text-muted-foreground text-sm">
						<Link
							href="/chapters"
							className="typographic-link whitespace-nowrap"
						>
							Chapters
						</Link>
						<Link
							href="/guides/reading-order"
							className="typographic-link whitespace-nowrap"
						>
							Reading order
						</Link>
						<Link href="/about" className="typographic-link whitespace-nowrap">
							About
						</Link>
						<Link href="/faq" className="typographic-link whitespace-nowrap">
							Questions
						</Link>
						<a href="/llms.txt" className="typographic-link whitespace-nowrap">
							LLMs
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}

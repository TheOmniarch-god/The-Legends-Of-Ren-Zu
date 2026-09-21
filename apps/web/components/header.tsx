"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

// Hallmark · N6 Newspaper masthead knobs: issue-line=above wordmark · wordmark-size=2xl · rule=double
// Previous nav: none (first Hallmark run). This build: N6, because a legends
// reader is magazine-shaped — the masthead says "periodical" where the old
// Home/Dashboard/AI-Chat bar said "SaaS".
const LINKS = [
	{ to: "/chapters", label: "Chapters" },
	{ to: "/guides", label: "Guides" },
	{ to: "/characters", label: "Characters" },
	{ to: "/themes", label: "Themes" },
	{ to: "/ask", label: "Ask" },
] as const;

export default function Header() {
	return (
		<header className="px-4 pt-4 sm:px-6">
			<div className="mx-auto w-full max-w-5xl">
				<div className="flex items-center justify-between gap-3">
					<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.14em]">
						Gu Zhen Ren · Reverend Insanity
					</p>
					<div className="flex items-center gap-2">
						<ModeToggle />
						<UserMenu />
					</div>
				</div>
				<Link
					href="/"
					className="mt-2 block text-balance text-center font-display font-semibold text-4xl leading-none tracking-tight sm:text-5xl"
				>
					The Legends of Ren Zu
				</Link>
				<nav
					aria-label="Primary"
					className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
				>
					{LINKS.map(({ to, label }) => (
						<Link
							key={to}
							href={to}
							className="typographic-link whitespace-nowrap font-sans text-muted-foreground text-sm hover:text-foreground"
						>
							{label}
						</Link>
					))}
				</nav>
				<hr className="rule-double mt-4" />
			</div>
		</header>
	);
}

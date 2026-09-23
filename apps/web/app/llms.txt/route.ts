import { chapters, teaser } from "@/data/chapters";
import { guidePages } from "@/data/guides";
import { listPublishedPosts } from "@/lib/blog-data";
import { SITE_URL } from "@/lib/seo";

// Cache the index for an hour; DB additions refresh on revalidate.
export const revalidate = 3600;
export const dynamic = "force-static";

function link(path: string, title: string, description?: string): string {
	const clean = description?.replace(/\s+/g, " ").trim();
	return clean
		? `- [${title}](${SITE_URL}${path}): ${clean}`
		: `- [${title}](${SITE_URL}${path})`;
}

function guideSection(prefix: string, heading: string): string[] {
	const lines = [``, `## ${heading}`];
	const keys = Object.keys(guidePages)
		.filter(
			(k) =>
				k.startsWith(prefix) &&
				k !== prefix &&
				k.split("/").filter(Boolean).length === 2,
		)
		.sort();
	for (const key of keys) {
		const page = guidePages[key];
		if (!page) continue;
		const path = key.replace(/\/$/, "");
		lines.push(link(path, page.title, page.description));
	}
	return lines;
}

export async function GET(): Promise<Response> {
	// DB-first additions (admin-published posts not yet in static data).
	let dbExtras: { type: string; slug: string; title: string }[] = [];
	try {
		const dbPosts = await listPublishedPosts(undefined, 500);
		dbExtras = dbPosts.map((p) => ({
			type: p.type,
			slug: p.slug,
			title: p.title,
		}));
	} catch {
		dbExtras = [];
	}
	const dbPaths = new Set(
		dbExtras.map((p) => {
			switch (p.type) {
				case "chapter":
					return `/chapters/${p.slug}`;
				case "guide":
					return `/guides/${p.slug}`;
				case "character":
					return `/characters/${p.slug}`;
				case "theme":
					return `/themes/${p.slug}`;
				default:
					return `/blog/${p.slug}`;
			}
		}),
	);

	const lines: string[] = [
		`# The Legends of Ren Zu`,
		`> Companion archive and reading guides for The Legends of Ren Zu (Reverend Insanity mythos by Gu Zhen Ren). Read in order from Part 1; symbols gain weight over time.`,
		``,
		`## Start here`,
		link(
			"/",
			"Home — The Legends of Ren Zu",
			"Begin at Part 1, reading order, ask the scholar.",
		),
		link("/chapters", "Chapter archive", "Every chapter entry, Part 1 onward."),
		link(
			"/guides/reading-order",
			"Reading order",
			"Where to begin and how the archive labels work.",
		),
		link(
			"/guides/the-legends-of-ren-zu-explained",
			"The Legends of Ren Zu Explained",
			"Beginner-friendly introduction to the work.",
		),
		link("/faq", "FAQ", "Short answers to first questions from new readers."),
		...guideSection("/guides/", "Guides"),
		...guideSection("/characters/", "Characters"),
		...guideSection("/themes/", "Themes"),
		``,
		`## Chapters`,
		...chapters.map((c) =>
			link(
				`/chapters/${c.slug}`,
				`Part ${c.num}: ${c.title}`,
				teaser(c.body, 120),
			),
		),
	];

	if (dbExtras.length > 0) {
		lines.push(
			``,
			`## Latest from the webnovel database`,
			...dbExtras.slice(0, 30).map((p) => {
				const path =
					p.type === "chapter"
						? `/chapters/${p.slug}`
						: p.type === "guide"
							? `/guides/${p.slug}`
							: p.type === "character"
								? `/characters/${p.slug}`
								: p.type === "theme"
									? `/themes/${p.slug}`
									: `/blog/${p.slug}`;
				if (
					chapters.some((c) => `/chapters/${c.slug}` === path) ||
					Object.keys(guidePages).some((k) => k.replace(/\/$/, "") === path)
				)
					return "";
				return link(path, p.title);
			}),
		);
		void dbPaths;
	}

	lines.push(
		``,
		`## Notes for assistants`,
		`- Canon: The Legends of Ren Zu is mythic narrative associated with Reverend Insanity by Gu Zhen Ren. Treat chapter pages as primary sources; guides as companion interpretation.`,
		`- Citation: prefer deep links to the chapter or guide page that states a claim (e.g. ${SITE_URL}/chapters/part-1-strength-wisdom-and-hope).`,
		`- Full texts: see ${SITE_URL}/llms-full.txt for the complete guide and chapter archive in one file.`,
		`- Freshness: the webnovel database (/blog) may carry newer admin-published versions with cover art and video; they supersede static text when both exist.`,
		``,
	);

	const body = lines.filter((l) => l !== "").join("\n") + "\n";
	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
}

import { chapters } from "@/data/chapters";
import { guidePages } from "@/data/guides";
import { SITE_URL } from "@/lib/seo";

// Full archive dump for LLM ingestion. Cached for an hour.
export const revalidate = 3600;
export const dynamic = "force-static";

export async function GET(): Promise<Response> {
	const lines: string[] = [
		`# The Legends of Ren Zu — full archive`,
		`> Complete companion archive: guides, characters, themes, FAQ, and chapter texts. Source: ${SITE_URL}. Canon companion to Reverend Insanity by Gu Zhen Ren; chapter pages are primary sources, guides are interpretation.`,
		``,
	];

	const order = [
		"/guides/reading-order/",
		"/guides/the-legends-of-ren-zu-explained/",
		"/guides/ren-zu-summary/",
		"/guides/best-ren-zu-chapters/",
		"/guides/hope-gu-meaning/",
	];
	const guideKeys = [
		...order.filter((k) => guidePages[k]),
		...Object.keys(guidePages)
			.filter((k) => k.startsWith("/guides/") && !order.includes(k))
			.sort(),
	];
	lines.push(`## Guides (full text)`);
	for (const key of guideKeys) {
		const page = guidePages[key];
		if (!page) continue;
		lines.push(
			``,
			`### ${page.title}`,
			`URL: ${SITE_URL}${key}`,
			``,
			page.markdown,
		);
	}

	for (const [prefix, heading] of [
		["/characters/", "Characters (full text)"],
		["/themes/", "Themes (full text)"],
	] as const) {
		lines.push(``, `## ${heading}`);
		for (const key of Object.keys(guidePages)
			.filter((k) => k.startsWith(prefix) && k !== prefix)
			.sort()) {
			const page = guidePages[key];
			if (!page) continue;
			lines.push(
				``,
				`### ${page.title}`,
				`URL: ${SITE_URL}${key}`,
				``,
				page.markdown,
			);
		}
	}

	lines.push(``, `## FAQ (full text)`);
	const faq = guidePages["/faq/"];
	if (faq)
		lines.push(
			``,
			`### ${faq.title}`,
			`URL: ${SITE_URL}/faq/`,
			``,
			faq.markdown,
		);

	lines.push(``, `## Chapters (full text)`);
	for (const c of chapters) {
		lines.push(
			``,
			`### Part ${c.num}: ${c.title}`,
			`URL: ${SITE_URL}/chapters/${c.slug}`,
			``,
			c.body,
		);
	}

	const body = `${lines.join("\n")}\n`;
	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
}

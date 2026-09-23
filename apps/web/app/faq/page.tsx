import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { canonicalUrl, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
	title: "Legends of Ren Zu FAQ | Chapters, Ren Zu, Hope Gu, and Reading Guide",
	description:
		"Fast answers to the questions new readers and search visitors ask first.",
	alternates: { canonical: canonicalUrl("/faq") },
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: canonicalUrl("/faq"),
		title:
			"Legends of Ren Zu FAQ | Chapters, Ren Zu, Hope Gu, and Reading Guide",
		description:
			"Fast answers to the questions new readers and search visitors ask first.",
	},
	robots: { index: true, follow: true },
};

/** Extract Q&A pairs from the FAQ markdown (### Question + body answer). */
function faqEntities(markdown: string) {
	const blocks = markdown.split(/\n\s*\n/);
	const entities: { name: string; text: string }[] = [];
	let current: string | null = null;
	let answer: string[] = [];
	const flush = () => {
		if (current) {
			const text = answer
				.join(" ")
				.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
				.replace(/\*\*([^*]+)\*\*/g, "$1")
				.replace(/\s+/g, " ")
				.trim();
			if (text) entities.push({ name: current, text });
		}
		current = null;
		answer = [];
	};
	for (const block of blocks) {
		const trimmed = block.trim();
		if (!trimmed) continue;
		if (trimmed.startsWith("### ")) {
			flush();
			current = trimmed.slice(4).trim();
		} else if (current && !trimmed.startsWith("#")) {
			answer.push(trimmed);
		}
	}
	flush();
	return entities;
}

export default function FaqPage() {
	const page = guidePages["/faq/"];
	const entities = faqEntities(page?.markdown || "");
	const jsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "FAQPage",
				"@id": `${SITE_URL}/faq#faq`,
				mainEntity: entities.map((e) => ({
					"@type": "Question",
					name: e.name,
					acceptedAnswer: { "@type": "Answer", text: e.text },
				})),
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
					{
						"@type": "ListItem",
						position: 2,
						name: "FAQ",
						item: `${SITE_URL}/faq`,
					},
				],
			},
		],
	};
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<GuideArticle
				eyebrow="FAQ"
				title="Legends of Ren Zu FAQ"
				lead={page?.description || ""}
				markdown={page?.markdown || ""}
				backHref="/"
				backLabel="Home"
			/>
		</>
	);
}

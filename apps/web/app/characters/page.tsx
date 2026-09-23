import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
	title: "Legends of Ren Zu Characters | Starting Character Guide",
	description:
		"A clean hub for character pages focused on the names readers are most likely to search.",
	alternates: { canonical: canonicalUrl("/characters") },
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: canonicalUrl("/characters"),
		title: "Legends of Ren Zu Characters | Starting Character Guide",
		description:
			"A clean hub for character pages focused on the names readers are most likely to search.",
	},
	twitter: {
		card: "summary",
		title: "Legends of Ren Zu Characters | Starting Character Guide",
		description: "Character guides for The Legends of Ren Zu.",
	},
	robots: { index: true, follow: true },
};

export default function CharactersHub() {
	const page = guidePages["/characters/"];
	return (
		<GuideArticle
			eyebrow="Characters"
			title="Legends of Ren Zu Characters"
			lead={page?.description || ""}
			markdown={page?.markdown || ""}
			backHref="/"
			backLabel="Home"
		/>
	);
}

import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
	title:
		"Legends of Ren Zu Themes | Hope, Fate, Freedom, Wisdom, Strength, and Self",
	description:
		"A thematic hub for the big ideas readers search for most often.",
	alternates: { canonical: canonicalUrl("/themes") },
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: canonicalUrl("/themes"),
		title:
			"Legends of Ren Zu Themes | Hope, Fate, Freedom, Wisdom, Strength, and Self",
		description:
			"A thematic hub for the big ideas readers search for most often.",
	},
	twitter: {
		card: "summary",
		title: "Legends of Ren Zu Themes | Hope, Fate, Freedom, Wisdom, Strength",
		description: "Theme guides for The Legends of Ren Zu.",
	},
	robots: { index: true, follow: true },
};

export default function ThemesHub() {
	const page = guidePages["/themes/"];
	return (
		<GuideArticle
			eyebrow="Themes"
			title="Legends of Ren Zu Themes"
			lead={page?.description || ""}
			markdown={page?.markdown || ""}
			backHref="/"
			backLabel="Home"
		/>
	);
}

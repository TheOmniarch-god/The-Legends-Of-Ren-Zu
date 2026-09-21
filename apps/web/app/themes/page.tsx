import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";

export const metadata: Metadata = {
	title:
		"Legends of Ren Zu Themes | Hope, Fate, Freedom, Wisdom, Strength, and Self",
	description:
		"A thematic hub for the big ideas readers search for most often.",
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

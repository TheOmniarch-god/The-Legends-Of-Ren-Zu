import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";

export const metadata: Metadata = {
	title: "Legends of Ren Zu Characters | Starting Character Guide",
	description:
		"A clean hub for character pages focused on the names readers are most likely to search.",
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

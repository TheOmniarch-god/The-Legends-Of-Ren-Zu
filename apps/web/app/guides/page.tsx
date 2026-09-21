import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";

export const metadata: Metadata = {
	title: "Legends of Ren Zu Guides | Reader Guides, Explainers, and Summaries",
	description:
		"Open detailed reading guides, explainers, summaries, and topic pages built around how people actually search for The Legends of Ren Zu.",
};

export default function GuidesHub() {
	const page = guidePages["/guides/"];
	return (
		<GuideArticle
			eyebrow="Guide hub"
			title="Detailed guides for The Legends of Ren Zu"
			lead={page?.description || ""}
			markdown={page?.markdown || ""}
			backHref="/"
			backLabel="Home"
		/>
	);
}

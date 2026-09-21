import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";

export const metadata: Metadata = {
	title: "Legends of Ren Zu FAQ | Chapters, Ren Zu, Hope Gu, and Reading Guide",
	description:
		"Fast answers to the questions new readers and search visitors ask first.",
};

export default function FaqPage() {
	const page = guidePages["/faq/"];
	return (
		<GuideArticle
			eyebrow="FAQ"
			title="Legends of Ren Zu FAQ"
			lead={page?.description || ""}
			markdown={page?.markdown || ""}
			backHref="/"
			backLabel="Home"
		/>
	);
}

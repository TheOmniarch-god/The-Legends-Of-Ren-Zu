import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";

export const metadata: Metadata = {
	title: "About The Legends of Ren Zu Reader | The Omniarch",
	description:
		"Why the site has both an immersive reader and a search-friendly knowledge layer.",
};

export default function AboutPage() {
	const page = guidePages["/about/"];
	return (
		<GuideArticle
			eyebrow="About the project"
			title="A reader experience with a search layer built around it"
			lead={page?.description || ""}
			markdown={page?.markdown || ""}
			backHref="/"
			backLabel="Home"
		/>
	);
}

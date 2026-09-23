import type { Metadata } from "next";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";
import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
	title: "About The Legends of Ren Zu Reader | The Omniarch",
	description:
		"Why the site has both an immersive reader and a search-friendly knowledge layer.",
	alternates: { canonical: canonicalUrl("/about") },
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: canonicalUrl("/about"),
		title: "About The Legends of Ren Zu Reader | The Omniarch",
		description:
			"Why the site has both an immersive reader and a search-friendly knowledge layer.",
	},
	robots: { index: true, follow: true },
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

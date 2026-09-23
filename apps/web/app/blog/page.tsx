import type { Metadata } from "next";
import { Suspense } from "react";

import { canonicalUrl } from "@/lib/seo";
import BlogList from "./_components/blog-list";

export const metadata: Metadata = {
	title: "Webnovel | The Legends of Ren Zu",
	description:
		"Browse chapters, guides, characters and themes from The Legends of Ren Zu — with cover art and video, managed from the admin panel.",
	alternates: { canonical: canonicalUrl("/blog") },
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: canonicalUrl("/blog"),
		title: "Webnovel | The Legends of Ren Zu",
		description:
			"Browse chapters, guides, characters and themes from The Legends of Ren Zu — with cover art and video.",
	},
	twitter: {
		card: "summary",
		title: "Webnovel | The Legends of Ren Zu",
		description:
			"Browse chapters, guides, characters and themes from The Legends of Ren Zu.",
	},
	robots: { index: true, follow: true },
};

export default function BlogPage() {
	return (
		<Suspense>
			<BlogList />
		</Suspense>
	);
}

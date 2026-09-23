import type { Metadata } from "next";

import { canonicalUrl } from "@/lib/seo";
import AskClient from "./_components/ask-client";

export const metadata: Metadata = {
	title: "Ask the Scholar | The Legends of Ren Zu",
	description:
		"Ask the scholar anything about The Legends of Ren Zu — Hope Gu, Fate Gu, the Verdant Great Sun — grounded in the legends and Reverend Insanity logic.",
	alternates: { canonical: canonicalUrl("/ask") },
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: canonicalUrl("/ask"),
		title: "Ask the Scholar | The Legends of Ren Zu",
		description:
			"Ask the scholar anything about The Legends of Ren Zu — grounded in the legends and Reverend Insanity logic.",
	},
	robots: { index: false, follow: true },
};

export default function AskPage() {
	return <AskClient />;
}

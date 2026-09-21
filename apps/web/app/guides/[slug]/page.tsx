import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";

const GUIDE_SLUGS = [
	"reading-order",
	"ren-zu-summary",
	"the-legends-of-ren-zu-explained",
	"best-ren-zu-chapters",
	"hope-gu-meaning",
];

export function generateStaticParams() {
	return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const page = guidePages[`/guides/${slug}/`];
	if (!page) return {};
	return { title: page.title, description: page.description };
}

export default async function GuidePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const page = guidePages[`/guides/${slug}/`];
	if (!page) notFound();
	return (
		<GuideArticle
			eyebrow="Guide"
			title={page.title
				.replace(" | The Omniarch", "")
				.replace(" | The Legends of Ren Zu", "")}
			lead={page.description}
			markdown={page.markdown}
			backHref="/guides/"
			backLabel="Guides"
		/>
	);
}

export function GuideHubLinks() {
	return (
		<ul className="space-y-2">
			{GUIDE_SLUGS.map((slug) => {
				const page = guidePages[`/guides/${slug}/`];
				if (!page) return null;
				return (
					<li key={slug}>
						<Link href={`/guides/${slug}`} className="underline">
							{page.title}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}

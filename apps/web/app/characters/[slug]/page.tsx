import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";

const CHARACTER_SLUGS = [
	"ren-zu",
	"verdant-great-sun",
	"desolate-ancient-moon",
	"northern-dark-ice-soul",
	"boundless-forest-samsara",
];

export function generateStaticParams() {
	return CHARACTER_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const page = guidePages[`/characters/${slug}/`];
	if (!page) return {};
	return { title: page.title, description: page.description };
}

export default async function CharacterPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const page = guidePages[`/characters/${slug}/`];
	if (!page) notFound();
	return (
		<GuideArticle
			eyebrow="Character guide"
			title={page.title
				.replace(" | Character Guide", "")
				.replace(" | The Legends of Ren Zu Character Guide", "")}
			lead={page.description}
			markdown={page.markdown}
			backHref="/characters/"
			backLabel="Characters"
		/>
	);
}

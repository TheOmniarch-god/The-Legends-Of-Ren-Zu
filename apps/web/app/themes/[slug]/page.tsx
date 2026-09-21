import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideArticle } from "@/components/guide-article";
import { guidePages } from "@/data/guides";

const THEME_SLUGS = [
	"hope-gu",
	"fate-and-freedom",
	"wisdom-strength-and-self",
	"fate-gu",
	"freedom-gu",
];

export function generateStaticParams() {
	return THEME_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const page = guidePages[`/themes/${slug}/`];
	if (!page) return {};
	return { title: page.title, description: page.description };
}

export default async function ThemePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const page = guidePages[`/themes/${slug}/`];
	if (!page) notFound();
	return (
		<GuideArticle
			eyebrow="Theme guide"
			title={page.title.replace(" | The Legends of Ren Zu Theme Guide", "")}
			lead={page.description}
			markdown={page.markdown}
			backHref="/themes/"
			backLabel="Themes"
		/>
	);
}

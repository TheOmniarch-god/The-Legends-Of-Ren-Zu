import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Newsreader } from "next/font/google";

import "./globals.css";
import Header from "@/components/header";
import Providers from "@/components/providers";
import PwaRegistration from "@/components/pwa-registration";
import SiteFooter from "@/components/site-footer";
import ThemeInit from "@/components/theme-init";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const fraunces = Fraunces({
	variable: "--font-fraunces",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

const newsreader = Newsreader({
	variable: "--font-newsreader",
	subsets: ["latin"],
	weight: ["400", "500"],
	style: ["normal", "italic"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "The Legends of Ren Zu | Read, Listen, and Ask",
		template: "%s | The Legends of Ren Zu",
	},
	description:
		"The Legends of Ren Zu — Reverend Insanity by Gu Zhen Ren. Read, listen, annotate, and ask.",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ||
			"https://thelegendsofrenzu.theomniarch.com.ng",
	),
	alternates: {
		canonical: "/",
	},
	keywords: [
		"The Legends of Ren Zu",
		"Ren Zu",
		"Reverend Insanity",
		"Gu Zhen Ren",
		"Hope Gu",
		"Fate Gu",
		"xianxia guides",
	],
	authors: [{ name: "Gu Zhen Ren" }],
	creator: "The Omniarch",
	publisher: "The Omniarch",
	openGraph: {
		type: "website",
		siteName: "The Legends of Ren Zu",
		locale: "en_US",
		url: "/",
		title: "The Legends of Ren Zu | Read, Listen, and Ask",
		description:
			"The Legends of Ren Zu — Reverend Insanity by Gu Zhen Ren. Read, listen, annotate, and ask.",
	},
	twitter: {
		card: "summary_large_image",
		site: "@theomniarch",
		title: "The Legends of Ren Zu | Read, Listen, and Ask",
		description:
			"The Legends of Ren Zu — Reverend Insanity by Gu Zhen Ren. Read, listen, annotate, and ask.",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export const viewport = {
	themeColor: "#0a0a0a",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const siteUrl = (
		process.env.NEXT_PUBLIC_SITE_URL ||
		"https://thelegendsofrenzu.theomniarch.com.ng"
	).replace(/\/$/, "");
	const websiteJsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": `${siteUrl}#website`,
				url: siteUrl,
				name: "The Legends of Ren Zu",
				inLanguage: "en",
				publisher: { "@id": `${siteUrl}#organization` },
				potentialAction: {
					"@type": "SearchAction",
					target: {
						"@type": "EntryPoint",
						urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
					},
					"query-input": "required name=search_term_string",
				},
			},
			{
				"@type": "Organization",
				"@id": `${siteUrl}#organization`,
				name: "The Legends of Ren Zu",
				url: siteUrl,
			},
		],
	};
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${newsreader.variable} antialiased`}
			>
				<ThemeInit />
				<PwaRegistration />

				<Providers>
					<div className="grid min-h-svh grid-rows-[auto_1fr_auto]">
						<Header />
						{children}
						<SiteFooter />
					</div>
				</Providers>
			</body>
		</html>
	);
}

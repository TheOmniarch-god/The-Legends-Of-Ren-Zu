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
		default: "The Legends of Ren Zu",
		template: "%s",
	},
	description:
		"The Legends of Ren Zu — Reverend Insanity by Gu Zhen Ren. Read, listen, annotate, and ask.",
	metadataBase: new URL("https://thelegendsofrenzu.theomniarch.com.ng"),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
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

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "AI Chat | The Legends of Ren Zu",
	description: "Interactive AI chat companion for The Legends of Ren Zu.",
	robots: { index: false, follow: false },
};

export default function AiLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

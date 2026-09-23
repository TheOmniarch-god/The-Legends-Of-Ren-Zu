import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Login | The Legends of Ren Zu",
	description: "Log in to The Legends of Ren Zu reader.",
	robots: { index: false, follow: false },
};

export default function LoginLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

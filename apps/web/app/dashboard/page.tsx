import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/services";
import DashboardView from "./_components/dashboard-view";

// Personalized page — never prerender at build time (no request headers then).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session.user.name}</p>
			<DashboardView />
		</div>
	);
}

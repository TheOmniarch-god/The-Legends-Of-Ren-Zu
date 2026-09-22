import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/server/admin-guard";

const NAV: { href: Route; label: string }[] = [
	{ href: "/admin", label: "Overview" },
	{ href: "/admin/posts", label: "Posts" },
	{ href: "/admin/media", label: "Media" },
	{ href: "/admin/categories", label: "Categories & Tags" },
	{ href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const admin = await getAdminSession();
	if (!admin) redirect("/login?redirect=/admin");
	if (admin.role !== "admin" && admin.role !== "editor") {
		return (
			<main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
				<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
					Admin
				</p>
				<h1 className="mt-3 font-display font-semibold text-4xl tracking-tight">
					Access denied
				</h1>
				<p className="mt-3 font-body text-lg text-muted-foreground">
					Your account ({admin.email || "unknown"}) does not have admin access.
					Ask an admin to grant you the editor role, or add your email to
					ADMIN_EMAILS.
				</p>
				<Link
					href="/"
					className="typographic-link mt-6 inline-block font-sans text-sm"
				>
					← Back home
				</Link>
			</main>
		);
	}
	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
			<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
						Admin panel · {admin.role}
					</p>
					<h1 className="mt-2 font-display font-semibold text-3xl tracking-tight">
						Webnovel control
					</h1>
				</div>
				<nav className="flex flex-wrap gap-x-5 gap-y-2">
					{NAV.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="typographic-link whitespace-nowrap font-sans text-muted-foreground text-sm"
						>
							{item.label}
						</Link>
					))}
					<Link
						href="/blog"
						className="typographic-link whitespace-nowrap font-sans text-sm"
					>
						View webnovel →
					</Link>
				</nav>
			</div>
			{children}
		</div>
	);
}

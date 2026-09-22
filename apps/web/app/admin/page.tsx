import { mediaAssets, posts } from "@renzu-bts/db/schema/blog";
import { count, eq } from "drizzle-orm";
import type { Route } from "next";
import Link from "next/link";

import { db } from "@/server/services";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
	let stats = { total: 0, published: 0, drafts: 0, media: 0 };
	try {
		const [total, published, drafts, media] = await Promise.all([
			db.select({ value: count() }).from(posts),
			db
				.select({ value: count() })
				.from(posts)
				.where(eq(posts.status, "published")),
			db
				.select({ value: count() })
				.from(posts)
				.where(eq(posts.status, "draft")),
			db.select({ value: count() }).from(mediaAssets),
		]);
		stats = {
			total: total[0]?.value || 0,
			published: published[0]?.value || 0,
			drafts: drafts[0]?.value || 0,
			media: media[0]?.value || 0,
		};
	} catch {
		// DB not reachable — show setup hint below
	}
	const cards: { label: string; value: number; href: Route }[] = [
		{ label: "Total posts", value: stats.total, href: "/admin/posts" },
		{
			label: "Published",
			value: stats.published,
			href: "/admin/posts?status=published",
		},
		{ label: "Drafts", value: stats.drafts, href: "/admin/posts?status=draft" },
		{ label: "Media files", value: stats.media, href: "/admin/media" },
	];
	return (
		<div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{cards.map((card) => (
					<Link
						key={card.label}
						href={card.href}
						className="border border-rule p-5 transition-colors hover:border-foreground"
					>
						<p className="font-display font-semibold text-4xl tabular-nums">
							{card.value}
						</p>
						<p className="mt-1 font-sans text-muted-foreground text-sm">
							{card.label}
						</p>
					</Link>
				))}
			</div>
			<div className="mt-8 grid gap-4 lg:grid-cols-2">
				<div className="border border-rule p-6">
					<h2 className="font-display font-semibold text-xl">Quick actions</h2>
					<ul className="mt-4 space-y-2 font-sans text-sm">
						<li>
							<Link href="/admin/posts/new" className="typographic-link">
								+ New post (chapter, guide, character, theme)
							</Link>
						</li>
						<li>
							<Link href="/admin/media" className="typographic-link">
								Upload cover image or video →
							</Link>
						</li>
						<li>
							<Link href="/admin/categories" className="typographic-link">
								Manage categories & tags →
							</Link>
						</li>
					</ul>
				</div>
				<div className="border border-rule p-6">
					<h2 className="font-display font-semibold text-xl">Supabase setup</h2>
					<ol className="mt-4 list-decimal space-y-2 pl-5 font-body text-base text-muted-foreground leading-relaxed">
						<li>
							Create buckets <code>blog-images</code> and{" "}
							<code>blog-videos</code> (public read).
						</li>
						<li>
							Set <code>SUPABASE_URL</code>,{" "}
							<code>SUPABASE_SERVICE_ROLE_KEY</code> and{" "}
							<code>ADMIN_EMAILS</code> in env, then redeploy.
						</li>
						<li>
							Run <code>bun run db:push</code> with your Supabase DATABASE_URL,
							then seed via <code>bun run blog:seed</code>.
						</li>
					</ol>
				</div>
			</div>
		</div>
	);
}

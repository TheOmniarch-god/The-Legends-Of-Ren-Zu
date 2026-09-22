"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { orpc } from "@/lib/orpc";

const TYPES = [
	{ value: "", label: "Everything" },
	{ value: "chapter", label: "Chapters" },
	{ value: "guide", label: "Guides" },
	{ value: "character", label: "Characters" },
	{ value: "theme", label: "Themes" },
	{ value: "post", label: "Webnovel" },
];

function postHref(post: { type: string; slug: string }): Route {
	switch (post.type) {
		case "chapter":
			return `/chapters/${post.slug}` as Route;
		case "guide":
			return `/guides/${post.slug}` as Route;
		case "character":
			return `/characters/${post.slug}` as Route;
		case "theme":
			return `/themes/${post.slug}` as Route;
		default:
			return `/blog/${post.slug}` as Route;
	}
}

function BlogList() {
	const searchParams = useSearchParams();
	const initialTag = searchParams.get("tag") || "";
	const [type, setType] = useState("");
	const [search, setSearch] = useState("");
	const listQuery = useQuery(
		orpc.blog.list.queryOptions({
			input: {
				type: (type || undefined) as
					| "chapter"
					| "guide"
					| "character"
					| "theme"
					| "post"
					| undefined,
				search,
				tagSlug: initialTag || undefined,
				limit: 50,
				offset: 0,
			},
		}),
	);
	const posts = listQuery.data?.posts || [];
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
			<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.18em]">
				The webnovel · {listQuery.data?.total || 0} entries
			</p>
			<h1 className="mt-3 font-display font-semibold text-4xl tracking-tight sm:text-5xl">
				Webnovel
			</h1>
			<p className="mt-3 max-w-2xl font-body text-lg text-muted-foreground leading-relaxed">
				Chapters, guides, characters and themes — with cover art and video,
				managed from the admin panel.
			</p>
			<div className="mt-6 flex flex-wrap gap-2">
				{TYPES.map((t) => (
					<button
						key={t.value}
						type="button"
						onClick={() => setType(t.value)}
						className={`border px-3 py-1 font-sans text-sm ${type === t.value ? "border-foreground bg-foreground text-background" : "border-rule text-muted-foreground"}`}
					>
						{t.label}
					</button>
				))}
			</div>
			<input
				className="mt-4 w-full max-w-md border border-rule bg-background px-3 py-2 font-sans text-sm"
				placeholder="Search posts…"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			{initialTag && (
				<p className="mt-3 font-sans text-muted-foreground text-sm">
					Tag: #{initialTag}
				</p>
			)}
			{listQuery.isPending ? (
				<p className="mt-10 font-sans text-muted-foreground text-sm">
					Loading posts…
				</p>
			) : listQuery.isError ? (
				<div className="mt-10 border border-rule p-6">
					<p className="font-body text-lg">
						The webnovel database is not connected yet.
					</p>
					<p className="mt-2 font-sans text-muted-foreground text-sm">
						Browse the static{" "}
						<Link href="/chapters" className="typographic-link">
							chapter archive
						</Link>{" "}
						meanwhile. Admins: run <code>bun run db:push</code> +{" "}
						<code>bun run blog:seed</code>.
					</p>
				</div>
			) : (
				<ol className="mt-10">
					{posts.map((post) => (
						<li
							key={post.id}
							className="grid gap-4 border-rule border-t py-6 last:border-b sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6"
						>
							{post.coverImageUrl ? (
								<Link href={postHref(post)}>
									<Image
										src={post.coverImageUrl}
										alt={post.coverImageAlt || post.title}
										width={320}
										height={180}
										className="aspect-video w-full border border-rule object-cover"
									/>
								</Link>
							) : (
								<div className="hidden aspect-video w-full items-center justify-center border border-rule font-display text-2xl text-muted-foreground sm:flex">
									{post.num || "✦"}
								</div>
							)}
							<div>
								<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.14em]">
									{post.type}
									{post.num ? ` · Part ${post.num}` : ""}
									{post.videoUrl ? " · ▶ video" : ""}
								</p>
								<h2 className="mt-1 font-display font-medium text-2xl leading-snug">
									<Link href={postHref(post)} className="typographic-link">
										{post.title}
									</Link>
								</h2>
								{post.excerpt && (
									<p className="mt-1 font-body text-base text-muted-foreground leading-relaxed">
										{post.excerpt.slice(0, 180)}
									</p>
								)}
							</div>
						</li>
					))}
					{posts.length === 0 && (
						<li className="py-10 text-center font-sans text-muted-foreground text-sm">
							No posts yet — check back soon.
						</li>
					)}
				</ol>
			)}
		</main>
	);
}

export default function BlogPage() {
	return (
		<Suspense>
			<BlogList />
		</Suspense>
	);
}

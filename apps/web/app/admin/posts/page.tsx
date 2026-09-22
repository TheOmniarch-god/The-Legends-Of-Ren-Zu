"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export default function AdminPostsPage() {
	const [type, setType] = useState<string>("");
	const [status, setStatus] = useState<string>("");
	const [search, setSearch] = useState("");
	const listQuery = useQuery(
		orpc.admin.posts.list.queryOptions({
			input: {
				type: (type || undefined) as
					| "chapter"
					| "guide"
					| "character"
					| "theme"
					| "post"
					| undefined,
				status: (status || undefined) as
					| "draft"
					| "published"
					| "archived"
					| undefined,
				search,
				limit: 50,
				offset: 0,
			},
		}),
	);
	const removeMutation = useMutation({
		mutationFn: (id: string) => orpc.admin.posts.remove.call({ id }),
		onSuccess: () => {
			toast.success("Post deleted");
			listQuery.refetch();
		},
		onError: (error) => toast.error(error.message),
	});
	const statusMutation = useMutation({
		mutationFn: (args: {
			id: string;
			status: "draft" | "published" | "archived";
		}) => orpc.admin.posts.setStatus.call(args),
		onSuccess: () => {
			toast.success("Status updated");
			listQuery.refetch();
		},
		onError: (error) => toast.error(error.message),
	});

	const posts = listQuery.data?.posts || [];
	return (
		<div>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<p className="font-sans text-muted-foreground text-sm">
					{listQuery.data?.total || 0} posts
				</p>
				<Link
					href="/admin/posts/new"
					className="bg-foreground px-4 py-2 font-sans text-background text-sm"
				>
					+ New post
				</Link>
			</div>
			<div className="mb-6 flex flex-wrap gap-3">
				<input
					className="min-w-52 border border-rule bg-background px-3 py-2 font-sans text-sm"
					placeholder="Search title or slug…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<select
					className="border border-rule bg-background px-3 py-2 font-sans text-sm"
					value={type}
					onChange={(e) => setType(e.target.value)}
				>
					<option value="">All types</option>
					<option value="chapter">Chapters</option>
					<option value="guide">Guides</option>
					<option value="character">Characters</option>
					<option value="theme">Themes</option>
					<option value="post">Webnovel</option>
				</select>
				<select
					className="border border-rule bg-background px-3 py-2 font-sans text-sm"
					value={status}
					onChange={(e) => setStatus(e.target.value)}
				>
					<option value="">All statuses</option>
					<option value="draft">Drafts</option>
					<option value="published">Published</option>
					<option value="archived">Archived</option>
				</select>
			</div>
			{listQuery.isPending ? (
				<p className="font-sans text-muted-foreground text-sm">Loading…</p>
			) : listQuery.isError ? (
				<div className="border border-rule p-6">
					<p className="font-sans text-sm">
						Could not load posts. Is the database migrated and reachable?
					</p>
					<p className="mt-2 font-mono text-muted-foreground text-xs">
						Run `bun run db:push` with your Supabase DATABASE_URL, then `bun run
						blog:seed`.
					</p>
				</div>
			) : (
				<ul className="divide-y divide-rule border-rule border-y">
					{posts.map((post) => (
						<li
							key={post.id}
							className="flex flex-wrap items-center justify-between gap-3 py-4"
						>
							<div className="min-w-0">
								<p className="font-sans text-muted-foreground text-xs uppercase tracking-[0.14em]">
									{post.type} · {post.status}
									{post.num ? ` · № ${post.num}` : ""}
								</p>
								<Link
									href={`/admin/posts/${post.id}`}
									className="typographic-link font-display text-lg leading-snug"
								>
									{post.title}
								</Link>
								<p className="font-mono text-muted-foreground text-xs">
									/{post.slug}
								</p>
							</div>
							<div className="flex items-center gap-2">
								{post.status === "published" ? (
									<button
										type="button"
										className="border border-rule px-3 py-1 font-sans text-xs"
										onClick={() =>
											statusMutation.mutate({ id: post.id, status: "draft" })
										}
									>
										Unpublish
									</button>
								) : (
									<button
										type="button"
										className="border border-rule px-3 py-1 font-sans text-xs"
										onClick={() =>
											statusMutation.mutate({
												id: post.id,
												status: "published",
											})
										}
									>
										Publish
									</button>
								)}
								<button
									type="button"
									className="border border-rule px-3 py-1 font-sans text-red-500 text-xs"
									onClick={() => {
										if (confirm(`Delete "${post.title}"?`))
											removeMutation.mutate(post.id);
									}}
								>
									Delete
								</button>
							</div>
						</li>
					))}
					{posts.length === 0 && (
						<li className="py-10 text-center font-sans text-muted-foreground text-sm">
							No posts yet. Create your first post or run the seed script.
						</li>
					)}
				</ul>
			)}
		</div>
	);
}

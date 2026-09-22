"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export default function AdminTaxonomyPage() {
	const [categoryName, setCategoryName] = useState("");
	const [tagName, setTagName] = useState("");
	const categoriesQuery = useQuery(orpc.admin.categories.list.queryOptions());
	const tagsQuery = useQuery(orpc.admin.tags.list.queryOptions());

	const createCategory = useMutation({
		mutationFn: (name: string) => orpc.admin.categories.create.call({ name }),
		onSuccess: () => {
			setCategoryName("");
			categoriesQuery.refetch();
			toast.success("Category created");
		},
		onError: (error) => toast.error(error.message),
	});
	const createTag = useMutation({
		mutationFn: (name: string) => orpc.admin.tags.create.call({ name }),
		onSuccess: () => {
			setTagName("");
			tagsQuery.refetch();
			toast.success("Tag created");
		},
		onError: (error) => toast.error(error.message),
	});
	const removeCategory = useMutation({
		mutationFn: (id: string) => orpc.admin.categories.remove.call({ id }),
		onSuccess: () => {
			categoriesQuery.refetch();
			toast.success("Category deleted");
		},
		onError: (error) => toast.error(error.message),
	});
	const removeTag = useMutation({
		mutationFn: (id: string) => orpc.admin.tags.remove.call({ id }),
		onSuccess: () => {
			tagsQuery.refetch();
			toast.success("Tag deleted");
		},
		onError: (error) => toast.error(error.message),
	});

	const inputCls =
		"w-full border border-rule bg-background px-3 py-2 font-sans text-sm";
	return (
		<div className="grid gap-8 lg:grid-cols-2">
			<section className="border border-rule p-6">
				<h2 className="font-display font-semibold text-xl">Categories</h2>
				<div className="mt-4 flex gap-2">
					<input
						className={inputCls}
						placeholder="New category…"
						value={categoryName}
						onChange={(e) => setCategoryName(e.target.value)}
					/>
					<button
						type="button"
						className="shrink-0 bg-foreground px-4 py-2 font-sans text-background text-sm"
						onClick={() =>
							categoryName.trim() && createCategory.mutate(categoryName.trim())
						}
					>
						Add
					</button>
				</div>
				<ul className="mt-4 divide-y divide-rule border-rule border-y">
					{(categoriesQuery.data?.categories || []).map((c) => (
						<li
							key={c.id}
							className="flex items-center justify-between gap-3 py-2"
						>
							<span className="font-sans text-sm">
								{c.name}{" "}
								<span className="font-mono text-muted-foreground text-xs">
									/{c.slug}
								</span>
							</span>
							<button
								type="button"
								className="font-sans text-red-500 text-xs"
								onClick={() => removeCategory.mutate(c.id)}
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			</section>
			<section className="border border-rule p-6">
				<h2 className="font-display font-semibold text-xl">Tags</h2>
				<div className="mt-4 flex gap-2">
					<input
						className={inputCls}
						placeholder="New tag…"
						value={tagName}
						onChange={(e) => setTagName(e.target.value)}
					/>
					<button
						type="button"
						className="shrink-0 bg-foreground px-4 py-2 font-sans text-background text-sm"
						onClick={() => tagName.trim() && createTag.mutate(tagName.trim())}
					>
						Add
					</button>
				</div>
				<ul className="mt-4 divide-y divide-rule border-rule border-y">
					{(tagsQuery.data?.tags || []).map((t) => (
						<li
							key={t.id}
							className="flex items-center justify-between gap-3 py-2"
						>
							<span className="font-sans text-sm">
								{t.name}{" "}
								<span className="font-mono text-muted-foreground text-xs">
									/{t.slug}
								</span>
							</span>
							<button
								type="button"
								className="font-sans text-red-500 text-xs"
								onClick={() => removeTag.mutate(t.id)}
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}

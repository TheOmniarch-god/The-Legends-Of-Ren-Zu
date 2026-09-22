"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

type PostForm = {
	slug: string;
	type: "chapter" | "guide" | "character" | "theme" | "post";
	num: string;
	title: string;
	excerpt: string;
	content: string;
	coverImageUrl: string;
	coverImagePath: string;
	coverImageAlt: string;
	videoUrl: string;
	videoStoragePath: string;
	videoProvider: "none" | "upload" | "youtube" | "external";
	status: "draft" | "published" | "archived";
	featured: boolean;
	orderIndex: number;
	categoryId: string;
	tagIds: string[];
	seoTitle: string;
	seoDescription: string;
};

const EMPTY: PostForm = {
	slug: "",
	type: "post",
	num: "",
	title: "",
	excerpt: "",
	content: "",
	coverImageUrl: "",
	coverImagePath: "",
	coverImageAlt: "",
	videoUrl: "",
	videoStoragePath: "",
	videoProvider: "none",
	status: "draft",
	featured: false,
	orderIndex: 0,
	categoryId: "",
	tagIds: [],
	seoTitle: "",
	seoDescription: "",
};

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 200);
}

function isUrlLike(value: string) {
	return /^https?:\/\/\S+$/i.test(value.trim());
}

function isYouTubeUrl(value: string) {
	return /(?:youtube\.com|youtu\.be)/i.test(value);
}

async function uploadFile(
	file: File,
	kind: "image" | "video",
	alt = "",
	postId = "",
) {
	const form = new FormData();
	form.append("file", file);
	form.append("kind", kind);
	form.append("alt", alt);
	if (postId) form.append("postId", postId);
	const res = await fetch("/api/admin/upload", { method: "POST", body: form });
	const data = await res.json();
	if (!res.ok) throw new Error(data.error || "Upload failed");
	return data as { url: string; path: string; bucket: string };
}

export default function PostEditor({ initialId }: { initialId?: string }) {
	const router = useRouter();
	const [form, setForm] = useState<PostForm>(EMPTY);
	const [loaded, setLoaded] = useState(!initialId);
	const [uploading, setUploading] = useState<
		"cover" | "video" | "inline" | null
	>(null);

	const categoriesQuery = useQuery(orpc.admin.categories.list.queryOptions());
	const tagsQuery = useQuery(orpc.admin.tags.list.queryOptions());
	const existingQuery = useQuery(
		orpc.admin.posts.get.queryOptions({ input: { id: initialId || "" } }),
	);
	if (initialId && existingQuery.data && !loaded) {
		const p = existingQuery.data.post as Record<string, unknown>;
		setForm({
			...EMPTY,
			slug: (p.slug as string) || "",
			type: (p.type as PostForm["type"]) || "post",
			num: (p.num as string) || "",
			title: (p.title as string) || "",
			excerpt: (p.excerpt as string) || "",
			content: (p.content as string) || "",
			coverImageUrl: (p.coverImageUrl as string) || "",
			coverImagePath: (p.coverImagePath as string) || "",
			coverImageAlt: (p.coverImageAlt as string) || "",
			videoUrl: (p.videoUrl as string) || "",
			videoStoragePath: (p.videoStoragePath as string) || "",
			videoProvider: (p.videoProvider as PostForm["videoProvider"]) || "none",
			status: (p.status as PostForm["status"]) || "draft",
			featured: Boolean(p.featured),
			orderIndex: (p.orderIndex as number) || 0,
			categoryId: (p.categoryId as string) || "",
			tagIds: (existingQuery.data.tagIds as string[]) || [],
			seoTitle: (p.seoTitle as string) || "",
			seoDescription: (p.seoDescription as string) || "",
		});
		setLoaded(true);
	}

	const set = <K extends keyof PostForm>(key: K, value: PostForm[K]) =>
		setForm((f) => ({ ...f, [key]: value }));

	const saveMutation = useMutation({
		mutationFn: async () => {
			const payload = {
				slug: slugify(form.slug || form.title),
				type: form.type,
				num: form.num || undefined,
				title: form.title.trim(),
				excerpt: form.excerpt,
				content: form.content,
				coverImageUrl: form.coverImageUrl || undefined,
				coverImagePath: form.coverImagePath || undefined,
				coverImageAlt: form.coverImageAlt,
				videoUrl: form.videoUrl || undefined,
				videoStoragePath: form.videoStoragePath || undefined,
				videoProvider: form.videoProvider,
				status: form.status,
				featured: form.featured,
				orderIndex: Number(form.orderIndex) || 0,
				categoryId: form.categoryId || null,
				tagIds: form.tagIds,
				seoTitle: form.seoTitle || undefined,
				seoDescription: form.seoDescription || undefined,
			};
			if (!payload.title) throw new Error("Title is required");
			if (!payload.slug) throw new Error("Slug is required");
			if (initialId) {
				return orpc.admin.posts.update.call({ ...payload, id: initialId });
			}
			return orpc.admin.posts.create.call(payload);
		},
		onSuccess: (data) => {
			toast.success(initialId ? "Post updated" : "Post created");
			const id = (data as { post?: { id?: string } })?.post?.id;
			router.push(
				(id && !initialId ? `/admin/posts/${id}` : "/admin/posts") as Route,
			);
			router.refresh();
		},
		onError: (error) => toast.error(error.message),
	});

	const handleCoverFile = async (file: File) => {
		setUploading("cover");
		try {
			const data = await uploadFile(
				file,
				"image",
				form.coverImageAlt || form.title,
			);
			set("coverImageUrl", data.url);
			set("coverImagePath", data.path);
			toast.success("Cover image uploaded to Supabase");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setUploading(null);
		}
	};

	const handleVideoFile = async (file: File) => {
		setUploading("video");
		try {
			const data = await uploadFile(file, "video", form.title);
			set("videoUrl", data.url);
			set("videoStoragePath", data.path);
			set("videoProvider", "upload");
			toast.success("Video uploaded to Supabase");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setUploading(null);
		}
	};

	const contentRef = useRef<HTMLTextAreaElement>(null);
	const [dragOver, setDragOver] = useState<
		"content" | "cover" | "video" | null
	>(null);

	const insertAtCursor = (snippet: string) => {
		const el = contentRef.current;
		if (!el) {
			set("content", `${form.content}\n\n${snippet}\n`);
			return;
		}
		const start = el.selectionStart ?? form.content.length;
		const end = el.selectionEnd ?? form.content.length;
		const next = `${form.content.slice(0, start)}\n\n${snippet}\n${form.content.slice(end)}`;
		set("content", next);
		requestAnimationFrame(() => {
			el.focus();
			const pos = start + snippet.length + 3;
			el.setSelectionRange(pos, pos);
		});
	};

	const handleContentFiles = async (files: File[]) => {
		const media = files.filter(
			(f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
		);
		if (media.length === 0) {
			toast.error("Only image or video files can be dropped here");
			return;
		}
		if (media.length < files.length) {
			toast.error("Skipped non-media files — only images and videos");
		}
		setUploading("inline");
		let inserted = 0;
		try {
			for (const file of media) {
				const kind = file.type.startsWith("video/") ? "video" : "image";
				try {
					const data = await uploadFile(file, kind, file.name);
					insertAtCursor(`![${file.name}](${data.url})`);
					inserted++;
				} catch (error) {
					toast.error(
						`${file.name}: ${error instanceof Error ? error.message : "Upload failed"}`,
					);
				}
			}
			if (inserted > 0) {
				toast.success(
					inserted === 1
						? "Media inserted into content"
						: `${inserted} files inserted into content`,
				);
			}
		} finally {
			setUploading(null);
		}
	};

	const handleContentLink = (url: string) => {
		const clean = url.trim();
		if (!isUrlLike(clean)) {
			toast.error("Dropped text is not a link");
			return;
		}
		insertAtCursor(`[${clean}](${clean})`);
		toast.success("Link inserted into content");
	};

	const handleInlineImage = async (file: File) => {
		await handleContentFiles([file]);
	};

	const handleVideoLink = (url: string) => {
		const clean = url.trim();
		if (!isUrlLike(clean)) {
			toast.error("Dropped text is not a link");
			return;
		}
		set("videoUrl", clean);
		set("videoStoragePath", "");
		set("videoProvider", isYouTubeUrl(clean) ? "youtube" : "external");
		toast.success("Video link attached");
	};

	const inputCls =
		"w-full border border-rule bg-background px-3 py-2 font-sans text-sm outline-none focus:border-foreground";
	const labelCls =
		"mb-1 block font-sans text-xs uppercase tracking-[0.14em] text-muted-foreground";

	if (initialId && (existingQuery.isPending || !loaded)) {
		return (
			<p className="font-sans text-muted-foreground text-sm">Loading post…</p>
		);
	}
	if (initialId && existingQuery.isError) {
		return (
			<p className="font-sans text-red-500 text-sm">Failed to load post.</p>
		);
	}

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
			<div className="space-y-5">
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className={labelCls} htmlFor="pe-title">
							Title *
						</label>
						<input
							id="pe-title"
							className={inputCls}
							value={form.title}
							onChange={(e) => {
								set("title", e.target.value);
								if (!initialId) set("slug", slugify(e.target.value));
							}}
							placeholder="Part 1: Strength, Wisdom and Hope"
						/>
					</div>
					<div>
						<label className={labelCls} htmlFor="pe-slug">
							Slug *
						</label>
						<input
							id="pe-slug"
							className={inputCls}
							value={form.slug}
							onChange={(e) => set("slug", slugify(e.target.value))}
							placeholder="part-1-strength-wisdom-and-hope"
						/>
					</div>
				</div>
				<div className="grid gap-4 sm:grid-cols-4">
					<div>
						<label className={labelCls} htmlFor="pe-type">
							Type
						</label>
						<select
							id="pe-type"
							className={inputCls}
							value={form.type}
							onChange={(e) => set("type", e.target.value as PostForm["type"])}
						>
							<option value="chapter">Chapter</option>
							<option value="guide">Guide</option>
							<option value="character">Character</option>
							<option value="theme">Theme</option>
							<option value="post">Webnovel</option>
						</select>
					</div>
					<div>
						<label className={labelCls} htmlFor="pe-num">
							Number
						</label>
						<input
							id="pe-num"
							className={inputCls}
							value={form.num}
							onChange={(e) => set("num", e.target.value)}
							placeholder="1"
						/>
					</div>
					<div>
						<label className={labelCls} htmlFor="pe-status">
							Status
						</label>
						<select
							id="pe-status"
							className={inputCls}
							value={form.status}
							onChange={(e) =>
								set("status", e.target.value as PostForm["status"])
							}
						>
							<option value="draft">Draft</option>
							<option value="published">Published</option>
							<option value="archived">Archived</option>
						</select>
					</div>
					<div>
						<label className={labelCls} htmlFor="pe-order">
							Order
						</label>
						<input
							id="pe-order"
							type="number"
							className={inputCls}
							value={form.orderIndex}
							onChange={(e) => set("orderIndex", Number(e.target.value))}
						/>
					</div>
				</div>
				<div>
					<label className={labelCls} htmlFor="pe-excerpt">
						Excerpt / teaser
					</label>
					<textarea
						id="pe-excerpt"
						className={inputCls}
						rows={2}
						value={form.excerpt}
						onChange={(e) => set("excerpt", e.target.value)}
						placeholder="Short summary shown in lists and SEO"
					/>
				</div>
				<div>
					<div className="mb-1 flex items-center justify-between">
						<label className={labelCls} htmlFor="pe-content">
							Content (markdown)
						</label>
						<label className="cursor-pointer font-sans text-muted-foreground text-xs underline">
							{uploading === "inline" ? "Uploading…" : "+ Insert image"}
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									const f = e.target.files?.[0];
									if (f) handleInlineImage(f);
									e.target.value = "";
								}}
							/>
						</label>
					</div>
					<div
						onDragOver={(e) => {
							e.preventDefault();
							setDragOver("content");
						}}
						onDragLeave={() => setDragOver(null)}
						onDrop={(e) => {
							e.preventDefault();
							setDragOver(null);
							const files = Array.from(e.dataTransfer.files || []);
							if (files.length > 0) {
								handleContentFiles(files);
								return;
							}
							const url =
								e.dataTransfer.getData("text/uri-list") ||
								e.dataTransfer.getData("text/plain");
							if (url) handleContentLink(url.split("\n")[0] || "");
						}}
					>
						<textarea
							ref={contentRef}
							id="pe-content"
							className={`${inputCls} min-h-[320px] font-mono leading-relaxed ${dragOver === "content" ? "border-foreground bg-foreground/5" : ""}`}
							value={form.content}
							onChange={(e) => set("content", e.target.value)}
							onPaste={(e) => {
								const files = Array.from(e.clipboardData.files || []).filter(
									(f) =>
										f.type.startsWith("image/") || f.type.startsWith("video/"),
								);
								if (files.length > 0) {
									e.preventDefault();
									handleContentFiles(files);
								}
							}}
							placeholder="Write the chapter or article body in markdown… (drag & drop images, videos or links)"
						/>
					</div>
					<p className="mt-1 font-sans text-muted-foreground text-xs">
						{dragOver === "content"
							? "Drop to upload & insert…"
							: `${form.content.length.toLocaleString()} characters · markdown supported · drag & drop images, videos or links`}
					</p>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className={labelCls} htmlFor="pe-seo-title">
							SEO title
						</label>
						<input
							id="pe-seo-title"
							className={inputCls}
							value={form.seoTitle}
							onChange={(e) => set("seoTitle", e.target.value)}
						/>
					</div>
					<div>
						<label className={labelCls} htmlFor="pe-seo-desc">
							SEO description
						</label>
						<input
							id="pe-seo-desc"
							className={inputCls}
							value={form.seoDescription}
							onChange={(e) => set("seoDescription", e.target.value)}
						/>
					</div>
				</div>
			</div>
			<aside className="space-y-5">
				<div className="border border-rule p-4">
					<p className={labelCls}>Cover image (Supabase)</p>
					{form.coverImageUrl && (
						<div className="mb-3">
							<Image
								src={form.coverImageUrl}
								alt={form.coverImageAlt || form.title}
								width={400}
								height={225}
								className="w-full border border-rule object-cover"
							/>
						</div>
					)}
					<div
						onDragOver={(e) => {
							e.preventDefault();
							setDragOver("cover");
						}}
						onDragLeave={() => setDragOver(null)}
						onDrop={(e) => {
							e.preventDefault();
							setDragOver(null);
							const f = e.dataTransfer.files?.[0];
							if (!f) return;
							if (!f.type.startsWith("image/")) {
								toast.error("Cover only accepts image files");
								return;
							}
							handleCoverFile(f);
						}}
						className={dragOver === "cover" ? "bg-foreground/5" : ""}
					>
						<label className="block cursor-pointer border border-rule border-dashed p-3 text-center font-sans text-muted-foreground text-xs">
							{uploading === "cover"
								? "Uploading…"
								: dragOver === "cover"
									? "Drop image to upload…"
									: "Drag & drop or click to upload image (max 5MB)"}
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									const f = e.target.files?.[0];
									if (f) handleCoverFile(f);
									e.target.value = "";
								}}
							/>
						</label>
					</div>
					<input
						className={`${inputCls} mt-2`}
						value={form.coverImageUrl}
						onChange={(e) => set("coverImageUrl", e.target.value)}
						placeholder="…or paste image URL"
					/>
					<input
						className={`${inputCls} mt-2`}
						value={form.coverImageAlt}
						onChange={(e) => set("coverImageAlt", e.target.value)}
						placeholder="Alt text (accessibility + SEO)"
					/>
				</div>
				<div className="border border-rule p-4">
					<p className={labelCls}>Video (Supabase or embed)</p>
					<select
						className={inputCls}
						value={form.videoProvider}
						onChange={(e) =>
							set("videoProvider", e.target.value as PostForm["videoProvider"])
						}
					>
						<option value="none">No video</option>
						<option value="upload">Supabase upload</option>
						<option value="youtube">YouTube embed</option>
						<option value="external">External URL</option>
					</select>
					<div
						className={`mt-2 ${dragOver === "video" ? "bg-foreground/5" : ""}`}
						onDragOver={(e) => {
							e.preventDefault();
							setDragOver("video");
						}}
						onDragLeave={() => setDragOver(null)}
						onDrop={(e) => {
							e.preventDefault();
							setDragOver(null);
							const f = e.dataTransfer.files?.[0];
							if (f) {
								if (!f.type.startsWith("video/")) {
									toast.error("Only video files can be dropped here");
									return;
								}
								handleVideoFile(f);
								return;
							}
							const url =
								e.dataTransfer.getData("text/uri-list") ||
								e.dataTransfer.getData("text/plain");
							if (url) handleVideoLink(url.split("\n")[0] || "");
						}}
					>
						<label className="block cursor-pointer border border-rule border-dashed p-3 text-center font-sans text-muted-foreground text-xs">
							{uploading === "video"
								? "Uploading…"
								: dragOver === "video"
									? "Drop video to upload…"
									: "Drag & drop or click to upload video (max 100MB)"}
							<input
								type="file"
								accept="video/*"
								className="hidden"
								onChange={(e) => {
									const f = e.target.files?.[0];
									if (f) handleVideoFile(f);
									e.target.value = "";
								}}
							/>
						</label>
					</div>
					{form.videoProvider !== "none" && form.videoProvider !== "upload" && (
						<input
							className={`${inputCls} mt-2`}
							value={form.videoUrl}
							onChange={(e) => set("videoUrl", e.target.value)}
							placeholder="https://youtube.com/watch?v=…"
						/>
					)}
					{form.videoUrl && (
						<p className="mt-2 break-all font-sans text-muted-foreground text-xs">
							{form.videoUrl}
						</p>
					)}
				</div>
				<div className="border border-rule p-4">
					<p className={labelCls}>Category & tags</p>
					<select
						className={inputCls}
						value={form.categoryId}
						onChange={(e) => set("categoryId", e.target.value)}
					>
						<option value="">No category</option>
						{(categoriesQuery.data?.categories || []).map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
					<div className="mt-3 flex flex-wrap gap-2">
						{(tagsQuery.data?.tags || []).map((t) => {
							const active = form.tagIds.includes(t.id);
							return (
								<button
									key={t.id}
									type="button"
									onClick={() =>
										set(
											"tagIds",
											active
												? form.tagIds.filter((id) => id !== t.id)
												: [...form.tagIds, t.id],
										)
									}
									className={`border px-2 py-1 font-sans text-xs ${active ? "border-foreground bg-foreground text-background" : "border-rule text-muted-foreground"}`}
								>
									{t.name}
								</button>
							);
						})}
					</div>
				</div>
				<div className="border border-rule p-4">
					<label className="flex cursor-pointer items-center gap-2 font-sans text-sm">
						<input
							type="checkbox"
							checked={form.featured}
							onChange={(e) => set("featured", e.target.checked)}
						/>
						Featured on homepage
					</label>
					<button
						type="button"
						disabled={saveMutation.isPending}
						onClick={() => saveMutation.mutate()}
						className="mt-4 w-full bg-foreground py-2 font-sans text-background text-sm disabled:opacity-50"
					>
						{saveMutation.isPending
							? "Saving…"
							: initialId
								? "Save changes"
								: "Create post"}
					</button>
				</div>
			</aside>
		</div>
	);
}

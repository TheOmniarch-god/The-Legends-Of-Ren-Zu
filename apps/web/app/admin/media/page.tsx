"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export default function AdminMediaPage() {
	const [kind, setKind] = useState<string>("");
	const [uploading, setUploading] = useState(false);
	const listQuery = useQuery(
		orpc.admin.media.list.queryOptions({
			input: {
				kind: (kind || undefined) as "image" | "video" | undefined,
				limit: 60,
				offset: 0,
			},
		}),
	);
	const deleteMutation = useMutation({
		mutationFn: async (asset: { id: string; bucket: string; path: string }) => {
			const res = await fetch("/api/admin/storage", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					bucket: asset.bucket,
					path: asset.path,
					assetId: asset.id,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Delete failed");
		},
		onSuccess: () => {
			toast.success("File deleted from Supabase");
			listQuery.refetch();
		},
		onError: (error) => toast.error(error.message),
	});

	const handleUpload = async (files: FileList | null) => {
		if (!files || files.length === 0) return;
		setUploading(true);
		try {
			for (const file of Array.from(files)) {
				const isVideo = file.type.startsWith("video/");
				const form = new FormData();
				form.append("file", file);
				form.append("kind", isVideo ? "video" : "image");
				form.append("alt", file.name);
				const res = await fetch("/api/admin/upload", {
					method: "POST",
					body: form,
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || `Failed: ${file.name}`);
			}
			toast.success("Uploaded to Supabase Storage");
			listQuery.refetch();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	const copy = (url: string) => {
		navigator.clipboard.writeText(url);
		toast.success("URL copied");
	};

	return (
		<div>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<select
					className="border border-rule bg-background px-3 py-2 font-sans text-sm"
					value={kind}
					onChange={(e) => setKind(e.target.value)}
				>
					<option value="">Images + videos</option>
					<option value="image">Images</option>
					<option value="video">Videos</option>
				</select>
				<label className="cursor-pointer bg-foreground px-4 py-2 font-sans text-background text-sm">
					{uploading ? "Uploading…" : "+ Upload to Supabase"}
					<input
						type="file"
						multiple
						accept="image/*,video/*"
						className="hidden"
						onChange={(e) => {
							handleUpload(e.target.files);
							e.target.value = "";
						}}
					/>
				</label>
			</div>
			{listQuery.isPending ? (
				<p className="font-sans text-muted-foreground text-sm">
					Loading media…
				</p>
			) : listQuery.isError ? (
				<p className="font-sans text-sm">
					Media library unavailable — check DB connection.
				</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{(listQuery.data?.assets || []).map((asset) => (
						<div key={asset.id} className="border border-rule">
							{asset.kind === "image" ? (
								<Image
									src={asset.url}
									alt={asset.alt || asset.path}
									width={480}
									height={270}
									className="aspect-video w-full object-cover"
								/>
							) : (
								// biome-ignore lint/a11y/useMediaCaption: admin preview of user-uploaded file
								<video
									src={asset.url}
									controls
									className="aspect-video w-full bg-black"
								/>
							)}
							<div className="p-3">
								<p className="truncate font-mono text-muted-foreground text-xs">
									{asset.path}
								</p>
								<p className="font-sans text-muted-foreground text-xs">
									{asset.bucket} · {asset.kind}
									{asset.size ? ` · ${(asset.size / 1024).toFixed(0)} KB` : ""}
								</p>
								<div className="mt-2 flex gap-2">
									<button
										type="button"
										className="border border-rule px-3 py-1 font-sans text-xs"
										onClick={() => copy(asset.url)}
									>
										Copy URL
									</button>
									<button
										type="button"
										className="border border-rule px-3 py-1 font-sans text-red-500 text-xs"
										onClick={() => {
											if (confirm("Delete this file from Supabase Storage?")) {
												deleteMutation.mutate({
													id: asset.id,
													bucket: asset.bucket,
													path: asset.path,
												});
											}
										}}
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

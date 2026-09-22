import { mediaAssets } from "@renzu-bts/db/schema/blog";

import {
	getSupabaseAdmin,
	IMAGE_BUCKET,
	publicUrlFor,
	VIDEO_BUCKET,
} from "@/lib/supabase-server";
import { requireAdminAccess } from "@/server/admin-guard";
import { db } from "@/server/services";

const IMAGE_MAX = 5 * 1024 * 1024;
const VIDEO_MAX = 100 * 1024 * 1024;

function sanitize(name: string) {
	return (
		name
			.toLowerCase()
			.replace(/[^a-z0-9._-]+/g, "-")
			.slice(0, 120) || "file"
	);
}

export async function POST(request: Request) {
	try {
		const admin = await requireAdminAccess();
		const form = await request.formData();
		const file = form.get("file") as File | null;
		const kind = (form.get("kind") as string) === "video" ? "video" : "image";
		const alt = ((form.get("alt") as string) || "").slice(0, 300);
		const postId = ((form.get("postId") as string) || "").slice(0, 100) || null;
		if (!file || file.size === 0) {
			return Response.json({ error: "No file provided" }, { status: 400 });
		}
		const max = kind === "video" ? VIDEO_MAX : IMAGE_MAX;
		if (file.size > max) {
			return Response.json(
				{ error: `File too large (max ${kind === "video" ? "100MB" : "5MB"})` },
				{ status: 400 },
			);
		}
		if (kind === "image" && !file.type.startsWith("image/")) {
			return Response.json(
				{ error: "Expected an image file" },
				{ status: 400 },
			);
		}
		if (kind === "video" && !file.type.startsWith("video/")) {
			return Response.json({ error: "Expected a video file" }, { status: 400 });
		}
		const bucket = kind === "video" ? VIDEO_BUCKET : IMAGE_BUCKET;
		const folder = postId || "general";
		const path = `${folder}/${Date.now()}-${sanitize(file.name)}`;
		const supabase = getSupabaseAdmin();
		const buffer = Buffer.from(await file.arrayBuffer());
		const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
			contentType: file.type,
			upsert: false,
		});
		if (error) {
			return Response.json({ error: error.message }, { status: 500 });
		}
		const url = publicUrlFor(bucket, path);
		const created = await db
			.insert(mediaAssets)
			.values({
				bucket,
				path,
				url,
				kind,
				mimeType: file.type,
				size: file.size,
				alt,
				postId,
				uploadedBy: admin.id,
			})
			.returning();
		return Response.json({
			success: true,
			url,
			path,
			bucket,
			asset: created[0],
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Upload failed";
		const status =
			message.includes("Unauthorized") || message.includes("Admin") ? 403 : 500;
		return Response.json({ error: message }, { status });
	}
}

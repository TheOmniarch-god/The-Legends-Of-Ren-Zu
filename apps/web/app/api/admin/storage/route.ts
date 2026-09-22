import { mediaAssets } from "@renzu-bts/db/schema/blog";
import { eq } from "drizzle-orm";

import { getSupabaseAdmin } from "@/lib/supabase-server";
import { requireAdmin } from "@/server/admin-guard";
import { db } from "@/server/services";

export async function DELETE(request: Request) {
	try {
		await requireAdmin();
		const body = await request.json();
		const { bucket, path, assetId } = body as {
			bucket?: string;
			path?: string;
			assetId?: string;
		};
		if (!bucket || !path) {
			return Response.json(
				{ error: "bucket and path required" },
				{ status: 400 },
			);
		}
		const supabase = getSupabaseAdmin();
		const { error } = await supabase.storage.from(bucket).remove([path]);
		if (error) {
			return Response.json({ error: error.message }, { status: 500 });
		}
		if (assetId) {
			await db.delete(mediaAssets).where(eq(mediaAssets.id, assetId));
		} else {
			// Best-effort: remove any asset rows pointing at this object
			const rows = await db.select().from(mediaAssets);
			const match = rows.find((r) => r.bucket === bucket && r.path === path);
			if (match)
				await db.delete(mediaAssets).where(eq(mediaAssets.id, match.id));
		}
		return Response.json({ success: true });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Delete failed";
		const status =
			message.includes("Unauthorized") || message.includes("Admin") ? 403 : 500;
		return Response.json({ error: message }, { status });
	}
}

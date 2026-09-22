import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { ENV } from "@/env";

let cached: SupabaseClient | null = null;

function resolveUrl() {
	return (
		ENV.SUPABASE_URL ||
		ENV.NEXT_PUBLIC_SUPABASE_URL ||
		process.env.SUPABASE_URL ||
		process.env.NEXT_PUBLIC_SUPABASE_URL ||
		""
	);
}

function resolveServiceKey() {
	return (
		ENV.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
	);
}

function resolveAnonKey() {
	return (
		ENV.SUPABASE_ANON_KEY ||
		ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
		process.env.SUPABASE_ANON_KEY ||
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
		""
	);
}

export function isSupabaseConfigured() {
	return Boolean(resolveUrl() && (resolveServiceKey() || resolveAnonKey()));
}

/** Service-role client for server-side uploads / admin storage ops. */
export function getSupabaseAdmin(): SupabaseClient {
	if (cached) return cached;
	const url = resolveUrl();
	const serviceKey = resolveServiceKey();
	if (!url) throw new Error("Supabase is not configured (SUPABASE_URL).");
	if (!serviceKey) {
		// Fall back to anon key for read-only paths; writes will fail with RLS.
		const anon = resolveAnonKey();
		if (!anon) throw new Error("Supabase keys are not configured.");
		cached = createClient(url, anon);
		return cached;
	}
	cached = createClient(url, serviceKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	return cached;
}

export const IMAGE_BUCKET = "blog-images";
export const VIDEO_BUCKET = "blog-videos";

export function publicUrlFor(bucket: string, path: string) {
	const url = resolveUrl();
	if (!url) return "";
	return `${url.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path}`;
}

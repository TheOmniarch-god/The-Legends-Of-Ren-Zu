import { SITE_URL } from "@/lib/seo";

/**
 * Notify Bing/Yandex about a new or updated URL via the IndexNow protocol.
 * Fire-and-forget: resolves silently when INDEXNOW_KEY is unset or the
 * request fails, so publishing can never break because of it.
 *
 * One-time setup: generate a key at Bing Webmaster Tools, host it at
 * `https://<your-domain>/<KEY>.txt` (content = the key itself), then set
 * the INDEXNOW_KEY env var to the same value and redeploy.
 */
export async function submitToIndexNow(url: string): Promise<void> {
	const key = process.env.INDEXNOW_KEY;
	if (!key) return;
	try {
		const host = new URL(SITE_URL).host;
		await fetch("https://www.bing.com/indexnow", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ host, key, urlList: [url] }),
		});
	} catch {
		// Search-engine notification must never break publishing.
	}
}

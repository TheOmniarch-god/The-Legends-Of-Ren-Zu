import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { onPostChange } from "@renzu-bts/api/routers/admin";
import { appRouter } from "@renzu-bts/api/routers/index";
import { revalidatePath } from "next/cache";

import { createContext } from "@/server/context";
import { submitToIndexNow } from "@/lib/indexnow";
import { postPath, SITE_URL } from "@/lib/seo";

// Whenever an admin creates, updates, publishes, unpublishes or deletes a
// post, drop the full route cache (sitemap, hubs, llms.txt, article pages)
// so the change is live within seconds instead of waiting for the
// time-based revalidation window. Newly published URLs are also pushed to
// IndexNow (Bing/Yandex) when INDEXNOW_KEY is configured.
onPostChange((event) => {
	try {
		revalidatePath("/", "layout");
	} catch {
		// Cache refresh must never break publishing.
	}
	if (event.status === "published") {
		void submitToIndexNow(`${SITE_URL}${postPath(event.type, event.slug)}`);
	}
});

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

async function handle(request: Request) {
	const context = await createContext();
	const result = await rpcHandler.handle(request, {
		prefix: "/api/rpc",
		context,
	});

	if (result.matched) {
		return result.response;
	}

	return Response.json({ error: "Not found" }, { status: 404 });
}

export {
	handle as DELETE,
	handle as GET,
	handle as PATCH,
	handle as POST,
	handle as PUT,
};

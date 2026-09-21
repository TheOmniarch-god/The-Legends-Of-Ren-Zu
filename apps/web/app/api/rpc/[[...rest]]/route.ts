import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { appRouter } from "@renzu-bts/api/routers/index";

import { createContext } from "@/server/context";

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

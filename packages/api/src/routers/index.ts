import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { hallRouter } from "./hall";
import { libraryRouter } from "./library";
import { paymentsRouter } from "./payments";
import { readerRouter } from "./reader";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	reader: readerRouter,
	library: libraryRouter,
	hall: hallRouter,
	payments: paymentsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;

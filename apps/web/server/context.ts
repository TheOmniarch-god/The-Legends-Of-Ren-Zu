import type { Context as ApiContext } from "@renzu-bts/api/context";
import { headers } from "next/headers";

import { auth, db } from "./services";

export async function createContext(): Promise<ApiContext> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return {
		db,
		session,
	};
}

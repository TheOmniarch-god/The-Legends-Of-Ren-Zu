import type { Context as ApiContext } from "@renzu-bts/api/context";
import { headers } from "next/headers";

import { ENV } from "@/env";
import { auth, db } from "./services";

export async function createContext(): Promise<ApiContext> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const adminEmails = (ENV.ADMIN_EMAILS || "")
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	return {
		db,
		session,
		adminEmails,
	};
}

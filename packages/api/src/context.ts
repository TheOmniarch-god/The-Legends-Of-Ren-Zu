import type { Session } from "@renzu-bts/auth";
import type { Database } from "@renzu-bts/db";

export type Context = {
	session: Session | null;
	db: Database;
	/** Bootstrap admin emails (from web ENV.ADMIN_EMAILS) — fallback when role is unset. */
	adminEmails?: string[];
};

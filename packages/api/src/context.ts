import type { Session } from "@renzu-bts/auth";
import type { Database } from "@renzu-bts/db";

export type Context = {
	session: Session | null;
	db: Database;
};

import { createAuth } from "@renzu-bts/auth";
import { createDb } from "@renzu-bts/db";

import { ENV } from "@/env";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);

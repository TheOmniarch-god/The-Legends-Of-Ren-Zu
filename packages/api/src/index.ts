import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";

import { user } from "@renzu-bts/db/schema/auth";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);

async function resolveRole(context: Context): Promise<string | null> {
	const sessionUser = context.session?.user as unknown as
		| { id?: string; email?: string | null; role?: string | null }
		| undefined;
	if (sessionUser?.role === "admin" || sessionUser?.role === "editor") {
		return sessionUser.role;
	}
	const userId = sessionUser?.id;
	if (userId) {
		try {
			const rows = await context.db
				.select({ role: user.role, email: user.email })
				.from(user)
				.where(eq(user.id, userId))
				.limit(1);
			if (rows[0]?.role === "admin" || rows[0]?.role === "editor") {
				return rows[0].role;
			}
		} catch {
			// fall through to bootstrap-email check
		}
	}
	const email = sessionUser?.email?.toLowerCase();
	if (email && (context.adminEmails || []).includes(email)) return "admin";
	return null;
}

/** Allows admin + editor. */
const requireAdminAccess = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) throw new ORPCError("UNAUTHORIZED");
	const role = await resolveRole(context);
	if (!role)
		throw new ORPCError("FORBIDDEN", { message: "Admin access required" });
	return next({ context: { adminRole: role as "admin" | "editor" } });
});

/** Admin only (user management, destructive ops). Editors are rejected. */
const requireAdmin = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) throw new ORPCError("UNAUTHORIZED");
	const role = await resolveRole(context);
	if (role !== "admin")
		throw new ORPCError("FORBIDDEN", { message: "Admin role required" });
	return next({ context: { adminRole: "admin" as const } });
});

export const adminProcedure = publicProcedure.use(requireAdminAccess);
export const superAdminProcedure = publicProcedure.use(requireAdmin);

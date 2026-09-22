import { user } from "@renzu-bts/db/schema/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { ENV } from "@/env";
import { auth, db } from "./services";

export type AdminSession = {
	id: string;
	email: string | null;
	name: string;
	role: "admin" | "editor" | "reader";
};

function bootstrapEmails(): string[] {
	return ((ENV.ADMIN_EMAILS || "") as string)
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
}

export async function getAdminSession(): Promise<AdminSession | null> {
	const session = await auth.api.getSession({ headers: await headers() });
	const sessionUser = session?.user as unknown as
		| { id: string; email?: string | null; name?: string }
		| undefined;
	if (!sessionUser) return null;
	let role: AdminSession["role"] = "reader";
	try {
		const rows = await db
			.select({ role: user.role, email: user.email, name: user.name })
			.from(user)
			.where(eq(user.id, sessionUser.id))
			.limit(1);
		if (rows[0]?.role === "admin" || rows[0]?.role === "editor") {
			role = rows[0].role;
		}
	} catch {
		// DB unreachable — fall back to bootstrap list only
	}
	const email = sessionUser.email || null;
	if (
		role === "reader" &&
		email &&
		bootstrapEmails().includes(email.toLowerCase())
	) {
		role = "admin";
	}
	return { id: sessionUser.id, email, name: "", role };
}

export async function requireAdminAccess(): Promise<AdminSession> {
	const admin = await getAdminSession();
	if (!admin) throw new Error("Unauthorized");
	if (admin.role !== "admin" && admin.role !== "editor") {
		throw new Error("Admin access required");
	}
	return admin;
}

export async function requireAdmin(): Promise<AdminSession> {
	const admin = await getAdminSession();
	if (!admin) throw new Error("Unauthorized");
	if (admin.role !== "admin") throw new Error("Admin role required");
	return admin;
}

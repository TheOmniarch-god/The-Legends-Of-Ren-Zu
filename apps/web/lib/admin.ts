import { ENV } from "@/env";

export type AdminRole = "admin" | "editor" | "reader";

export function bootstrapAdminEmails(): string[] {
	const raw = ENV.ADMIN_EMAILS || process.env.ADMIN_EMAILS || "";
	return raw
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
}

export function isBootstrapAdmin(email?: string | null) {
	if (!email) return false;
	return bootstrapAdminEmails().includes(email.toLowerCase());
}

export function hasAdminAccess(
	user: { email?: string | null; role?: string | null } | null | undefined,
) {
	if (!user) return false;
	if (user.role === "admin" || user.role === "editor") return true;
	return isBootstrapAdmin(user.email);
}

export function isAdmin(
	user: { email?: string | null; role?: string | null } | null | undefined,
) {
	if (!user) return false;
	if (user.role === "admin") return true;
	return isBootstrapAdmin(user.email);
}

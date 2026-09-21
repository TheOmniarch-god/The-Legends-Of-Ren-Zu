import { createAuthClient } from "better-auth/react";

// better-auth joins request URLs with `new URL(path, baseURL)`, which
// throws on a relative base — so the base must be absolute everywhere.
// BETTER_AUTH_URL already ends in /api/auth (see .env.schema).
function resolveBaseURL() {
	if (typeof window !== "undefined")
		return `${window.location.origin}/api/auth`;
	const root = (
		process.env.BETTER_AUTH_URL || "http://localhost:3001/api/auth"
	).replace(/\/$/, "");
	return root.endsWith("/api/auth") ? root : `${root}/api/auth`;
}

export const authClient = createAuthClient({
	baseURL: resolveBaseURL(),
});

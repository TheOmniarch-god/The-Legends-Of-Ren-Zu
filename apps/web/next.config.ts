import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();

import type { NextConfig } from "next";

import { withPwa } from "./pwa.config";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**.supabase.co" },
			{ protocol: "https", hostname: "**.supabase.in" },
		],
	},
	transpilePackages: [
		"shiki",
		"@renzu-bts/api",
		"@renzu-bts/auth",
		"@renzu-bts/db",
	],
};

export default withVarlock(withPwa(nextConfig));

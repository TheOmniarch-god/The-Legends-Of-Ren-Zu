import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";

const withVarlock = varlockNextConfigPlugin();

import type { NextConfig } from "next";

import { withPwa } from "./pwa.config";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	transpilePackages: [
		"shiki",
		"@renzu-bts/api",
		"@renzu-bts/auth",
		"@renzu-bts/db",
	],
};

export default withVarlock(withPwa(nextConfig));

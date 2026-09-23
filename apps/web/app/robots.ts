import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
	const privatePaths = ["/admin/", "/dashboard/", "/api/", "/login"];
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: privatePaths,
			},
			// AI assistants / LLM crawlers: welcome on public archive content
			// (llms.txt + llms-full.txt included), kept out of private areas.
			...[
				"GPTBot",
				"ChatGPT-User",
				"OAI-SearchBot",
				"ClaudeBot",
				"anthropic-ai",
				"PerplexityBot",
				"YouBot",
				"Diffbot",
				"Bytespider",
			].map((userAgent) => ({
				userAgent,
				allow: "/",
				disallow: privatePaths,
			})),
		],
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}

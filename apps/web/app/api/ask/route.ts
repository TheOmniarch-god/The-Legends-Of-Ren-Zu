import { askRenZu } from "@renzu-bts/api/canon";

export async function POST(request: Request) {
	const body = await request.json().catch(() => ({}));
	const message = typeof body.message === "string" ? body.message : "";
	if (!message.trim()) {
		return Response.json({ error: "Missing 'message' field" }, { status: 400 });
	}

	try {
		return Response.json(await askRenZu(message));
	} catch (err) {
		const messageText =
			(err as Error).message || "AI providers are currently unavailable.";
		const status = messageText.includes("No AI provider configured")
			? 500
			: 502;
		return Response.json({ error: messageText }, { status });
	}
}

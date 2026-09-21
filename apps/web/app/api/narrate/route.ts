import { Buffer } from "node:buffer";

function applyPhonemes(raw: string) {
	let s = raw
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
	const subs: Array<[RegExp, string]> = [
		[
			/\bGu Worms?\b/g,
			'<phoneme alphabet="ipa" ph="ɡuː wɜːm">Gu Worm</phoneme>',
		],
		[/\bRen Zu\b/g, '<phoneme alphabet="ipa" ph="rɛn zuː">Ren Zu</phoneme>'],
		[/\bGu\b/g, '<phoneme alphabet="ipa" ph="ɡuː">Gu</phoneme>'],
		[
			/\bFang Yuan\b/g,
			'<phoneme alphabet="ipa" ph="fɑːŋ yɛn">Fang Yuan</phoneme>',
		],
		[
			/\bGu Masters?\b/g,
			'<phoneme alphabet="ipa" ph="ɡuː mɑːstər">Gu Master</phoneme>',
		],
		[
			/\bGu Zhen Ren\b/g,
			'<phoneme alphabet="ipa" ph="ɡuː ʒɛn rɛn">Gu Zhen Ren</phoneme>',
		],
		[/\./g, '.<break time="80ms"/>'],
	];
	for (const [pattern, replacement] of subs)
		s = s.replace(pattern, replacement);
	return `<speak>${s}</speak>`;
}

function wavBytes(pcm: Buffer) {
	const header = Buffer.alloc(44);
	header.write("RIFF", 0);
	header.writeUInt32LE(36 + pcm.length, 4);
	header.write("WAVE", 8);
	header.write("fmt ", 12);
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(1, 20);
	header.writeUInt16LE(1, 22);
	header.writeUInt32LE(24000, 24);
	header.writeUInt32LE(48000, 28);
	header.writeUInt16LE(2, 32);
	header.writeUInt16LE(16, 34);
	header.write("data", 36);
	header.writeUInt32LE(pcm.length, 40);
	return Buffer.concat([header, pcm]);
}

async function googleAccessToken(serviceAccountJson: string) {
	const sa = JSON.parse(serviceAccountJson);
	const now = Math.floor(Date.now() / 1000);
	const enc = (obj: unknown) =>
		Buffer.from(JSON.stringify(obj)).toString("base64url");
	const signingInput = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({
		iss: sa.client_email,
		scope: "https://www.googleapis.com/auth/cloud-platform",
		aud: "https://oauth2.googleapis.com/token",
		iat: now,
		exp: now + 3600,
	})}`;
	const pemBody = String(sa.private_key)
		.replace("-----BEGIN PRIVATE KEY-----", "")
		.replace("-----END PRIVATE KEY-----", "")
		.replace(/\s/g, "");
	const key = await crypto.subtle.importKey(
		"pkcs8",
		Buffer.from(pemBody, "base64"),
		{ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign(
		"RSASSA-PKCS1-v1_5",
		key,
		Buffer.from(signingInput),
	);
	const jwt = `${signingInput}.${Buffer.from(sig).toString("base64url")}`;
	const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion: jwt,
		}),
	});
	if (!tokenRes.ok)
		throw new Error(
			`Token exchange failed: ${(await tokenRes.text()).slice(0, 200)}`,
		);
	const tokenData = (await tokenRes.json()) as {
		access_token?: string;
	};
	return tokenData.access_token as string;
}

export async function POST(request: Request) {
	const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
	if (!saJson) {
		return Response.json(
			{ error: "Google Service Account not configured." },
			{ status: 500 },
		);
	}

	const body = await request.json().catch(() => ({}));
	const text = typeof body.text === "string" ? body.text : "";
	if (!text) {
		return Response.json({ error: "Missing 'text' field" }, { status: 400 });
	}
	if (text.length > 5000) {
		return Response.json(
			{ error: "Text too long (max 5000 characters)" },
			{ status: 400 },
		);
	}

	const voice =
		typeof body.voice === "string" && body.voice
			? body.voice
			: "en-US-Neural2-A";
	const langCode = voice.startsWith("en-GB") ? "en-GB" : "en-US";
	let rate = typeof body.speakingRate === "number" ? body.speakingRate : 1.0;
	rate = Math.max(0.25, Math.min(4.0, rate));

	try {
		const token = await googleAccessToken(saJson);
		const ttsRes = await fetch(
			"https://texttospeech.googleapis.com/v1/text:synthesize",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					input: { ssml: applyPhonemes(text) },
					voice: { languageCode: langCode, name: voice },
					audioConfig: {
						audioEncoding: "LINEAR16",
						sampleRateHertz: 24000,
						speakingRate: rate,
					},
				}),
			},
		);
		if (!ttsRes.ok) {
			return Response.json(
				{ error: `TTS API error: ${ttsRes.status}` },
				{ status: 502 },
			);
		}
		const data = (await ttsRes.json()) as { audioContent?: string };
		if (!data.audioContent) {
			return Response.json(
				{ error: "No audio content in response" },
				{ status: 502 },
			);
		}
		const wav = wavBytes(Buffer.from(data.audioContent, "base64"));
		return new Response(new Uint8Array(wav), {
			headers: {
				"Content-Type": "audio/wav",
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (err) {
		return Response.json(
			{ error: `TTS service failed: ${(err as Error).message}` },
			{ status: 502 },
		);
	}
}

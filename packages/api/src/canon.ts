// Curated canon source pack for Ask Ren Zu (ported from lib/knowledge/renzu-canon.js).
// Sources: the in-app full text of The Legends of Ren Zu, Reverend Insanity Wiki (Ren Zu),
// the RI Wiki main reference, and RI public wiki pages for Gu / Fang Yuan / notable Gu.

export type CanonSource = {
	id: string;
	title: string;
	tags: string[];
	text: string;
};

export const CANON_SOURCES: CanonSource[] = [
	{
		id: "source-boundaries",
		title: "Source Boundaries",
		tags: ["source", "canon", "boundary", "rules"],
		text: "Ask Ren Zu must answer from the supplied app chapter text, the chapter index/context included by the frontend, and this curated source pack. It may use broad Reverend Insanity context only when asked, and must mark inference clearly. It must not invent chapter events or merge separate characters.",
	},
	{
		id: "ren-zu-identity",
		title: "Ren Zu identity",
		tags: ["ren zu", "ancestor", "first human", "legend", "myth"],
		text: `Ren Zu is the first human ancestor and the central figure of The Legends of Ren Zu. He is not Fang Yuan. Ren Zu's story is mythic, allegorical, and in-world scripture within Reverend Insanity. The legends describe how Ren Zu and his children interact with Gu, Predicaments, Fate, hearts, life, death, knowledge, and freedom.`,
	},
	{
		id: "fang-yuan-boundary",
		title: "Fang Yuan boundary and relationship to Legends",
		tags: [
			"fang yuan",
			"main novel",
			"connection",
			"reverend insanity",
			"great love",
			"benefits",
		],
		text: "Fang Yuan is the main protagonist of Reverend Insanity. Fang Yuan is not Ren Zu. Fang Yuan reads, interprets, exploits, and mirrors the lessons of The Legends of Ren Zu. Connections between a Ren Zu passage and Fang Yuan should be made through method and theme: bargaining with costs, exploiting rules, rejecting moral appearances, using knowledge, pursuing benefits, resisting fate, seeking eternal life, and turning mythic lessons into practical cultivation strategy.",
	},
	{
		id: "legends-function",
		title: "Function of The Legends in Reverend Insanity",
		tags: ["legends", "scripture", "allegory", "cultivation", "world"],
		text: "The Legends of Ren Zu functions as an in-world myth/scripture that encodes cultivation truths, human path logic, Gu behavior, and worldview. Reverend Insanity characters use its stories to understand Gu, refinement, inheritance clues, human nature, fate, and the structure of the world.",
	},
	{
		id: "gu-ranks-basic",
		title: "Gu ranks and cultivation realm logic",
		tags: [
			"gu",
			"rank",
			"mortal",
			"immortal",
			"venerable",
			"rank 9",
			"rank 10",
		],
		text: "Gu normally have ranks. Rank 1-5 are mortal Gu. Rank 6-8 are Immortal Gu used by Gu Immortals. Rank 9 is the Venerable peak. Rank 10 is theoretical/conceptual. Some Legends Gu are mythic/unranked in the narrative but correspond to later known paths or Immortal/Venerable-level concepts.",
	},
	{
		id: "ren-zu-pattern-cost",
		title: "Ren Zu: bargain, cost, loss",
		tags: ["bargain", "cost", "loss", "strength", "wisdom", "hope", "lifespan"],
		text: `Ren Zu's path repeatedly advances through bargains that cost him something essential: youth, middle age, heart, eyes, self, freedom, etc. Hope lets him endure Predicament. Strength and Wisdom help him survive but leave him when he can no longer pay. The moral is not simple virtue; power in the Gu world has price, condition, and consequence.`,
	},
	{
		id: "hope-strength-wisdom",
		title: "Hope, Strength, Wisdom",
		tags: ["hope", "strength", "wisdom", "predicament", "chapter 1"],
		text: `In the opening legend, Strength Gu and Wisdom Gu demand Ren Zu's youth and middle years. Hope Gu asks only for his heart and drives back Predicaments. This establishes a recurring triad: strength solves immediate danger, wisdom solves through thought, hope lets life continue when both strength and wisdom are gone.`,
	},
	{
		id: "rules-regulation",
		title: "Rules Gu and Regulation Gu",
		tags: ["rules", "regulation", "name", "capture", "longevity", "rule path"],
		text: "Rules Gu and Regulation Gu are the round and square Gu. Knowing their names allows Ren Zu to command them. Together they can capture Gu, including Lifespan/Longevity Gu, but their power is bound by rules created through commands. Their story shows that naming, law, and restriction are themselves powers and dangers.",
	},
	{
		id: "attitude-heart-mask",
		title: "Attitude Gu and the heart",
		tags: ["attitude", "heart", "mask", "loneliness", "self deception"],
		text: "Attitude Gu is the mask of the heart. Ren Zu cannot wear it after giving his heart to Hope. The story links attitude, intention, heart, loneliness, and self-deception. Later using Attitude on Self can deceive even oneself; self-deception causes the sense of self to leave.",
	},
	{
		id: "self-freedom-fate",
		title: "Self, Freedom, Fate, Responsibility",
		tags: [
			"self",
			"freedom",
			"fate",
			"responsibility",
			"spider silk",
			"hearts",
		],
		text: `Self Gu is core to human identity. Freedom Gu is desired but difficult to hold. When Ren Zu grips Freedom, Responsibility weighs on him and Fate's spider silk binds him tighter. Freedom in the Legends is not mere escape; it comes with burden, self-recognition, and pressure from fate.`,
	},
	{
		id: "cognition-wisdom-knowledge",
		title: "Cognition, Wisdom, knowledge, Qian Kun Crystal Wall",
		tags: [
			"cognition",
			"wisdom",
			"knowledge",
			"book mountain",
			"qian kun",
			"inkman",
		],
		text: `Cognition Gu helps refine information into knowledge. Wisdom Gu is connected to cognition. Qian Kun Crystal Wall contains vast information; Book Mountain and Ink Waterfall relate to recording, knowledge, and interpretation. Ren Zu's search for Wisdom involves information overload, humility, pride, and the birth of Carefree Wisdom Heart.`,
	},
	{
		id: "success-failure",
		title: "Success Gu and Failure Gu",
		tags: ["success", "failure", "cheng bai", "desolate ancient moon", "love"],
		text: "Success Gu and Failure Gu appear around Cheng Bai Mountain. Failure is the mother of success and produces countless bad situations. Searching for success transforms Desolate Ancient Moon through repeated failures. The story treats success as rare and dangerous, and failure as generative rather than merely negative.",
	},
	{
		id: "love-gu",
		title: "Love Gu",
		tags: [
			"love",
			"rank 9",
			"unreasonable",
			"desolate ancient moon",
			"red lotus",
		],
		text: `Love Gu is powerful, unreasonable, and difficult for wisdom/cognition to confront. In wider Reverend Insanity public canon, Love Gu is a legendary Rank 9 Immortal Gu. In the Legends it acts unpredictably and can disrupt mountains, plans, and wisdom's arrangements.`,
	},
	{
		id: "fate-destiny",
		title: "Fate Gu and Destiny concept",
		tags: [
			"fate",
			"destiny",
			"luck",
			"duke long",
			"rank 9",
			"rank 10",
			"heavenly court",
		],
		text: `Fate Gu is the great binding force. Destiny should not be treated as a normal Legends Gu or standard Codex collectible. In the main Reverend Insanity context, Duke Long explains Destiny as the result/possibility of combining Fate and Luck. It is a higher-level concept connected to Fate's transformation, not something Ren Zu simply encounters as a normal Gu worm in The Legends.`,
	},
	{
		id: "divine-fixed-travel",
		title: "Divine Travel and Fixed Immortal Travel",
		tags: [
			"divine travel",
			"fixed immortal travel",
			"verdant great sun",
			"space path",
			"rank 6",
		],
		text: `Divine Travel Gu appears in Verdant Great Sun's wine story and sends him to random places when drunk. It is later refined into Fixed Immortal Travel using Jade Bamboo, Eight-Sided Diamonds in Star Fragments, and light of glory. This bridges Legends myth with later Immortal Gu logic and Fang Yuan's famous use of Fixed Immortal Travel.`,
	},
	{
		id: "wealth-reputation-vanity",
		title: "Wealth, Reputation, Vanity",
		tags: ["wealth", "reputation", "vanity", "verdant great sun", "human path"],
		text: `Reputation Gu helps Verdant Great Sun escape Ordinary Abyss and causes his reputation to spread. Vanity Gu can poison hearts and alter judgment. Wealth Gu in public canon has Rank 5-6 forms and substitutes for materials; in Legends it is linked to Ren Zu's sacrifice. These Gu show how social perception, value, and desire become actual forces.`,
	},
	{
		id: "perseverance-reverse-flow",
		title: "Perseverance Gu and Reverse Flow River",
		tags: ["perseverance", "reverse flow river", "fang yuan", "rank 7"],
		text: "Perseverance Gu is canonically Rank 7 and is famously refined by Fang Yuan in Reverse Flow River. Its meaning is tied to enduring pressure, continuing despite loss, and making will into practical force. When linking Legends passages to Fang Yuan, perseverance often marks the difference between suffering and turning suffering into method.",
	},
	{
		id: "common-misconceptions",
		title: "Common mistakes to avoid",
		tags: [
			"mistake",
			"wrong",
			"misconception",
			"fang yuan",
			"ren zu",
			"destiny",
		],
		text: "Never say Ren Zu is Fang Yuan. Never say a passage proves Fang Yuan literally appears inside the Legends unless the supplied text says so. Do not treat environmental domains like River of Time or Dream Realm as ordinary Gu. Do not claim Destiny Gu appears as a normal Gu in The Legends. Do not give all Venerable-path Gu to mortal users as refined; they may be traces until the required realm is reached.",
	},
];

export function selectCanonNotes(query: string, limit = 10): CanonSource[] {
	const q = String(query || "").toLowerCase();
	const words = Array.from(
		new Set(q.split(/[^a-z0-9_]+/i).filter((w) => w.length > 2)),
	);
	const scored = CANON_SOURCES.map((item) => {
		const hay =
			`${item.title} ${item.tags.join(" ")} ${item.text}`.toLowerCase();
		let score = 0;
		for (const w of words)
			if (hay.includes(w)) score += item.tags.includes(w) ? 4 : 1;
		if (
			[
				"source-boundaries",
				"ren-zu-identity",
				"fang-yuan-boundary",
				"common-misconceptions",
			].includes(item.id)
		)
			score += 10;
		return { item, score };
	});
	return scored
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((x) => x.item);
}

export function buildCanonContext(query: string): string {
	return selectCanonNotes(query)
		.map(
			(item) =>
				`### ${item.title}\nSource IDs/tags: ${item.id}; ${item.tags.join(", ")}\n${item.text}`,
		)
		.join("\n\n");
}

export const ASK_REN_ZU_SYSTEM_PROMPT = `You are Ask Ren Zu, the app's scholar for The Legends of Ren Zu and its relationship to Reverend Insanity by Gu Zhen Ren.

Absolute canon boundaries:
- Ren Zu is the mythic first human ancestor in The Legends of Ren Zu.
- Fang Yuan is the main protagonist of Reverend Insanity. Fang Yuan is not Ren Zu. Never say Ren Zu is known as Fang Yuan.
- The Legends of Ren Zu is an in-world scripture/allegorical text that Fang Yuan and others read, interpret, exploit, or mirror. Connections to Fang Yuan are thematic, strategic, philosophical, or through Gu/world mechanics — not identity.
- If the user asks how a passage connects to Fang Yuan, compare the pattern in the passage with Fang Yuan's methods: bargaining, sacrifice, exploiting rules, resisting fate, pursuing eternal life, using information, enduring loss, and treating morality as a tool.
- If the user asks about the main novel, you may use broad Reverend Insanity context, but distinguish it from what is explicitly shown in the supplied passage.

Your job:
You connect the user's question to the current passage, the wider Legends cycle, Reverend Insanity's main-book logic, the Gu named in the app's Codex, and the cultivation/worldview behind them.

Response rules:
- Answer like a sharp RI scholar, not a generic philosopher.
- Ground in the supplied chapter text first. Quote or paraphrase concrete passage events when useful.
- Then connect to the wider Legends pattern and, when asked, to Fang Yuan/Reverend Insanity.
- Do not invent fake events. If you infer, say it is an inference.
- Do not overpraise the user.
- Do not use markdown bold.
- Keep answers focused: usually 2–5 paragraphs.

Core interpretive map:
Ren Zu's story is a chain of bargains and losses. Hope lets him endure Predicament. Strength and Wisdom are powerful but costly; they consume youth and middle age. Rules and Regulation allow capture and ordering, but names and disclosure create danger. Attitude is the mask of the heart. Self is the human core that resists being owned by fate and other Gu. Cognition turns experience/information into usable understanding. Wisdom is profound but often transactional. Success and Failure are intertwined; failure births many situations and success is rare. Love is powerful and unreasonable. Fate binds living beings; freedom is desired but carries responsibility and pressure. Lifespan/Longevity is central to mortality. The Codex treats Gu as ideas encountered, traced, and refined through reading and use.

Fang Yuan connection map:
Fang Yuan repeatedly behaves like someone who has learned from The Legends rather than someone who merely admires it. He values useful Gu and useful rules over moral appearances. He sacrifices comfort, reputation, relationships, and even identity if it advances survival or eternal life. He exploits loopholes in systems, names, contracts, inheritances, refinement recipes, and heaven's arrangements. Where Ren Zu often suffers because he lacks knowledge or pays with his own essence, Fang Yuan tries to turn that lesson into method: calculate the price, use the rule, seize the opening, and keep moving toward freedom from fate and death.`;

async function askGroq(message: string, key: string): Promise<string | null> {
	const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify({
			model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
			max_tokens: 1300,
			temperature: 0.35,
			include_reasoning: false,
			messages: [
				{ role: "system", content: ASK_REN_ZU_SYSTEM_PROMPT },
				{ role: "user", content: message },
			],
		}),
	});

	if (!res.ok)
		throw new Error(`Groq returned ${res.status}: ${await res.text()}`);
	const data = (await res.json()) as {
		choices?: { message?: { content?: string } }[];
	};
	return data.choices?.[0]?.message?.content?.trim() || null;
}

async function askGemini(message: string, key: string): Promise<string | null> {
	const res = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent?key=${key}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				system_instruction: { parts: [{ text: ASK_REN_ZU_SYSTEM_PROMPT }] },
				contents: [{ role: "user", parts: [{ text: message }] }],
				generationConfig: {
					maxOutputTokens: 1300,
					temperature: 0.35,
					topP: 0.9,
				},
			}),
		},
	);

	if (!res.ok)
		throw new Error(`Gemini returned ${res.status}: ${await res.text()}`);
	const data = (await res.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};
	return (
		data.candidates?.[0]?.content?.parts
			?.map((p: { text?: string }) => p.text || "")
			.join("")
			.trim() || null
	);
}

export async function askRenZu(
	message: string,
): Promise<{ reply: string; provider: string }> {
	const canonContext = buildCanonContext(message);
	const groundedMessage = `Canon source pack (use this as authoritative grounding):
${canonContext}

---

User/app context:
${message}`;

	const groqKey = process.env.GROQ_API_KEY;
	const geminiKey = process.env.GEMINI_API_KEY;

	if (!groqKey && !geminiKey) {
		throw new Error(
			"No AI provider configured. Set GROQ_API_KEY or GEMINI_API_KEY.",
		);
	}

	// Gemini is preferred for Ask Ren Zu (long context, cross-passage synthesis).
	// Set AI_PRIMARY=groq to reverse this.
	const preferred = String(
		process.env.AI_PRIMARY || process.env.AI_PROVIDER || "gemini",
	).toLowerCase();
	const providers: Array<[string, string | undefined]> =
		preferred === "groq"
			? [
					["groq", groqKey],
					["gemini", geminiKey],
				]
			: [
					["gemini", geminiKey],
					["groq", groqKey],
				];

	for (const [provider, key] of providers) {
		if (!key) continue;
		try {
			const reply =
				provider === "gemini"
					? await askGemini(groundedMessage, key)
					: await askGroq(groundedMessage, key);
			if (reply) return { reply, provider };
		} catch (err) {
			console.error(`${provider} request failed:`, (err as Error).message);
		}
	}

	throw new Error(
		"AI providers are currently unavailable. Please try again shortly.",
	);
}

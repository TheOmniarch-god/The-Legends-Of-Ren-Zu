import { buildCanonContext } from "../knowledge/renzu-canon.js";

// api/ai-chat.js
//
// Vercel serverless function — drop this file into an `api/` folder at the
// root of your project.  It is the direct replacement for the Netlify function
// at netlify/functions/ai-chat.js.
//
// Setup:
//   1. Vercel dashboard → Project → Settings → Environment Variables, add:
//        GROQ_API_KEY    = <your key from console.groq.com>      (optional)
//        GEMINI_API_KEY  = <your key from aistudio.google.com>   (optional)
//      At least one must be set. Groq is tried first.
//   2. Redeploy (env vars only take effect after a new deploy).
//
// Your browser code should call POST /api/ai-chat  (not /.netlify/functions/ai-chat)
// It still expects { message: "..." } and returns { reply: "..." } or { error: "..." }.

const SYSTEM_PROMPT = `You are Ask Ren Zu, the app's scholar for The Legends of Ren Zu and its relationship to Reverend Insanity by Gu Zhen Ren.

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

// ── WAV header helper ──────────────────────────────────────────────────────
// Wraps raw PCM (signed 16-bit, 24kHz mono) in WAV format
function createWavHeader(audioDataLength) {
  const sampleRate = 24000;
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF descriptor
  view.setUint8(0, 0x52); // 'R'
  view.setUint8(1, 0x49); // 'I'
  view.setUint8(2, 0x46); // 'F'
  view.setUint8(3, 0x46); // 'F'
  view.setUint32(4, 36 + audioDataLength, true); // file size - 8

  // RIFF type
  view.setUint8(8, 0x57);  // 'W'
  view.setUint8(9, 0x41);  // 'A'
  view.setUint8(10, 0x56); // 'V'
  view.setUint8(11, 0x45); // 'E'

  // fmt sub-chunk
  view.setUint8(12, 0x66); // 'f'
  view.setUint8(13, 0x6d); // 'm'
  view.setUint8(14, 0x74); // 't'
  view.setUint8(15, 0x20); // ' '
  view.setUint32(16, 16, true); // fmt chunk size

  // Audio format (1 = PCM)
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  view.setUint8(36, 0x64); // 'd'
  view.setUint8(37, 0x61); // 'a'
  view.setUint8(38, 0x74); // 't'
  view.setUint8(39, 0x61); // 'a'
  view.setUint32(40, audioDataLength, true);

  return Buffer.from(header);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Handle TTS requests ────────────────────────────────────────────────
  if (req.url?.includes("ai-chat-tts")) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ error: "Gemini TTS not configured" });
    }

    const { text, voice } = typeof req.body === "object" ? req.body : (() => {
      try { return JSON.parse(req.body || "{}"); } catch (_) { return {}; }
    })();

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing 'text' field" });
    }

    try {
      const ttsRes = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text: text },
            voice: {
              languageCode: "en-US",
              name: voice === "male" ? "en-US-Neural2-C" : "en-US-Neural2-A"
            },
            audioConfig: {
              audioEncoding: "LINEAR16",
              sampleRateHertz: 24000,
              pitch: voice === "male" ? -5 : 0,
              speakingRate: 0.92
            }
          })
        }
      );

      if (!ttsRes.ok) {
        const err = await ttsRes.text();
        console.error("Gemini TTS error:", err);
        throw new Error(`TTS failed: ${ttsRes.status}`);
      }

      const data = await ttsRes.json();
      const base64Audio = data.audioContent;
      if (!base64Audio) throw new Error("No audio content in response");

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(base64Audio, "base64");

      // Wrap in WAV header
      const wavHeader = createWavHeader(audioBuffer.length);
      const wavData = Buffer.concat([wavHeader, audioBuffer]);

      // Return as audio/wav
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Cache-Control", "no-cache");
      return res.send(wavData);
    } catch (err) {
      console.error("TTS error:", err.message);
      return res.status(502).json({ error: "TTS service failed" });
    }
  }

  // Route to text endpoint
  const message =
    typeof req.body === "object" ? req.body.message : (() => {
      try { return JSON.parse(req.body || "{}").message; } catch (_) { return null; }
    })();

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing 'message' field" });
  }

  const canonContext = buildCanonContext(message);
  const groundedMessage = `Canon source pack (use this as authoritative grounding):
${canonContext}

---

User/app context:
${message}`;

  const groqKey   = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    return res.status(500).json({
      error: "No AI provider configured. Set GROQ_API_KEY or GEMINI_API_KEY in Vercel environment variables."
    });
  }

  // ── Provider order ────────────────────────────────────────────────────────
  // Gemini is preferred for Ask Ren Zu because it tends to handle long context
  // and cross-passage synthesis better. Set AI_PRIMARY=groq to reverse this.
  const preferred = String(process.env.AI_PRIMARY || process.env.AI_PROVIDER || "gemini").toLowerCase();
  const providers = preferred === "groq"
    ? [["groq", groqKey], ["gemini", geminiKey]]
    : [["gemini", geminiKey], ["groq", groqKey]];

  for (const [provider, key] of providers) {
    if (!key) continue;
    try {
      const reply = provider === "gemini"
        ? await askGemini(groundedMessage, key)
        : await askGroq(groundedMessage, key);
      if (reply) return res.status(200).json({ reply, provider });
    } catch (err) {
      console.error(`${provider} request failed:`, err.message);
    }
  }

  return res.status(502).json({ error: "AI providers are currently unavailable. Please try again shortly." });
}

async function askGroq(message, key) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      max_tokens: 1300,
      temperature: 0.35,
      include_reasoning: false,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: message }
      ]
    })
  });

  if (!res.ok) throw new Error(`Groq returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim();
}

async function askGemini(message, key) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 1300, temperature: 0.35, topP: 0.9 }
      })
    }
  );

  if (!res.ok) throw new Error(`Gemini returned ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();
}

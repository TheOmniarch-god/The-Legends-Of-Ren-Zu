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

const SYSTEM_PROMPT = `You are a sharp, philosophical scholar of the Legends of Ren Zu from the novel Reverend Insanity by Gu Zhen Ren. You speak with weight and precision — no flattery, no padding. Respond in 2–4 focused paragraphs. Reference the chapter text directly when relevant.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const message =
    typeof req.body === "object" ? req.body.message : (() => {
      try { return JSON.parse(req.body || "{}").message; } catch (_) { return null; }
    })();

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing 'message' field" });
  }

  const groqKey   = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    return res.status(500).json({
      error: "No AI provider configured. Set GROQ_API_KEY or GEMINI_API_KEY in Vercel environment variables."
    });
  }

  // ── Try Groq first ────────────────────────────────────────────────────────
  if (groqKey) {
    try {
      const reply = await askGroq(message, groqKey);
      if (reply) return res.status(200).json({ reply });
    } catch (err) {
      console.error("Groq request failed:", err.message);
    }
  }

  // ── Fall back to Gemini ───────────────────────────────────────────────────
  if (geminiKey) {
    try {
      const reply = await askGemini(message, geminiKey);
      if (reply) return res.status(200).json({ reply });
    } catch (err) {
      console.error("Gemini request failed:", err.message);
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
      model: "llama-3.3-70b-versatile",
      max_tokens: 1100,
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 1100 }
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

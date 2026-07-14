# Ask Ren Zu Gemini + Context Upgrade

Changed files:

- `index.html`
- `lib/api/ai-chat.js`

## What changed

- Ask Ren Zu now prefers Gemini first by default, then falls back to Groq.
- Set `AI_PRIMARY=groq` in Vercel only if you want Groq first again.
- System prompt was rebuilt so the AI acts like a scholar of The Legends of Ren Zu, not a generic chatbot.
- The frontend now sends:
  - current passage text
  - nearby chapter excerpts
  - full Legends chapter index
  - user question
- Responses are instructed to connect the current passage to wider Ren Zu patterns: Hope, Strength, Wisdom, Rules, Regulation, Attitude, Self, Cognition, Fate, Freedom, Success/Failure, etc.
- Bold markdown is discouraged.

## Required env

You already have:

`GEMINI_API_KEY`

Optional:

`AI_PRIMARY=gemini`

Optional model override:

`GEMINI_MODEL=gemini-2.0-flash`

## Upload

Upload:

- `index.html`
- `lib/api/ai-chat.js`

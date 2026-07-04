# Vercel Hobby Function Limit Fix

Vercel Hobby allows no more than 12 Serverless Functions per deployment.
This project had too many files inside `/api`.

## Upload these folders/files

- `api/[...path].js`
- `lib/api/*`

## Delete these old files from GitHub `/api`

Delete every old `.js` file in `/api` except the new catch-all:

- `_supabase.js`
- `ai-chat.js`
- `ai-chat-tts.js`
- `annotations.js`
- `bookmarks.js`
- `flutterwave-webhook.js`
- `get-code.js`
- `link-device.js`
- `me.js`
- `public-config.js`
- `redeem-code.js`
- `update-profile.js`
- `use-credit.js`
- `verify-crypto-payment.js`

After deletion, `/api` should contain only:

- `[...path].js`

The original API modules now live in `/lib/api`, which Vercel does not count as separate functions.
The frontend can keep calling the same URLs, e.g. `/api/me`, `/api/use-credit`, `/api/ai-chat-tts`.

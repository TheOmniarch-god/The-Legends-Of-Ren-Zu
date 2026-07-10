# Hall of Venerables Foundation Patch

Changed file:

- `index.html`

## What changed

- Added `Hall of Venerables` modal/page foundation.
- Added Hall access from nav menu.
- Added Hall access from Profile.
- Hall preview shows:
  - current user's avatar
  - realm frame
  - username
  - realm
  - Codex refined count
  - Myriad aura if full Codex is complete
- Hall rules explain:
  - only Venerables appear
  - full Codex grants Myriad aura
  - Hall listing is opt-in
  - future public feed will show opted-in Venerables
- Added local-only opt-in preview via `localStorage.renzu_hall_opt_in`.

## Important

This is frontend foundation only. It does not create the backend Hall table/API yet.
The next Hall patch should add:

- Supabase table
- `lib/api/hall.js`
- opt-in save/load
- public Hall feed

## Upload

Upload only:

- `index.html`

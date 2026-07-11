# Hall Actual Opt-In + Myriad Fix

Changed/upload files:

- `index.html`
- `lib/api/hall.js`
- `hall-schema.sql`
- `avatar-sync-schema.sql`
- `api/[...path].js` included for safety

## What was wrong

- The Omniarch appeared in Ascendant Roll because the SQL seed inserted a visible row automatically.
- That bypassed the Venerable Listing toggle.
- The enable button failed with `activeAvatarId is not defined` because Hall used an avatar variable from Profile instead of its own avatar id.
- The seeded row also had `is_myriad = false`, so the listed entry did not show Myriad even when the current profile preview had 32/32.

## What changed

- Removed the automatic visible seed behavior.
- `hall-schema.sql` now deletes the old automatic seed row for `omniarchportal@gmail.com`.
- The account will appear only after enabling `Venerable Listing` in the Hall UI.
- The enable button now sends the correct avatar id from the Hall component.
- When The Omniarch enables listing, `/api/hall` assigns:
  - username: `The Omniarch`
  - title: `Founder · Supreme Venerable`
  - display_order: `0`
- If Codex count is complete when enabling, the Hall row saves `is_myriad = true` and shows the Myriad frame.
- Wording was cleaned:
  - no more weird preview/local wording
  - Venerable Listing is treated as the actual route

## Required SQL

Run in Supabase SQL Editor:

1. `avatar-sync-schema.sql`
2. `hall-schema.sql`

This will remove the old automatic Hall row. Then Login, open Hall, and click:

`Enable Venerable Listing`

## Upload

Upload:

- `index.html`
- `lib/api/hall.js`
- `hall-schema.sql`
- `avatar-sync-schema.sql`
- `api/[...path].js`

Keep backend modules under `lib/api/`.

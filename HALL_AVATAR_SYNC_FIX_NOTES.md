# Hall Of Venerables + Avatar Email Sync Fix

Built from current GitHub commit:

`b272b0f Add files via upload`

## What this fixes

### Hall Of Venerables

- Fixes the mismatch where frontend Hall was local-only while `/api/hall` used `hall_venerables`.
- Hall now loads real entries from `/api/hall`.
- Venerable Listing now syncs to backend when logged in.
- GET `/api/hall` returns both:
  - `entries` / `list`
  - current user's `optedIn` state
- POST `/api/hall` opts Venerables in/out.
- Founder account is first in ordering when seeded.

### Avatar sync to email/account

- Keeps existing `avatar_choice` sync through `update-profile` / `me`.
- Hall opt-in also updates the email profile's `avatar_choice`.
- `avatar-sync-schema.sql` ensures `profiles.avatar_choice` and `users.avatar_choice` exist.

## Required SQL

Run both in Supabase SQL Editor if not already done:

1. `avatar-sync-schema.sql`
2. `hall-schema.sql`

`hall-schema.sql` now also seeds:

`omniarchportal@gmail.com`

as:

`The Omniarch — Founder · Supreme Venerable`

## Upload

Upload:

- `index.html`
- `lib/api/hall.js`
- `hall-schema.sql`
- `avatar-sync-schema.sql`

Router already has `/api/hall`, but if unsure, upload:

- `api/[...path].js`

Keep backend files under `lib/api/`.

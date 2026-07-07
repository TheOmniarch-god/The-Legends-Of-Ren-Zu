# Codex Foundation: Trace / Refined Patch

Changed file:

- `index.html`

## What changed

- Codex wording now separates:
  - `Trace perceived`
  - `Refined`
  - `Unknown`
- Gu are no longer treated as duplicates.
  - A Gu is refined once.
  - If the user is below the required realm, a trace is recorded instead of a duplicate/reward.
- Tier ascension remains separate from Codex refinement.
  - Payment/redeem ascends realm.
  - Reading/listening/saved actions refine Gu.
- Codex preview text now says Gu are never duplicated.
- Codex filters now include:
  - All
  - Refined
  - Traces
  - Mortal Path
  - Immortal Path
  - Venerable Path
- The Codex receives the user's current realm so it can display realm-gated trace language.
- Trace toast now says the user's realm is beneath the Gu and shows the required realm.

## Important note

This patch does not finalize the full Gu Worm audit yet.
The next Codex step is to audit the app's actual Legends of Ren Zu chapters and keep only Gu Worms found in the app/Legends text, with corrected realm requirements.

## Upload

Upload only:

- `index.html`

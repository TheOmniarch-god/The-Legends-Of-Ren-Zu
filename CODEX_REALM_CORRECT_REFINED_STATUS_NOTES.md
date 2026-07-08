# Codex Realm-Correct Refined Status Fix

Changed file:

- `index.html`

## What was wrong

Older saved Codex data could still say a high-realm Gu was `refined`, even after the Codex gate rules were corrected.

That allowed a Mortal profile/Codex to show something like:

- Venerable Gu
- Refined

That is wrong.

## What changed

- Added effective Codex status helpers:
  - `codexEffectiveStatus(entry, currentTier)`
  - `codexIsEffectivelyRefined(entry, currentTier)`
- If saved data says `refined` but the reader's current realm is below the Gu's required realm, the UI displays it as:
  - `Trace perceived`
- Profile Codex count now counts only Gu effectively refined at the current/preview realm.
- Path stats and filters now use realm-correct effective status.

## Result

A Mortal can perceive Venerable Gu traces, but cannot display them as refined.

After ascending to the required realm, the Gu can be refined properly through the Codex flow.

## Upload

Upload only:

- `index.html`

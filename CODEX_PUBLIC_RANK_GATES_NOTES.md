# Codex Public Rank Gates Patch

Changed file:

- `index.html`

## Important

If you have not deployed the earlier Codex/Ascension files yet, deploy this one instead. It includes the current working animation/codex changes plus the public-rank gate metadata.

## What changed

- Added `CODEX_GU_META` metadata for current Codex Gu:
  - `appGate`
  - `publicRank`
  - `publicPath`
  - `sourceStatus`
- Public rank logic now informs Codex realm gates:
  - Rank 1-5 / Mortal = Gu Master path
  - Rank 6-8 = Gu Immortal path
  - Rank 9+ = Venerable path
- Moved public high-rank Gu upward:
  - Strength Gu -> Venerable path
  - Attitude Gu -> Gu Immortal path
  - Wisdom Gu -> Gu Immortal path
  - Fire Gu -> Venerable path
  - Love Gu -> Venerable path
  - Perseverance Gu -> Gu Immortal path
  - Divine Travel Gu -> Gu Immortal path
  - Fixed Immortal Travel Gu -> Gu Immortal path
  - Fate Gu -> Venerable path
  - Destiny Gu -> Venerable path
  - Heavenly Secret Gu -> Venerable path
- Normalized display name:
  - `Regulations Gu` -> `Regulation Gu`
- Unconfirmed/non-public exact Codex items are held out of the visible Codex for now:
  - Memory Gu
  - Insight Gu
  - Sound Gu
  - Self-Cognition Gu
  - Sovereign Immortal Gu
  - Star Fragment Gu
  - River of Time Gu
  - Dream Realm Gu

## Upload

Upload only:

- `index.html`

## Test

After deploy:

- Open Codex.
- Read Chapter 1 deeply: Hope can refine, Strength should become a high-realm trace if the account is below Venerable.
- Test animation with:

`https://thelegendsofrenzu.theomniarch.com.ng/?realmPreview=1`

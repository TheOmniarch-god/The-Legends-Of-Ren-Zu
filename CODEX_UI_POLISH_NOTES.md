# Codex UI Polish Patch

Checked GitHub first:

- Latest GitHub commit checked: `0b423ba Add files via upload`
- Existing repo already includes:
  - `CODEX_GU_META`
  - trace/refined Codex states
  - profile frame WebP assets
  - profile preview URLs
  - SavedHubModal foundation

Changed file:

- `index.html`

## What changed

- Added Codex path progress cards:
  - Mortal Path
  - Immortal Path
  - Venerable Path
- Each path card shows:
  - refined count
  - total visible Legends Gu in that path
  - trace count waiting in that path
  - progress bar
- Added a Codex Goal panel:
  - shows the Myriad Gu refined completion goal
  - explains that traces do not fully submit until realm is sufficient
- Filter buttons now show counts.
- Active Gu detail panel now shows:
  - required realm badge
  - public rank
  - public path
  - source that triggered the entry
- Unknown cards inside a path show their required realm label.
- Empty-state copy is clearer and no longer says only “Nothing discovered”.

## Upload

Upload only:

- `index.html`

No asset upload needed for this patch.

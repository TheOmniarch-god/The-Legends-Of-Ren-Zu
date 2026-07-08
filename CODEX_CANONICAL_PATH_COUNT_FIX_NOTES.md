# Codex Canonical Path Count Fix

Changed file:

- `index.html`

## What was wrong

Venerable Path said `8 Gu`, but the grid could show only 5 because older saved Codex entries still carried their old tier values.

Example:

- `Regulation Gu` was corrected to Venerable in canonical metadata.
- But an older saved entry could still say `gu_immortal`.
- The path filter was using the saved entry tier instead of the corrected canonical tier.

So Venerable's total came from canonical metadata, but visible cards were filtered by stale saved data.

## What changed

- Canonical `GU_BY_ID` metadata now overrides stale saved tier/name/path/rank during merge.
- Path filters now use canonical Gu tier, not saved tier.
- Active Gu detail now shows canonical realm/path/rank while preserving saved status/source/refined/trace dates.
- Card coloring now uses canonical tier.

## Upload

Upload only:

- `index.html`

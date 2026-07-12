# Profile Avatar Lock + Audio Highlight + Text Fix

Changed file:

- `index.html`

## What changed

### Profile name fallback

- Replaced fallback `Reader` with `Unnamed Cultivator`.
- Users who set a display name still see their actual name.

### Avatar picker

- Added instruction text above avatar choices.
- Locked avatars now use tier-colored frosted/glassy overlays instead of simple dimming.
- Locked avatars show required realm:
  - Gu Master
  - Gu Immortal
  - Venerable
- The Legend remains Venerable-only.

### Audio highlighting

- Narration scrolls the currently spoken sentence into view.
- Read From Here highlights the spoken sentence range.
- Read Selection now highlights the actual selected passage location instead of incorrectly highlighting the first sentence.
- Read Selection no longer auto-continues into the next chapter after finishing the selected text.

### Text cleanup

- Fixed `com10 mand` -> `command` in Chapter 4 & 5.
- Fixed `on wards` -> `onwards`.
- Fixed `TigerStriped` -> `Tiger-Striped`.
- Fixed `humanshaped` -> `human-shaped`.

## Upload

Upload only:

- `index.html`

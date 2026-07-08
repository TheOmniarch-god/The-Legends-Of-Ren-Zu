# Profile Frame Preview + Optimized Assets Patch

Changed/upload files:

- `index.html`
- `assets/avatar-frame-mortal.webp`
- `assets/avatar-frame-gumaster.webp`
- `assets/avatar-frame-guimmortal.webp`
- `assets/avatar-frame-venerable.webp`
- `assets/avatar-frame-myriad.webp`

Preview file, optional:

- `profile-avatar-tier-preview.html`

## What changed

- Replaced the huge PNG frame assets with optimized transparent WebP frame assets.
- Added separate realm-specific frame files instead of relying on one image + filters:
  - Mortal: muted mortal frame
  - Gu Master: bronze/gold frame
  - Gu Immortal: blue rune frame
  - Venerable: bright gold frame
  - Full Codex: multi-color Myriad aura overlay
- Removed the previous custom animated ring construction from the active profile avatar.
- The preview HTML shows all profile forms side-by-side.

## Size fix

The previous frame PNG set was over 1.9 MB by itself.
The new WebP frame set is about 320 KB total.

## Upload

Upload:

- `index.html`
- all five `assets/avatar-frame-*.webp` files

Do not upload the old PNG frame files.

# Avatar Picker Thematic + Nav Order Patch

Changed/upload files:

- `index.html`
- `assets/avatars/avatar-01.webp` through `assets/avatars/avatar-17.webp`

Optional preview:

- `avatar-selection-preview.html`

## What changed

### Avatar process

- Replaced the temporary generated SVG chibis with the uploaded avatar art assets.
- Avatar choice is no longer boy/girl based.
- Users choose any default avatar in:

`Profile -> Account Details -> Default Avatar`

- If no avatar is chosen, the app assigns a deterministic random default based on profile/device data.
- Avatar previews are now rendered inside circular aperture cores so they fit the profile frame better.
- The preview page is now thematic and circular instead of plain rectangular cards.

### Nav order

Changed nav order to:

1. Home
2. Profile
3. Codex
4. Saved
5. Treasure
6. Settings, if reading
7. Bookmark / Unbookmark, if reading
8. Theme
9. Install App

### Nav outside tap

- Strengthened outside tap/click/touch handling so tapping outside the menu closes it automatically.

## Upload

Upload:

- `index.html`
- `assets/avatars/` folder

Frame assets do not need upload again if already deployed.

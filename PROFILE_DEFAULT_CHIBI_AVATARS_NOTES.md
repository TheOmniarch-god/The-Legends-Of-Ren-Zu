# Profile Default Chibi Avatars Patch

Changed file:

- `index.html`

## Note

Pinterest blocks direct fetching in this environment, and the app should not copy third-party Pinterest art directly. This patch adds original in-app chibi-style default avatars instead.

## What changed

- Added 10 selectable default chibi avatars:
  - 5 feminine defaults
  - 5 masculine defaults
- Users can choose an avatar from Profile → Account Details → Default Avatar.
- The chosen avatar is saved locally in `localStorage` as `renzu_avatar_choice`.
- If no avatar is chosen, the app assigns a deterministic default from the 10 using the user's profile/device seed.
- The selected chibi appears inside the existing realm frame.
- Frames still show realm identity:
  - Mortal
  - Gu Master
  - Gu Immortal
  - Venerable
  - Myriad Complete
- No new image assets. The chibi avatars are lightweight inline SVG.

## Upload

Upload only:

- `index.html`

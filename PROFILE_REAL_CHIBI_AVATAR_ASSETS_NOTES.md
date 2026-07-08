# Profile Real Chibi Avatar Assets Patch

Changed/upload files:

- `index.html`
- `assets/avatars/avatar-01.webp` through `assets/avatars/avatar-17.webp`

Optional preview image:

- `avatar-selection-preview.png`

## What changed

- Removed the weird generated SVG chibi defaults from the picker.
- Added the uploaded chibi images as optimized WebP avatar choices.
- The avatar picker is no longer gender-based.
- Users choose any default avatar in:

`Profile -> Account Details -> Default Avatar`

- If the user does not choose one, the app assigns a deterministic random default based on profile/device data.
- The selected avatar appears inside the existing realm frame.
- Selection is saved locally with:

`localStorage.renzu_avatar_choice`

## Why no direct Pinterest fetch

Pinterest returned HTTP 403 to automated fetching from this environment. Using the uploaded files is cleaner and reliable.

## Upload

Upload:

- `index.html`
- the full `assets/avatars/` folder from this patch

No frame asset upload is required if your current GitHub already has the frame WebP files.

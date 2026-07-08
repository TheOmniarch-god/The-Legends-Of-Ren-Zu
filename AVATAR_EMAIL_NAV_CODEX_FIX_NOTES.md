# Avatar + Email + Nav + Codex Size Fix Patch

Changed/upload files:

- `index.html`
- `assets/avatars/avatar-01.webp` through `assets/avatars/avatar-17.webp`
- `assets/email-omniarch-logo.jpg`
- `lib/api/flutterwave-webhook.js`

Optional preview file:

- `avatar-selection-preview.html`

## What changed

### Avatar picker

- Replaced temporary generated avatars with the uploaded chibi avatar images.
- Avatar choice is not gender-based.
- Users choose any default avatar in:

`Profile -> Account Details -> Default Avatar`

- If the user does not choose one, the app assigns a deterministic random default based on profile/device data.
- Avatar previews are now circular/aperture-themed instead of rectangular.
- Fixed rectangular avatars:
  - `avatar-08` was recropped and renamed to `The Legend`.
  - `avatar-09` was recropped into a square/circular-friendly composition.

### Codex grid

- Fixed oversized Codex cards when a filtered path has only a few cards.
- Codex grid now uses a capped card width so trace/unknown cards do not become huge.

### Navigation menu

- Updated nav order:
  1. Home
  2. Profile
  3. Codex
  4. Saved
  5. Treasure
  6. Settings, if reading
  7. Bookmark / Unbookmark, if reading
  8. Theme
  9. Install App
- Strengthened outside tap/click/touch handling so tapping outside closes the menu.

### Realm token email

- Restored a proper styled Sacred Code card in the Flutterwave realm-token email.
- Added the new Omniarch email logo image at:

`assets/email-omniarch-logo.jpg`

- The email references the logo by public site URL:

`/assets/email-omniarch-logo.jpg`

## Upload

Upload all changed files:

- `index.html`
- `assets/avatars/` folder
- `assets/email-omniarch-logo.jpg`
- `lib/api/flutterwave-webhook.js`

Do not move backend files out of `lib/api/`.

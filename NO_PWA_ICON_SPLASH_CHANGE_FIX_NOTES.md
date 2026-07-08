# No PWA Icon/Splash Change Fix

You clarified that you were talking about the mobile app opening behavior, not changing the app icon.

## What changed

- Removed the custom in-app boot splash that I added.
- This returns the app opening flow to the former app page/behavior.
- This package does **not** include `icons/` or `manifest.webmanifest`, so it will not overwrite your current mobile app icons/native splash setup.
- The Omniarch logo remains available for bottom branding and emails through:

`assets/email-omniarch-logo.jpg`

## Still included from the current work

- Avatar picker with uploaded chibi assets.
- The Legend rename and avatar recrops.
- Nav order/outside-tap improvements.
- Codex high-realm refined status and huge-card fixes.
- Settings back behavior fix.
- Direct chapter open starts at top; Continue Reading resumes exact position.
- Realm Token email sacred-code template in `lib/api/flutterwave-webhook.js`.

## Upload

Upload only these files/folders:

- `index.html`
- `assets/avatars/`
- `assets/email-omniarch-logo.jpg`
- `lib/api/flutterwave-webhook.js`

Do **not** upload `icons/` or `manifest.webmanifest` from the previous package.

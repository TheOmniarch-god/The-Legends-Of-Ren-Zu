# Latest Logo Splash / Email / Icons Patch

You said the files were not deployed yet, so use this newest package instead of the earlier multi-fix package.

## Changed/upload files

- `index.html`
- `assets/avatars/avatar-01.webp` through `assets/avatars/avatar-17.webp`
- `assets/email-omniarch-logo.jpg`
- `lib/api/flutterwave-webhook.js`
- `manifest.webmanifest`
- `icons/*`

Reference/template file:

- `SUPABASE_AUTH_EMAIL_TEMPLATE.html`

## Logo update

- `assets/email-omniarch-logo.jpg` now uses the latest horizontal **THE OMNIARCH** logo you uploaded.
- App/footer/email branding uses this latest horizontal logo.
- PWA/app icons were regenerated from the latest symbol-only Omniarch logo.

## Opening splash

- The in-app opening splash now shows the latest horizontal Omniarch logo on black.
- It then shows `The Legends Of Ren Zu` boldly underneath.
- The native PWA splash background and theme color stay black.

## Existing fixes included

- Codex high-realm refined status corrected.
- Codex cards no longer stretch huge.
- Real chibi avatar picker with circular aperture previews.
- `The Legend` avatar rename and circular crops.
- Nav order and outside-close improvements.
- Reader/Audio settings back returns to Settings hub.
- Direct chapter open starts at top; Continue Reading resumes exact position.
- Realm Token email has Sacred Code card via `lib/api/flutterwave-webhook.js`.

## Upload

Upload all changed files listed above.

Keep backend files under:

`lib/api/`

# Main Image / Icon / Splash Correction

You clarified:

- The Omniarch horizontal logo is for bottom branding and emails.
- The main app icon/opening image should be the main **The Legends of Ren Zu** artwork.

## Changed/upload files

- `index.html`
- `assets/renzu-main-app-image.jpg`
- `assets/email-omniarch-logo.jpg`
- `assets/avatars/avatar-01.webp` through `assets/avatars/avatar-17.webp`
- `lib/api/flutterwave-webhook.js`
- `manifest.webmanifest`
- `icons/*`

Reference/template file:

- `SUPABASE_AUTH_EMAIL_TEMPLATE.html`

## What changed now

- PWA/app icons are regenerated from the main The Legends of Ren Zu artwork.
- The app boot splash now shows the main The Legends of Ren Zu artwork, then the title text.
- The Omniarch horizontal logo remains for:
  - bottom app branding
  - email branding
  - Realm Token email
  - Supabase auth email template

## Upload

Upload all changed files listed above.

Keep backend files under:

`lib/api/`

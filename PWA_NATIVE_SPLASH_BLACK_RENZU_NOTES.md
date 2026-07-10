# PWA Native Splash: Black Ren Zu Fix

This fixes the exact mobile installed-app opening screen shown in your screenshot.

That screen is not controlled by the React app UI. It is the browser/Android PWA native splash screen, controlled mainly by:

- `manifest.webmanifest`
- `icons/*`
- `theme-color` meta tag

## What changed

- Manifest background is black/gold-black:

`#050403`

- Manifest theme color is black:

`#050403`

- `index.html` theme-color meta is now:

`#050403`

- App/PWA icons remain based on the main The Legends of Ren Zu artwork, not The Omniarch logo.
- The Omniarch logo remains for bottom branding and emails only.

## Important Android note

Android/Chrome caches installed PWA splash icons very aggressively.

After uploading this patch, if the old beige splash still appears:

1. Uninstall/remove the installed app from your phone.
2. Clear site data/cache for `thelegendsofrenzu.theomniarch.com.ng` if needed.
3. Open the site in Chrome again.
4. Install/Add to Home Screen again.

The native splash should then use the black background instead of the beige one.

## Upload

Upload:

- `index.html`
- `manifest.webmanifest`
- `icons/`

No backend files are needed for this specific fix.

# APK Icon + Boot Polish

Changed/upload files:

- `index.html`
- `assets/renzu-main-app-image.jpg`
- `icons/*`

Preview file:

- `apk-icon-boot-preview.png`

## What changed

- Cropped the main Ren Zu artwork so the `KODOKU STUDIO` text at the bottom is removed.
- Rebuilt PWA/APK icons from the cropped Ren Zu artwork.
- Icons now use black background, more padding, and a subtle gold edge/glow so the native Android splash icon is less huge.
- Added a short in-app boot loading screen after native splash:
  - cropped Ren Zu artwork
  - black/gold background
  - `The Legends Of Ren Zu`
  - `Opening The Archive`

## Important

For APK/TWA changes, rebuild the APK after deploying these web files. Android bakes icons into the APK.

## Upload

Upload:

- `index.html`
- `assets/renzu-main-app-image.jpg`
- `icons/`

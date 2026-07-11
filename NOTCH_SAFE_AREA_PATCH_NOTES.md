# Notch / Cutout Safe Area Patch

Changed files:

- `index.html`
- `manifest.webmanifest`

## What changed

- Changed iOS web app status bar from `black-translucent` to `black` so the app is not drawn underneath the camera/status area.
- Changed PWA manifest display from `fullscreen` to `standalone`.
  - `fullscreen` can behave badly on camera-notch/cutout screens.
  - `standalone` is the more reliable installed-app mode for avoiding cut/cropped UI.
- Added global safe-area CSS variables:
  - `--safe-top`
  - `--safe-right`
  - `--safe-bottom`
  - `--safe-left`
- Added `100dvh` support for `html`, `body`, `#root`, and the app root container.
- Added bottom safe-area padding to the app root so bottom gestures/home bar do not cut content.

## Important mobile note

After upload, remove/reinstall the installed app or clear site data if the old fullscreen behavior remains. Mobile browsers cache PWA manifest display mode aggressively.

## Upload

Upload:

- `index.html`
- `manifest.webmanifest`

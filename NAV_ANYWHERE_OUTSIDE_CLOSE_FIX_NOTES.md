# Nav Anywhere Outside Close Fix

Changed file:

- `index.html`

## What changed

- Added capture-phase document listeners while the nav menu is open.
- Now tapping/clicking/touching anywhere outside the nav wrapper closes the nav menu, even if another app element stops event propagation.
- This is stronger than relying only on the transparent overlay.

## Upload

Upload only:

- `index.html`

## Note about the image you attached

The attached `607465.jpg` could not be processed by the workspace image reader, so I could not inspect that screenshot directly. Please reattach it as PNG/JPG if you want me to patch the mobile opening screen exactly from that screenshot.

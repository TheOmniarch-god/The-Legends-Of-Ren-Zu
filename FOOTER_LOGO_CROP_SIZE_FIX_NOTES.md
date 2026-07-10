# Footer Logo Crop / Size Fix

Changed/upload files:

- `assets/omniarch-footer-logo.webp`

## What was wrong

The symbol was sitting inside a large transparent canvas, so even when CSS made the image box larger, the actual artwork still looked tiny.

## What changed

- Rebuilt `assets/omniarch-footer-logo.webp` from the original uploaded symbol using its real alpha channel.
- Cropped out the empty transparent/black space properly.
- The actual symbol now fills the image asset, so it displays at the intended size in the footer.

## Upload

Upload only:

- `assets/omniarch-footer-logo.webp`

`index.html` from the previous footer-size patch can remain as-is.

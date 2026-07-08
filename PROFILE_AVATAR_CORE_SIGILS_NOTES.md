# Profile Avatar Core Sigils Patch

Changed file:

- `index.html`

## What changed

- Added generated avatar cores inside the existing realm frames.
- The frame remains the realm identity; the inner avatar is now the user's personal sigil.
- The sigil is deterministic using profile/device data, so users get variation without image uploads.
- Realm-specific inner core styles:
  - Mortal: simple muted seal.
  - Gu Master: hex/aperture refinement seal.
  - Gu Immortal: blue dao-mark aperture seal.
  - Venerable: heavenly star/diamond seal.
  - Myriad completion: subtle multi-color core behind the user's initials.
- No new assets. Pure inline SVG/CSS.

## Upload

Upload only:

- `index.html`

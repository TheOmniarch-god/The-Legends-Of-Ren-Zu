# Hall Avatar Auto-Sync + Frame Core Fix

Changed/upload files:

- `index.html`
- `assets/avatar-frame-mortal.webp`
- `assets/avatar-frame-gumaster.webp`
- `assets/avatar-frame-guimmortal.webp`
- `assets/avatar-frame-venerable.webp`
- `assets/avatar-frame-myriad.webp`

## What changed

### Avatar sync

- Choosing an avatar in Profile now immediately saves it to the logged-in account.
- If Venerable Listing is already enabled, changing/saving the profile avatar now also refreshes the Hall entry automatically.
- This removes the need to toggle Venerable Listing off/on just to update the Hall avatar.

### Frame middle stain

- Cleared the center/core area of all realm frame assets.
- This removes stray color stains/specks in the middle where the avatar sits.
- The frame ring remains intact.

## Upload

Upload:

- `index.html`
- all five `assets/avatar-frame-*.webp` files listed above

No SQL required for this patch.

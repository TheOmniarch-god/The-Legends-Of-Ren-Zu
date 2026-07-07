# Realm Ascension Lite Patch

Upload this full repo over the current GitHub files.

## Changed

- `index.html`
  - Disabled bold rendering in Ask Ren Zu responses.
    - `**strength**` now displays as plain `strength`.
    - Word spacing is preserved, so answers do not become clustered.
  - Replaced the heavy tier unlock flow with `Realm Ascension Lite`.
    - No audio/sound.
    - No canvas storm.
    - No mountain loader.
    - No refinement cauldron.
    - Short mobile-safe overlay with realm seal, benefits, Codex rewards, and Done button.
  - Removed the public hidden top-right preview trigger.
    - Animation preview is available on localhost and on the live site with `?realmPreview=1` or `#realm-preview`.
  - Removed unused heavy animation components from the file.

## Upload target

Upload every file/folder in this zip to:

`https://github.com/TheOmniarch-god/The-Legends-Of-Ren-Zu`

Keep the consolidated API structure:

- `api/[...path].js`
- `lib/api/*.js`

Do not move individual backend functions back into `/api`.


## How to test on the live domain

After upload/deploy, open:

`https://thelegendsofrenzu.theomniarch.com.ng/?realmPreview=1`

A small preview panel appears at the bottom-left. Tap:

- `gu master`
- `gu immortal`
- `venerable`

Remove `?realmPreview=1` from the URL to hide the preview panel.

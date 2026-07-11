# Service Worker Startup Speed Patch

Upload only:

- `sw.js`

This makes installed app startup use cached shell first, while refreshing in the background.

After upload, close/reopen the installed app. If old behavior remains, uninstall/reinstall the PWA because service workers are cached aggressively.

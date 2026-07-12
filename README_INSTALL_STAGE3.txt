RENZU STAGE 3 OVERLAY

What this adds:
- more detailed guide pages
- more character pages
- Fate Gu and Freedom Gu pages
- richer chapter companion panels
- better support-page UI and structure
- updated sitemap and generator script
- .gitignore to stop stage zip files being committed

How to use:
1. Download this zip.
2. Extract it.
3. Copy everything into your repo root.
4. Allow overwrite where asked.
5. Commit and push main.

Android / Termux pattern:
cd ~/The-Legends-Of-Ren-Zu
cp "$HOME/storage/downloads/renzu-stage3-overlay.zip" .
unzip -o renzu-stage3-overlay.zip
git add .
git commit -m "Add stage 3 SEO pages"
git pull --rebase origin main
git push origin main

Optional regenerate later:
node scripts/generate-seo-pages.mjs

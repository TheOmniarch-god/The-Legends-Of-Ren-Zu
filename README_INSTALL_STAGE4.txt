RENZU STAGE 4 VISUAL PARITY OVERLAY

What this adds:
- Omniarch-style paper palette
- matching font stack closer to the main site
- improved card, hero, nav, button, and section styling
- same Stage 3 detailed content, but with stronger visual identity

How to use:
1. Download this zip.
2. Extract it.
3. Copy everything into your repo root.
4. Allow overwrite where asked.
5. Commit and push main.

Android / Termux pattern:
cd ~/The-Legends-Of-Ren-Zu
cp "$HOME/storage/downloads/renzu-stage4-visual-overlay.zip" .
unzip -o renzu-stage4-visual-overlay.zip
git add .
git commit -m "Match SEO layer styling to main site"
git pull --rebase origin main
git push origin main

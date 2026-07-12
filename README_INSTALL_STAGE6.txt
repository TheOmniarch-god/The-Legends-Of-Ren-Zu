RENZU STAGE 6 UX REFINEMENT OVERLAY

What this fixes:
- simpler menu button
- reduced oversized spacing
- less Omniarch-like gold heading treatment
- clearer clickable canvases for links/buttons/cards
- improved mobile reading flow
- header still hides while scrolling down

How to use:
1. Download this zip.
2. Extract it.
3. Copy everything into your repo root.
4. Allow overwrite where asked.
5. Commit and push main.

Android / Termux:
cd ~/The-Legends-Of-Ren-Zu
cp "$HOME/storage/downloads/renzu-stage6-refinement-overlay.zip" .
unzip -o renzu-stage6-refinement-overlay.zip
git add .
git commit -m "Refine Legends support page UX"
git pull --rebase origin main
git push origin main

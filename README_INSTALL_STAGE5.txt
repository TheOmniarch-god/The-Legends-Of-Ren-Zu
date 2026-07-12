RENZU STAGE 5 LEGENDS VISUAL OVERLAY

What this fixes:
- design now leans toward the Legends of Ren Zu site instead of the Omniarch homepage
- compact menu button instead of a large static nav block on mobile
- header hides on scroll down for better reading
- hero image from the Ren Zu app added into the support page hero area
- more Legends-like fonts and softer parchment palette

How to use:
1. Download this zip.
2. Extract it.
3. Copy everything into your repo root.
4. Allow overwrite where asked.
5. Commit and push main.

Android / Termux pattern:
cd ~/The-Legends-Of-Ren-Zu
cp "$HOME/storage/downloads/renzu-stage5-legends-visual-overlay.zip" .
unzip -o renzu-stage5-legends-visual-overlay.zip
git add .
git commit -m "Refine SEO layer to match Legends site"
git pull --rebase origin main
git push origin main

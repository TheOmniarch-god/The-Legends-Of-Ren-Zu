# Audio From Here Highlight + Pause Button Fix

Changed file:

- `index.html`

## What was wrong

When narration started from the middle using `Read from here`, the audio chain began at a segment index greater than `0`.

The old code only switched from `Summoning` to `Pause` when `idx === 0`, so:

- the button could stay on `Summoning` while audio was already reading
- the active sentence highlight did not appear reliably because `audioPlaying` stayed false

## What changed

- As soon as any audio segment is ready to play, the app now sets:
  - `audioLoading = false`
  - `audioPlaying = true`
  - `audioPaused = false`
- This works for normal Play, `Read from here`, and selected passage reading.
- The currently read sentence should now highlight as narration progresses.
- The hero/audio button should become `Pause` while narration is actually reading.

## Upload

Upload only:

- `index.html`

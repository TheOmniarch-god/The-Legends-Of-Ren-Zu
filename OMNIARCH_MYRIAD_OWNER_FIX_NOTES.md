# Omniarch Myriad Owner Fix

Changed files:

- `index.html`
- `lib/api/hall.js`

## Why Myriad was missing

The app was only granting Myriad display when the real synced Codex count equaled the visible total Gu count.

The Omniarch account is Venerable, but the database may not have every Codex Gu marked as refined yet. So the normal user rule correctly did not show Myriad.

For the owner/founder account, that is not desired.

## What changed

- `omniarchportal@gmail.com` is treated as a founder/owner Myriad account in the UI.
- Profile and Hall preview now treat the account as complete.
- `/api/hall` forces Founder account Hall row to:
  - `is_myriad = true`
  - `codex_count = total_gu` when total is known
  - `title = Founder · Supreme Venerable`
  - `display_order = 0`

## Upload

Upload:

- `index.html`
- `lib/api/hall.js`

## Optional immediate SQL fix for existing Hall row

Run if your Hall row already exists and still shows non-Myriad:

```sql
update public.hall_venerables hv
set
  is_myriad = true,
  codex_count = greatest(coalesce(hv.codex_count, 0), coalesce(hv.total_gu, 0)),
  title = 'Founder · Supreme Venerable',
  display_order = 0,
  updated_at = now()
from public.profiles p
where hv.id = p.id
  and lower(p.email) = lower('omniarchportal@gmail.com');
```

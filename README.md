# Media for pull request #24 (Atelier mobile web version)

This branch holds only the screenshots, video and banner shown in
[pull request #24](https://github.com/JonathanZouari/OwnDesign/pull/24), and the source that made them. It shares no
history with the app and is not meant to be merged.

| Path | What |
|---|---|
| `banner.png` | The banner at the top of the pull request (Remotion still `Banner`) |
| `video/atelier-mobile.mp4` | 41 s tour, 1920 × 1080 (Remotion composition `MobileTour`) |
| `video/atelier-mobile.gif` | 32 s teaser, 960 × 540, 10 fps (`MobileTeaser`) |
| `screenshots/` | Playwright screenshots at 390, 320, 768 and 1440 px |
| `remotion/` | The Remotion project (pinned to 4.0.542) and the recorded clips it uses |
| `scripts/` | `record_clips.py` (phone recordings) and `review_shots.py` (screenshots) |

The recordings and screenshots come from the demo project "Demo Apartment" on a development database, with
`example.com` demo accounts. The scripts read those accounts from a local `demo_accounts.txt`, which is not
published.

Re-render:

```sh
cd remotion
npm ci
npm run render:mp4      # out/atelier-mobile.mp4
npm run render:gif      # out/atelier-mobile.gif
npm run render:banner   # out/banner.png
```

# public/game — vendored game

This directory is a vendored copy of **[Server Survival](https://github.com/pshenok/server-survival)** by **Kostyantyn Pshenychnyy (pshenok)**, licensed under the **MIT License** (see [`LICENSE`](./LICENSE) in this folder — copied unmodified from the original).

## What's original here vs. what's vendored

**Vendored (core gameplay, largely unmodified):**
- `game.js` — main game engine (Three.js rendering, game loop, UI)
- `src/entities/Request.js`, `src/entities/Service.js` — game entities
- `src/services/SoundService.js` — audio
- `src/i18n.js`, `src/locales/*.js` — i18n system + translations
- `src/config.js` — game config/tuning
- `src/tutorial.js` — tutorial flow
- `src/campaign/*.js`, `src/state.js` — campaign/state logic

**Added by this project (SORA), not part of the original:**
- `postMessage` bridge in `game.js` (iframe ↔ parent communication) for wallet-signed score submission to the SORA leaderboard
- Integration glue connecting this game to `../../app/play` (the Next.js wrapper), `lib/score-submit.ts`, and `lib/wallet.ts`

Each vendored file carries a header comment pointing back to the source repo. Full credit to the original author — go star [pshenok/server-survival](https://github.com/pshenok/server-survival).

<div align="center">

# SORA 🩷

### Keep the servers alive.

**An on-chain survival game about the infrastructure that runs the internet.**
Route the traffic, block the DDoS, scale before the wave hits — and climb a wallet-signed leaderboard.

[Play](https://www.playsora.xyz) · [Twitter/X](https://x.com)

`Next.js` · `TypeScript` · `Tailwind` · `Three.js` · `Supabase` · `Solana`

</div>

---

## What is SORA?

SORA is a browser-based **compute survival game** wrapped in an on-chain competitive layer. You play as a Network Operations Center (NOC) operator: place and upgrade infrastructure — firewalls, load balancers, compute, caches, CDNs, databases — to survive escalating waves of traffic and DDoS attacks. Your survival score is **signed by your wallet** and ranked on a global leaderboard.

It's fronted by **Sora**, an anime NOC-operator mascot.

> **The pitch:** not a chart with a mascot taped on — an actual game, with real strategy and on-chain scores. And you'll accidentally learn how the internet works while playing it.

## Features

- 🎮 **Playable survival game** — real-time infra tower-defense (13 services, escalating RPS, DDoS waves).
- 🔗 **Wallet-signed scores** — runs are signed by the player's Solana wallet and stored server-side.
- 🏆 **On-chain leaderboard** — global + seasonal ranks backed by Supabase.
- 🌐 **NOC-console UI** — datacenter-at-night aesthetic, live telemetry, an interactive operator-network canvas.
- 🩷 **Sora mascot** — the face of the NOC (2D key art + optional interactive 3D).

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Game engine | Three.js (isometric 3D, vanilla JS) |
| Database / API | Supabase (Postgres) |
| Wallet | Solana wallet-adapter (Phantom) |
| Hosting | Vercel |

## Project structure

```
app/                  Next.js routes (landing, /play, /leaderboard, /token)
components/           UI components (NOC console, network canvas, marquees)
lib/                  wallet, supabase client, score verification
public/game/          the vendored survival game (see Attribution)
supabase/migrations/  leaderboard schema
SETUP.md              full local setup + env vars
CLAUDE.md / AGENTS.md project + agent build notes
```

## Getting started

**Prerequisites:** Node.js 18+, a Supabase project, a Solana RPC endpoint.

```bash
# install
npm install

# configure env (see SETUP.md for the full list)
cp .env.example .env.local
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   SUPABASE_SERVICE_ROLE=...
#   NEXT_PUBLIC_RPC_URL=...
#   NEXT_PUBLIC_SORA_MINT=...   # set after launch

# run
npm run dev
# → http://localhost:3000
```

See **[SETUP.md](./SETUP.md)** for the complete environment and database setup.

## Attribution

The core gameplay is built on **[Server Survival](https://github.com/pshenok/server-survival)** by **pshenok**, used and extended under its **MIT License**. SORA vendors the game (`public/game/`), preserves the original license and copyright, and adds the on-chain leaderboard, seasons, wallet integration, and branding on top. Full respect to the original — go star it.

## Roadmap

- [x] Landing + NOC console UI
- [x] Wrapped game at `/play`
- [x] Wallet-signed score submission + leaderboard
- [ ] Daily Challenge (shared-seed board for all players)
- [ ] Seasons + tournaments
- [ ] Share-score cards + "beat my score" challenge links
- [ ] Interactive 3D mascot (VRM)

## License

Project code © its authors. The vendored game under `public/game/` remains licensed under the MIT License of the original **Server Survival** project by pshenok — see the license file included in that directory.

<div align="center">

**● all systems operational**

[playsora.xyz](https://www.playsora.xyz)

</div>

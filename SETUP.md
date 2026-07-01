# SORA Setup Guide

## Prerequisites
- Node.js 18+
- Solana wallet (Phantom recommended)
- Supabase account (free tier OK)

## 1. Install Dependencies
```bash
npm install
```

## 2. Setup Supabase

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project (free tier)
3. Wait for database to initialize

### Run Migration
1. Open Supabase SQL editor
2. Copy content from `supabase/migrations/01_init_schema.sql`
3. Paste into SQL editor and run

### Get Keys
In Supabase project settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Anon public key
- `SUPABASE_SERVICE_ROLE` → Service role secret key

## 3. Setup Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE=eyJhbGc...
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SORA_MINT=5xxx...
NEXT_PUBLIC_PUMP_FUN_URL=https://pump.fun/coin/5xxx...
```

Note: `NEXT_PUBLIC_RPC_URL` and token addresses can be placeholders for now.

## 4. Run Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Test Flow

1. **Landing Page** (`/`)
   - View game info
   - Click "Launch Console" → `/play`

2. **Play Page** (`/play`)
   - Click "Connect Wallet"
   - Select Phantom wallet (or any Solana wallet)
   - Click "Launch Game"
   - Game loads in iframe
   - Play game until game-over
   - Click "Submit Score to Leaderboard"
   - Sign with wallet
   - Score submitted

3. **Leaderboard** (`/leaderboard`)
   - View submitted scores
   - Sorted by score (highest first)

## Architecture

```
Next.js 14 + TypeScript + Tailwind
├─ /play          Game iframe + wallet + score submit
├─ /leaderboard   Global scores (from DB)
├─ /token         $SORA utility info
├─ /about         pshenok credit + MIT
└─ /api
   ├─ /score      POST: validate signature → anti-cheat → DB
   └─ /leaderboard GET: fetch verified scores
```

## Game Bridge (postMessage)

Game (`/public/game/index.html`) ↔ Parent shell (`/play`):

**Game → Shell:**
- `game:ready` — game loaded
- `game:start` — game started (runId, seed, mode)
- `game:score` — periodic updates (every 5s)
- `game:over` — game ended (final score, stats)

**Shell → Game:**
- `host:config` — wallet, season, skin
- `host:newRun` — start new run (runId, mode)

## Database Schema

**operators** — user profiles
- `wallet` (PK)
- `handle`, `skin`, `season_pass`

**scores** — leaderboard
- `wallet`, `run_id`, `score`, `elapsed_ms`, `seed`
- `reputation`, `money`, `eventLog`
- `signature` (wallet signed)
- `verified` (passed anti-cheat Tier 1)

**seasons** — tournament windows
- `name`, `starts_at`, `ends_at`, `prize_pool`
- `merkle_root` (optional, for on-chain settlement)

## Anti-Cheat

**Tier 1 (MVP):**
- Verify wallet signature
- Plausibility checks:
  - Score ≤ elapsed time (100 points/sec max)
  - Reputation 0-100%
  - Money ≥ -$2000
  - Event log ≤ 2 events/second
  - Game-over condition met (rep=0 OR money=-1000)

**Tier 2 (Later):**
- Server-side re-simulation from seed + eventLog
- Real score verification (for large prize pools)

## Troubleshooting

### "Game not loading"
- Check `/public/game/index.html` exists
- Check browser console for CORS errors
- Verify iframe src is `/game/index.html`

### "Wallet connection fails"
- Install Phantom wallet browser extension
- Ensure wallet is unlocked
- Check RPC endpoint is accessible

### "Score submission fails"
- Check `.env.local` has all Supabase keys
- Verify Supabase project is running
- Check browser console for error details

### "Leaderboard empty"
- Supabase database tables created? (Run migration)
- Did score submission succeed? (Check API response)
- Check `verified=true` in scores table

## Next Steps

1. **Landing Page Port**
   - Port full NOC console design from `sora_landing_interactive.html`
   - Add interactive canvas network
   - Add status indicators + telemetry

2. **Cosmetics System**
   - Operator profile page
   - Skins (server skins)
   - Season pass benefits

3. **Seasons + Tournaments**
   - Season schedule
   - Tournament brackets
   - Prize pool management

4. **Tier 2 Anti-Cheat**
   - Server-side game re-simulation
   - Real-time replay validation

5. **Mobile Optimization**
   - Responsive design
   - Touch-friendly UI
   - Mobile wallet support

## License

SORA is built on [Server Survival](https://github.com/pshenok/server-survival) by pshenok, licensed under MIT.

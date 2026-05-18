# LifeTrack App + LLM Council

Multi-project repo. Read this file at the start of every session.

---

## Execution Standard

**100%. Not 99%. Not 90%.**
- Every task is completed fully or not at all. Half-measures are waste.
- If you cannot do it right, say so and explain why. Never ship broken or incomplete work.
- Be fast. Move with intent. But speed without correctness is worthless.
- If a step is skipped, a follow-up is required to complete it.
- When something fails, diagnose it fully before moving on. Never assume.

---

## Repository Overview

- `backend/` — Express + TypeScript + Supabase API server (port 3001)
- `mobile/` — React Native (Expo) mobile app (LifeTrack)
- `shared/` — Shared TypeScript types
- No monorepo tool. Each project is independent.

---

# LifeTrack App

## Setup

```bash
# Backend
cd backend
npm install
# 1. Run the SQL schema in Supabase SQL Editor:
#    https://supabase.com/dashboard/project/upgcveutdbjceihotbbl/sql-editor
#    Copy contents of supabase/schema.sql and run it
# 2. Seed the demo user:
npx tsx src/seed.ts
npm run dev   # listens on 0.0.0.0:3001

# Mobile
cd mobile
npm install
npx expo start
```

- **DB**: Supabase Postgres (cloud) with RLS policies
- **Auth**: Supabase Auth (JWT, demo: `demo@lifetrack.app` / `demo123456`)
- **Backend IP**: `192.168.1.193:3001` (update in `mobile/src/services/api.ts` if IP changes)
- **Env vars**: `backend/.env` (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)

## Backend Routes

| Route | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login, returns JWT |
| `POST /api/auth/demo` | Login as demo user |
| `GET /api/budget/*` | Budget management (auth required) |
| `GET /api/goals/*` | Weekly goals (auth required) |
| `GET /api/calories/*` | Calorie tracking (auth required) |
| `GET /api/strava/*` | Strava OAuth |
| `GET /api/coach/*` | Running coach |

## Backend Architecture

- `src/index.ts` — Express app, listens on `0.0.0.0:3001`
- `src/db.ts` — Supabase client (`supabase` for user queries, `supabaseAdmin` for admin)
- `src/middleware/auth.ts` — JWT auth middleware via Supabase (`AuthRequest` extends `Request`)
- `src/routes/` — One file per resource
- `src/services/` — Business logic

## Supabase Schema

SQL schema is at `backend/supabase/schema.sql`. Run this in the Supabase SQL Editor before starting the server. Includes all tables, RLS policies, and auto-profile creation on signup.

---

# LLM Council

AI-powered multi-agent deliberation system. Ask a question, three agents answer, an arbiter ranks them, and a chairman synthesizes the final answer. All agents run as **opencode sub-processes** — no external API needed.

## Quick Start

```bash
# Compile TypeScript first
cd backend && npx tsc

# Start the server
cd backend && node --max-old-space-size=4096 dist/index.js

# Test
curl -X POST http://localhost:3001/api/council \
  -H "Content-Type: application/json" \
  -d '{"message": "your question here"}'
```

Or with the slash command prefix (trigger word):
```json
{"message": "/council give me your opinion on this"}
```

## API

### `POST /api/council`

**Body:**
```json
{"message": "your question here"}
```

Or (trigger word style):
```json
{"message": "/council your question here"}
```

**Response:**
```json
{
  "query": "...",
  "stage1": [
    { "memberId": "agent-1", "memberName": "Socratic", "content": "..." },
    { "memberId": "agent-2", "memberName": "Pragmatist", "content": "..." },
    { "memberId": "agent-3", "memberName": "Visionary", "content": "..." }
  ],
  "stage2": [
    { "memberId": "agent-4", "memberName": "Arbiter", "rawEvaluation": "...", "parsedRanking": [...] }
  ],
  "stage3": "Synthesized final answer...",
  "aggregateRankings": [...],
  "labelToModel": { "A": "Socratic", "B": "Pragmatist", "C": "Visionary" }
}
```

## Architecture

### Agents

Each agent is a distinct persona spawned as an `opencode run` subprocess. Defined at the top of `src/services/council.ts`:

| ID | Name | Role |
|---|---|---|
| `agent-1` | Socratic | Philosophical inquiry, questions assumptions |
| `agent-2` | Pragmatist | Practical, real-world tradeoffs, direct |
| `agent-3` | Visionary | Long-term thinking, bigger picture, bold |
| `agent-4` | Arbiter | Evaluates and ranks responses (Stage 2) |
| `agent-5` | Chairman | Synthesizes final answer (Stage 3) |

### Stage 1 — Parallel Collection
Socratic, Pragmatist, Visionary answer the query simultaneously via `opencode run --format json`. Max 2 concurrent (concurrency queue in `src/services/agent.ts`). Timeout: 60s per agent. Failures are silent (graceful degradation).

### Stage 2 — Peer Evaluation
Arbiter receives all responses anonymized as "Response A, B, C". Evaluates and ranks with strict format: `FINAL RANKING:` header + numbered list. Parsed via regex in `parseRanking()`. Returns raw evaluation text and parsed ranking entries.

### Stage 3 — Chairman Synthesis
Chairman receives all Stage 1 responses + evaluation summary. Produces the final synthesized answer.

### Concurrency Control
`src/services/agent.ts` implements a queue limiting to 2 concurrent `opencode` processes. Requests beyond 2 are queued FIFO. This prevents resource exhaustion.

### Memory Management
**Always run the server with `--max-old-space-size=4096`** to prevent Node from hitting the default 4GB soft limit and crashing under concurrent agent load.

## Key Files

| File | Purpose |
|---|---|
| `src/services/agent.ts` | Low-level opencode subprocess wrapper. `spawnAgent()`, concurrency queue, JSON event parsing. |
| `src/services/council.ts` | Core deliberation logic. `stage1()`, `stage2()`, `stage3()`, `runCouncil()`. Agent configs at top. |
| `src/routes/council.ts` | Express router. Handles `/council` trigger word stripping. |
| `dist/index.js` | Compiled server (run this, not tsx, for stability) |

## Running the Backend

**Option 1 — Direct (recommended for dev):**
```bash
cd backend && npx tsc && node --max-old-space-size=4096 dist/index.js
```

**Option 2 — Systemd service (permanent):**
```bash
cp backend/lifetrack-backend.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable lifetrack-backend
systemctl --user start lifetrack-backend
```

## Error Handling

- **Graceful degradation**: if an agent fails, `Promise.allSettled` continues with successful responses. Never fail the whole request for one agent.
- **Parse failures**: Stage 2 regex fallback extracts any "Response X" patterns in order if `FINAL RANKING:` section is missing.
- **Empty stage1**: `runCouncil()` throws if zero responses received.

## Data Flow

```
User query
  ↓
Stage 1: Socratic + Pragmatist + Visionary answer in parallel (max 2 concurrent)
  ↓
Stage 2: Arbiter evaluates anonymized responses → ranking
  ↓
Stage 3: Chairman synthesizes with full context
  ↓
Response: { stage1, stage2, stage3, aggregateRankings, labelToModel }
```

## Known Issues

- Running with `npx tsx` (instead of compiled `node`) can cause crashes after requests due to tsx's module resolution. Always use `node dist/index.js`.
- Memory pressure can cause Node to crash under load. Use `--max-old-space-size=4096`.

---

## Common Commands

```bash
# Backend (dev)
cd backend && npx tsx src/index.ts

# Backend (prod - stable)
cd backend && npx tsc && node --max-old-space-size=4096 dist/index.js

# Seed demo user
cd backend && npx tsx src/seed.ts

# Supabase SQL Editor
# https://supabase.com/dashboard/project/upgcveutdbjceihotbbl/sql-editor

# Mobile
cd mobile && npx expo start
cd mobile && npx expo run:android
```
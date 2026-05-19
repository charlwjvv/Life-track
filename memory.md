# Memory

## Session 1 — 2026-05-17

### What was done
- Repository was completely empty (no files, no config, no git).
- User asked me to create/update `AGENTS.md` — created a minimal version reflecting the empty state.

### Repository state
- **Working directory**: `/home/charlwyn/openCodeDemo`
- **Contents**: only `AGENTS.md` exists; everything else is uninitialized.
- **No git**, no package manager, no build system, no linters/tests/CI.

### User preferences (observed)
- Wants me to save my own memory file so I can recall what I did.
- Default save location is the working directory (`/home/charlwyn/openCodeDemo`).

### Session 2 — 2026-05-17 (continued)

- Created `skills.md` — reference doc about opencode skills.
- Created `opencode.json` with `/scaffold` command.
- Created `.opencode/skills/` directory for scaffolded skills.

### Lessons learned
- The `customize-opencode` skill summary is **not authoritative**. The `command` field schema requires `"template"` (a string), NOT `"prompt"`.
- Always fetch `https://opencode.ai/config.json` for the real schema before writing config.

### Session 3 — 2026-05-18

Built the LLM Council deliberation system:
- `backend/src/services/agent.ts` — opencode subprocess wrapper with concurrency queue
- `backend/src/services/council.ts` — 3-stage deliberation engine (Socratic, Pragmatist, Visionary, Arbiter, Chairman)
- `backend/src/routes/council.ts` — Express router with `/council` trigger word stripping

### Session 4 — 2026-05-18 (continued)
Added Council as a tab to mobile app.

### Session 5 — 2026-05-18 (final)
Migrated backend from Prisma/SQLite to Supabase.

## Session 6 — 2026-05-18 (evening)

### What was done
Migrated entire backend from Prisma/SQLite to Supabase (user provided keys, no manual work from user):

1. **Supabase project**: `upgcveutdbjceihotbbl` (cloud Postgres)
2. **Installed**: `@supabase/supabase-js`, `ws`, `@types/ws`, `dotenv`
3. **`backend/src/db.ts`**: `supabase` + `supabaseAdmin` clients with WebSocket transport for Node 20
4. **`.env`**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
5. **`backend/supabase/schema.sql`**: full schema with RLS policies and auto-profile trigger
6. **`backend/src/middleware/auth.ts`**: replaced JWT with Supabase `getUser()`
7. **All routes migrated**: auth, budget, goals, calories, strava, coach
8. **`backend/src/seed.ts`**: plain fetch API (no supabase client, avoids WebSocket issue)
9. **Ran schema** via Supabase management API (`api.supabase.com/v1/projects/.../database/query`)
10. **Seeded demo user**: `demo@lifetrack.app` / `demo123456`
11. **Updated systemd service** with Supabase env vars
12. **Updated AGENTS.md** and this memory file

### Lessons learned
- **WebSocket issue**: `@supabase/supabase-js` v2 requires `ws` package on Node 20. Fix: `{ realtime: { transport: WebSocket } }`
- **dotenv**: `import 'dotenv/config'` needed in `index.ts` to load `.env` on startup
- **systemd env vars**: Must set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` in the service file (dotenv doesn't work in systemd)
- **Supabase management API**: `POST https://api.supabase.com/v1/projects/<ref>/database/query` with PAT (personal access token) for SQL execution
- **Service role key**: Used for admin operations, anon key for user-facing RLS queries
- **CLI auth**: `/tmp/supabase login --token <PAT>` works after creating `~/.supabase/profile`

### Current state
- Server (PID 36931) running on port 3001 with Supabase Postgres
- All 5 app routes tested and working (budget, goals, calories, coach, strava)
- Council working (no longer crashes server after migration)
- Demo user seeded and accessible via `/api/auth/demo`
- Council tab removed from mobile app (user didn't want it)
- `/council` command in opencode.json ready (restart opencode to activate)

### Supabase keys
- URL: `https://upgcveutdbjceihotbbl.supabase.co`
- Anon: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZ2N2ZXV0ZGJqY2VpaG90YmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzEyNDksImV4cCI6MjA5NDcwNzI0OX0.nuxEeaCjmiiKX3f-87ZYEcrEHhXaPC48JdGw3pth3lQ`
- Service: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZ2N2ZXV0ZGJqY2VpaG90YmJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzMTI0OSwiZXhwIjoyMDk0NzA3MjQ5fQ.byURY56IScmuyyblXWTHIpHt4hTkOKcb0qAWBXSiiMk`

## Session 7 — 2026-05-19

### What was done
- Fixed mobile API URL from cloudflare tunnel to local IP (172.22.24.77:3001)
- Added "Use Demo Account" button to LoginScreen
- Verified all backend API endpoints work (auth, budget, goals, calories, coach)
- TypeScript compiles without errors
- Backend running on port 3001 with Supabase

### Current state
- Backend running with Supabase (all endpoints working)
- Mobile app configured to connect to local backend
- Demo account available: `demo@lifetrack.app` / `demo123456`
- To build Android APK: need Java/Android SDK installed
- To test: run `npx expo start` in mobile/ directory
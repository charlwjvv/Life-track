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

## Session 9 — 2026-05-19 (afternoon, CURRENT)

**Services running:**
- Backend: `http://localhost:3001` — Express + Supabase
- LAN IP: `172.22.24.77`

**Fixed:**
- Downgraded `@expo/metro-config` and `babel-preset-expo` from 55.0.21 → 54.0.14/54.0.10 (matched Expo SDK 54 requirement, removed version mismatch warnings)
- Updated mobile API URL back to `172.22.24.77:3001/api` (correct LAN IP)
- Expo dev server now running cleanly

- Expo PID: 41893 (already running)

- **Tunnel URL**: `https://lifetrack-api.loca.lt` (localtunnel, subdomain fixed, systemd auto-restart)

**New shortcuts in opencode.json:**
- `/low` — Switch to fast, low-power mode
- `/medium` — Switch to balanced medium-power mode  
- `/max` — Switch to maximum power mode

**Skills installed** (globally to `~/.config/opencode/skills/`):

**From farmage/opencode-skills:**
- `react-native-expert` — React Native (our mobile stack)
- `typescript-pro` — TypeScript
- `python-pro` — Python
- `debugging-wizard` — Systematic debugging
- `fullstack-guardian` — Cross-stack implementation
- `code-reviewer` — Code review
- `test-master` — Testing strategy
- `feature-forge` — New feature requirements
- `api-designer` — REST API design
- `secure-code-guardian` — Security patterns

**Custom skills created:**
- `lifetrack-app` — Project-specific: paths, routes, commands, gotchas
- `android-build` — WSL2 Gradle build, JS bundle management, APK signing
- `supabase-helper` — Supabase schema, RLS, auth, client setup

Skills activate automatically when relevant context is detected. Restart opencode to activate new skills.

**Demo credentials:** `demo@lifetrack.app` / `demo123456`

---

## Session 10 — 2026-05-19 (evening)

### What was done
- Fixed "main is not registered" red screen error
- Fixed JSON parse error on login

### Root cause: "main is not registered"
**Previous APK builds were missing the JavaScript bundle entirely.** Expo SDK 54's React Native Gradle plugin is configured to **skip JS bundling for debug builds** (it expects Metro dev server at port 8081). So `assembleDebug` produced a native-only APK that crashed because there was no JS to run.

**The fix:** Build the JS bundle manually FIRST with `npx expo export:embed`, then run `gradlew assembleDebug`.

### Root cause: JSON parse error on login
Tunnel URL changed between builds. The APK had `stupid-newt-80.loca.lt` baked in but that tunnel had died. Requests to the dead tunnel returned HTML (not JSON), causing `JSON.parse` to fail.

### Definitive APK build workflow (copy this for future apps):
```bash
cd mobile

# 1. Update API URL in src/services/api.ts
sed -i 's|old-url|new-url|g' src/services/api.ts

# 2. Clear old bundle
rm -f android/app/src/main/assets/index.android.bundle
mkdir -p android/app/src/main/assets

# 3. Build JS bundle (this uses api.ts source)
NODE_ENV=production npx expo export:embed \
  --platform android \
  --dev false \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# 4. Verify bundle
python3 -c "
with open('android/app/src/main/assets/index.android.bundle') as f:
    c = f.read()
assert len(c) > 1000000, 'Bundle too small!'
assert 'registerComponent' in c, 'Missing registerComponent!'
print(f'Bundle OK: {len(c)//1024}KB')
"

# 5. Build APK
cd android
export JAVA_HOME=/home/charlwyn/.local/java
export ANDROID_HOME=/home/charlwyn/.local/android-sdk
./gradlew :app:assembleDebug --no-daemon

# 6. Verify APK
python3 -c "
import zipfile
with zipfile.ZipFile('app/build/outputs/apk/debug/app-debug.apk') as z:
    bundle = z.read('assets/index.android.bundle').decode('utf-8', errors='replace')
    assert 'registerRootComponent' in bundle, 'Missing registerRootComponent!'
    print('APK OK')
"

# 7. Copy to Windows Downloads
cp app/build/outputs/apk/debug/app-debug.apk /mnt/c/Users/cjgam/Downloads/lifetrack-app.apk
```

### Tunnel startup:
```bash
# Start localtunnel (keep running)
npx --yes localtunnel@latest --port 3001 --subdomain lifetrack-api-final > /tmp/lt.log 2>&1 &
sleep 12 && cat /tmp/lt.log  # get the URL

# Verify
curl https://lifetrack-api-final.loca.lt/api/health
```

### Current state
- **Tunnel**: `https://lifetrack-api.loca.lt` (localtunnel, subdomain fixed, systemd auto-restart)
- **APK**: `C:\Users\cjgam\Downloads\lifetrack-app.apk` (144MB, built 19:50)
- **Bundle**: 1.9MB, contains `registerRootComponent` + `registerComponent('main')` + correct API URL
- **API error handling**: Improved `request()` function now catches JSON parse errors and shows "Connection lost. Please check your internet." instead of crashing

### Tunnel auto-start (systemd)
The localtunnel process now runs as a systemd user service, auto-restarting on failure:
```bash
systemctl --user enable lifetrack-tunnel
systemctl --user start lifetrack-tunnel
```
Service file: `~/.config/systemd/user/lifetrack-tunnel.service`
Log: `/tmp/lt-sys.log`

### Network solutions that DO NOT work from WSL2
- **Cloudflare quick tunnels** (`cloudflared tunnel --url`) — SRV DNS lookup for `region1.v2.argotunnel.com` times out through WSL2 gateway DNS (172.22.16.1)
- **bore** — connects to Windows host IP for port 22022, blocked by Windows Firewall  
- **localhost.run** — port 22 blocked
- **ngrok** — requires account auth token

---

## Session 11 — 2026-06-07

### What was built: Complete Running + Nutrition Coach Webapp

Built a full scientific running coach webapp with integrated nutrition coaching, accessible from any browser.

### Architecture

- **Backend**: Express + TypeScript + Supabase (port 3001) — enhanced with world-class coaching engines
- **Frontend**: `webapp/` — React + Vite + TypeScript + Chart.js, dark theme, served by Express
- **Database**: Supabase Postgres + migration `migration_002_coach.sql`

### Files Created/Modified

**Backend — New Services:**
- `backend/src/services/runningCoach.ts` — World-class running coach engine (periodization, HR zones, progressive overload, race-specific plans, analytics)
- `backend/src/services/nutritionCoach.ts` — Nutrition coach engine (pre/post-run fueling, macro periodization, meal plans, hydration)

**Backend — Modified:**
- `backend/src/routes/coach.ts` — Completely rewritten with 14 new endpoints (dashboard, plan, analyze, runs, nutrition, profile, analytics)
- `backend/src/index.ts` — Added static serving of webapp frontend, SPA fallback

**Database:**
- `backend/supabase/migration_002_coach.sql` — Added profile fields (experience_level, max_heart_rate, resting_heart_rate, weight_kg, goal_type, weekly_goal_km, birth_year), runs columns (source, run_type, perceived_effort, notes), new tables (nutrition_advice, meal_plans)

**Frontend — New Project:**
- `webapp/` — React + Vite + TypeScript project
- `webapp/src/api.ts` — Full API client covering all endpoints
- `webapp/src/styles/global.css` — Dark theme CSS (slate-based, clean, minimal)
- `webapp/src/auth/LoginPage.tsx`, `RegisterPage.tsx` — Auth screens with demo login
- `webapp/src/components/Layout.tsx` — Sidebar navigation
- `webapp/src/components/Dashboard.tsx` — Combined running + nutrition dashboard
- `webapp/src/components/WeeklyPlan.tsx` — 7-day periodized training plan
- `webapp/src/components/CoachAdvice.tsx` — Scientific coaching tips with reasoning
- `webapp/src/components/RunLogger.tsx` — Manual run entry form
- `webapp/src/components/NutritionCoach.tsx` — Meal plans, pre/post fueling, macros
- `webapp/src/components/Analytics.tsx` — Charts dashboard
- `webapp/src/components/Profile.tsx` — User settings with HR zone reference
- `webapp/src/components/Charts/*.tsx` — 4 chart components (mileage trend, HR zones, pace distribution, workout breakdown)

### Coaching Engine Features

**Running Coach:**
- Periodization: 4-week cycles (Build → Development → Peak → Recovery)
- Heart rate zones using Karvonen formula (with resting HR) or % of max HR
- Progressive overload: 10% rule, 30% long run cap, hard/easy day alternation
- Race-specific: 5K, 10K, half marathon, marathon, speed, weight loss
- Workout types: Easy, Tempo, Interval, Long Run, Recovery, Fartlek
- Every recommendation includes scientific reasoning

**Nutrition Coach:**
- Pre-run fueling based on run type/distance
- Post-run recovery within 30-min window (3:1 carb:protein)
- Daily macro periodization by training load
- Full meal plans (breakfast, lunch, dinner, snacks) with macros
- Training-synced: adjusts to rest days vs hard training days

### How to Run

```bash
# Backend (compile + run)
cd backend && npx tsc && node --max-old-space-size=4096 dist/index.js

# Or dev mode (backend)
cd backend && npx tsx src/index.ts

# Frontend dev server (hot reload)
cd webapp && npm run dev

# Then open http://localhost:3001 (served by Express)
# Or http://localhost:3002 (Vite dev server with HMR)
```

### Demo Credentials
`demo@lifetrack.app` / `demo123456`

### Two Accounts
Each person registers separately. Coach adapts to each profile independently.

### Webapp Build
Frontend built to `webapp/dist/`. Express serves it at `http://localhost:3001/`.
Rebuild if you change frontend code:
```bash
cd webapp && npx vite build
```
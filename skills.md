# Skills

Skills are opencode's way of bundling domain-specific instructions, references,
and scripts into a reusable package. A skill lives in its own directory with a
`SKILL.md` file and is auto-loaded when opencode starts.

## Installed Skills

| Skill | Description |
|---|---|
| **android-build** | Android APK builds in WSL2 with bundled JS. Use when building, signing, or debugging Android APKs. |
| **api-designer** | Designing REST or GraphQL APIs, creating OpenAPI specifications, or planning API architecture. |
| **code-reviewer** | Analyzing code diffs and files to identify bugs, security vulnerabilities, code smells, and architectural concerns. |
| **debugging-wizard** | Parsing error messages, tracing execution flow through stack traces, and applying systematic hypothesis-driven debugging. |
| **feature-forge** | Structured requirements workshops to produce feature specifications, user stories, EARS-format functional requirements. |
| **fullstack-guardian** | Security-focused full-stack web applications — frontend, backend, and security in one workflow. |
| **lifetrack-app** | LifeTrack mobile app (React Native + Expo) and Express + Supabase backend. |
| **python-pro** | Type-safe Python 3.11+ applications with async programming, type annotations, and pytest test suites. |
| **react-native-expert** | Cross-platform mobile apps with React Native and Expo — navigation, native modules, FlatList optimization. |
| **secure-code-guardian** | Authentication, OWASP Top 10 prevention, bcrypt/argon2, parameterized SQL, JWT tokens, input validation. |
| **supabase-helper** | Supabase Postgres + RLS policies + Auth setup and management. |
| **test-master** | Unit, integration, and E2E tests; coverage analysis; performance testing with k6; security testing. |
| **typescript-pro** | Advanced TypeScript type systems — generics, conditional types, custom type guards, branded types, tRPC. |

## Creating a skill

Use the `/scaffold` command. You'll be prompted for:
- **Name**: lowercase, hyphen-separated, matches the folder name
- **Description**: one sentence covering what it does AND when to trigger it

The command creates the directory, writes `SKILL.md` with proper frontmatter,
and reminds you to restart opencode.

## Layout

```
.opencode/skills/<name>/
├── SKILL.md          # required — the skill itself
├── scripts/          # optional — bundled scripts
└── reference/        # optional — bundled reference files
```

## Structure of SKILL.md

```markdown
---
name: my-skill
description: Use when...
---

# My Skill
```

## Registration

Skills in `.opencode/skills/` are auto-discovered. No config entry needed.
Restart opencode after adding or editing a skill.

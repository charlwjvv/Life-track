# Skills

Skills are opencode's way of bundling domain-specific instructions, references,
and scripts into a reusable package. A skill lives in its own directory with a
`SKILL.md` file and is auto-loaded when opencode starts.

## Location

`.opencode/skills/<skill-name>/SKILL.md`

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

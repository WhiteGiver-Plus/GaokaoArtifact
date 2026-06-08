# AGENTS.md

This repository contains a browser game named `请选择你的高考遗物`. Keep player-facing docs concise and keep implementation/deployment detail here.

## Project Shape

- `gh_pages_local_game/` is the Vite frontend game.
- `gh_pages_local_game/src/main.ts` owns most UI rendering, user actions, sharing, leaderboard, feedback, and gameplay screen flow.
- `gh_pages_local_game/src/core/` contains the local deterministic game engine and rule logic.
- `data/artifacts.json` is the artifact source of truth.
- `gh_pages_local_game/src/artifacts.generated.ts` is generated from `data/artifacts.json`.
- `functions/api/` contains Cloudflare Pages Functions for leaderboard, feedback, analytics events, share reports, and run verification.
- `migrations/0001_init.sql` is the Cloudflare D1 schema used by the Pages Functions.
- `supabase/migrations/` is legacy history; do not treat it as the active backend unless the task explicitly asks for Supabase.
- `wrangler.jsonc` configures Cloudflare Pages and the D1 binding named `DB`.

## Commands

Run from the repository root.

```powershell
npm install
npm run game:data
npm run game:dev
npm run game:build
npm run game:preview
npm run typecheck
```

Cloudflare Pages + D1:

```powershell
npm run cf:d1:local
npm run cf:dev
npm run cf:d1:remote
npm run cf:deploy
```

`npm run game:dev` regenerates artifact data before starting Vite. `npm run game:build` also regenerates artifact data before building.

## Environment

Public frontend configuration is documented in `.env.example`:

- `VITE_PUBLIC_SITE_URL`
- `VITE_API_BASE_URL`

Server-only Pages Functions configuration:

- `LEADERBOARD_SALT`
- `EVENT_RAW_SAMPLE_RATE`

Local analytics are intentionally skipped on localhost unless `VITE_API_BASE_URL` is explicitly configured.

## Data Rules

When editing artifacts:

- Edit `data/artifacts.json`, then run `npm run game:data`.
- Keep `id` values stable unless the task is a deliberate migration.
- Keep player-visible artifact names and descriptions in Chinese.
- Prefer adding behavior through the existing trigger, condition, and effect model in `src/core/`.
- Do not hand-edit `gh_pages_local_game/src/artifacts.generated.ts` except to inspect generated output.

## Gameplay Rules

Core gameplay assumptions from the current implementation and help text:

- Opening draft: 6 artifact choices, each 4 pick 1.
- Required subjects: Chinese, Math, English.
- Elective subjects: player chooses 3.
- Chinese, Math, English have 15 questions each and standard full score 150.
- Each elective subject has 10 questions and standard full score 100.
- Standard total full score is 750.
- Endless mode starts when total score exceeds 750.
- Endless admission threshold starts at 750 and is multiplied by 3 each year.

If these change in code, update `README.md` and `gh_pages_local_game/HELP.md` together.

## Backend Notes

Pages Functions expose same-origin `/api` endpoints:

- `GET /api/leaderboard`
- `POST /api/runs/verify`
- `POST /api/feedback`
- `POST /api/events`
- `GET /api/shares`
- `POST /api/shares`

The active database is Cloudflare D1. The binding name is `DB`; keep it aligned with `wrangler.jsonc` and `functions/api/_lib/types.ts`.

Before deploying backend-affecting changes, run:

```powershell
npm run game:build
npm run typecheck
```

For schema changes, add a migration under `migrations/` and verify D1 locally before remote migration.

## Documentation Boundaries

- Root `README.md` is for players.
- `gh_pages_local_game/HELP.md` is for detailed gameplay rules.
- `AGENTS.md` is for coding agents and maintainers.
- Avoid putting Cloudflare commands, schema details, or implementation internals into the root README unless the user explicitly asks for a developer README.

## Working Tree Safety

The user may have uncommitted changes. Check `git status --short` before edits. Do not revert or overwrite unrelated changes. In particular, treat edits to `data/artifacts.json` as user-owned unless the task is specifically about artifact data.

Use `rg` or `rg --files` for search when available. Use `apply_patch` for manual edits.

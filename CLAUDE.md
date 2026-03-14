# pastebin-worker

Fork of [SharzyL/pastebin-worker](https://github.com/SharzyL/pastebin-worker) deployed at `curlbin.ignacio.systems`.

## Tech Stack

- **Runtime**: Cloudflare Workers (TypeScript)
- **Storage**: Cloudflare KV (metadata + small pastes) + R2 (large pastes)
- **Frontend**: React + Vite + TailwindCSS + HeroUI
- **Testing**: Vitest with `@cloudflare/vitest-pool-workers`
- **Linting**: ESLint + Prettier

## Development Environment

This project uses a **Nix flake** (`flake.nix`) for reproducible dev environments.
All commands must be run inside the Nix dev shell — without it, `pnpm`, `node`, etc. are not available.

```bash
nix develop             # enter dev shell (provides node, pnpm)
```

**All commands below assume you are inside `nix develop` or prefixed with `nix develop --command`.**

## Commands

```bash
pnpm install            # install dependencies
pnpm build:frontend     # build React frontend
pnpm dev                # local dev server on :8787
pnpm test               # run tests
pnpm lint               # ESLint check
pnpm fmt                # Prettier format
pnpm run deploy         # deploy to production (note: must use `run` — pnpm has a built-in deploy)
pnpm run deploy:dev     # deploy to dev preview
```

## Branch Strategy

- `goshujin` — tracks upstream `SharzyL/pastebin-worker:goshujin`
- `nix-dev` — personal deployment branch (production)
- Upstream PRs branch off `goshujin` (e.g. `feat/headless-mode`)
- Remote `upstream` points to `https://github.com/SharzyL/pastebin-worker.git`

## Commit Conventions

Semantic prefixes matching upstream style:

- `feat:` or `feat[scope]:` — new feature
- `fix:` or `fix[scope]:` — bug fix
- `chore:` — maintenance, deps, config
- `optim:` or `optim[scope]:` — optimization
- `doc:` — documentation
- `refac:` — refactoring
- `tests:` — test changes

Scope examples: `[frontend]`, `[worker]`, `[ci]`

## Fork-Only Files (never upstream)

- `CLAUDE.md`
- `DEV_GUIDE.md`
- `flake.nix`, `flake.lock`
- `favicon.ico` (personal)
- `docs/` directory (fork documentation)
- Personal values in `wrangler.toml` (routes, KV IDs, R2 bucket names, env vars)

## Key Architecture

- `worker/index.ts` — entry point, routing
- `worker/handlers/` — request handlers (read, write, delete, MPU, CORS)
- `worker/pages/` — server-rendered pages (auth, docs, markdown)
- `worker/storage/` — KV/R2 storage abstraction
- `worker/common.ts` — shared utilities
- `frontend/` — React SPA (upload UI, display page, editor)
- `shared/` — types/utils shared between worker and frontend
- `worker/test/` — Vitest test files
- `wrangler.toml` — Cloudflare Workers config (env vars, bindings)
- `worker-configuration.d.ts` — auto-generated env type definitions

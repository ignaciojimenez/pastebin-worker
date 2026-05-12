# Architecture & Strategy Decisions

- **Headless mode**: Single `HEADLESS_MODE` flag disables upload UI, URL redirects (`/u/`), and article rendering (`/a/`). Kept as upstream PR candidate.
- **Auth strategy**: Bcrypt-hashed HTTP Basic Auth via `BASIC_AUTH_HASHES` wrangler **secret** (JSON string `{"user":"$2b$..."}`). Set via `wrangler secret put`, not `[vars]`, so the empty `BASIC_AUTH = {}` in committed `wrangler.toml` cannot silently disable auth on a clean-checkout redeploy (which is exactly what happened on 2026-03-14, leaving prod open for 8 weeks). Worker's `resolveBasicAuthMap()` prefers the secret, falls back to upstream's `env.BASIC_AUTH` var for compat. Only POSTs are gated; reads remain public.
- **Package manager**: Migrated from yarn to pnpm. Note: `pnpm deploy` is a built-in workspace command — always use `pnpm run deploy` to invoke scripts.
- **Branch model**: `goshujin` tracks upstream for clean PRs. `main` carries fork-only config (Nix flake, personal wrangler values, favicon).
- **Rebase over merge**: Rebuilt `main` as clean commits on top of goshujin. Easier to maintain and rebase on future upstream syncs.
- **Dev preview env**: Separate `[env.dev]` in wrangler.toml with ephemeral KV/R2 for safe testing before production deploys.
- **Nix dev shell**: All build tooling (node, pnpm) provided via `flake.nix` for reproducible dev environment across machines.
- **direnv + `.envrc`**: Auto-activates Nix shell on `cd` into project. No manual `nix develop` needed. Requires one-time `direnv allow`.
- **flake-utils**: Replaced per-platform boilerplate in `flake.nix` with `nixpkgs.lib.genAttrs` — covers x86_64 and aarch64 for both Linux and macOS.
- **wrangler stays project-local**: Wrangler provided via pnpm devDependency, not Nix. Nix nixpkgs lags behind Cloudflare releases; project-local ensures version consistency with `package.json`.
- **Node.js pinned to LTS 22**: Using `nodejs_22` instead of `nodejs_latest` to avoid surprise breakage from major Node version bumps (e.g. Node 25 broke happy-dom `localStorage` in tests).
- **Renovate with 30-day release age**: Dependencies only auto-updated after versions have been published for 30 days. Supply chain attack mitigation — gives time for compromised packages to be detected and reverted. Major version bumps require manual dashboard approval.

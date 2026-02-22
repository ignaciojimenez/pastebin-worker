# Architecture & Strategy Decisions

- **Headless mode**: Single `HEADLESS_MODE` flag disables upload UI, URL redirects (`/u/`), and article rendering (`/a/`). Kept as upstream PR candidate.
- **Auth strategy**: Bcrypt-hashed Basic Auth from upstream. Phased rollout: deploy headless first, migrate clients, then enable auth.
- **Branch model**: `goshujin` tracks upstream for clean PRs. `nix-dev` carries fork-only config (Nix flake, personal wrangler values, favicon).
- **Rebase over merge**: Rebuilt nix-dev as clean commits on top of goshujin instead of merge commits. Easier to maintain and rebase on future upstream syncs.
- **Dev preview env**: Separate `[env.dev]` in wrangler.toml with ephemeral KV/R2 for safe testing before production deploys.
- **Nix dev shell**: All build tooling (node, yarn) provided via `flake.nix` for reproducible dev environment across machines.

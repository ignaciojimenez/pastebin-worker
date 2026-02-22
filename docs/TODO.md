# TODO

## High Priority

- [ ] **Fix Nix flake for seamless dev onboarding**: The current `flake.nix` only provides `node` and `yarn` but doesn't auto-run `yarn install` or handle `direnv` integration. Improve so entering the project directory is zero-friction:
  - Add `shellHook` to run `yarn install --frozen-lockfile` if `node_modules` is stale
  - Add `.envrc` with `use flake` for automatic `direnv` activation (no manual `nix develop` needed)
  - Consider adding `wrangler` to the flake's `buildInputs` instead of relying on the project-local one
- [ ] **Submit upstream PR for headless mode**: Branch `feat/headless-mode` is ready. Deployed to production on curlbin.ignacio.systems — soak-test for a reasonable period before opening the PR to `SharzyL/pastebin-worker`.
- [ ] **Enable auth on production**: Follow `docs/auth-migration.md` checklist after migrating backup clients

## Medium Priority

- [ ] **Switch `genRandStr()` to `crypto.getRandomValues()`**: `worker/common.ts:37` uses `Math.random()` — good standalone upstream PR

## Low Priority

- [ ] **Add CSP headers to `/d/` display page**: Uses `dangerouslySetInnerHTML` — defense-in-depth improvement
- [ ] **GitHub Actions for dev preview**: Auto-deploy to `--env dev` on push to feature branches

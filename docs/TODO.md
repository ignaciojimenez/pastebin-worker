# TODO

## High Priority

- [ ] **Fix Nix flake for seamless dev onboarding**: Improve so entering the project directory is zero-friction:
  - Add `shellHook` to run `pnpm install --frozen-lockfile` if `node_modules` is stale
  - Add `.envrc` with `use flake` for automatic `direnv` activation (no manual `nix develop` needed)
  - Consider adding `wrangler` to the flake's `buildInputs` instead of relying on the project-local one

## Medium Priority

- [x] **Switch `genRandStr()` to `crypto.getRandomValues()`**: `worker/common.ts:37` uses `Math.random()` — good standalone upstream PR

## Low Priority

- [ ] **Add CSP headers to `/d/` display page**: Uses `dangerouslySetInnerHTML` — defense-in-depth improvement
- [ ] **GitHub Actions for dev preview**: Auto-deploy to `--env dev` on push to feature branches

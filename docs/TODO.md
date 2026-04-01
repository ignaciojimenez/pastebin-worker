# TODO

## High Priority

- [x] **Fix Nix flake for seamless dev onboarding**: Improved — `flake-utils` for multi-platform, `shellHook` auto-installs deps, `.envrc` for direnv activation. Wrangler kept project-local (Nix lags behind CF releases).

## Medium Priority

- [x] **Switch `genRandStr()` to `crypto.getRandomValues()`**: `worker/common.ts:37` uses `Math.random()` — good standalone upstream PR

## Low Priority

- [ ] **Add CSP headers to `/d/` display page**: Uses `dangerouslySetInnerHTML` — defense-in-depth improvement
- [ ] **GitHub Actions for dev preview**: Auto-deploy to `--env dev` on push to feature branches

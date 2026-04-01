# Dev Guide (Fork-specific)

This fork uses a [Nix flake](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake.html) + [direnv](https://direnv.net/) for a reproducible dev environment. All tooling (node, pnpm) is provided by Nix — nothing pollutes your global system.

## Getting Started

### Recommended: direnv (automatic)

With [direnv](https://direnv.net/) installed and hooked into your shell, entering the project directory activates the dev shell automatically:

```sh
cd pastebin-worker    # direnv activates the Nix shell, runs pnpm install if stale
```

First-time setup (one-time):
```sh
direnv allow           # trust this project's .envrc
```

### Manual fallback

```sh
nix develop            # enter dev shell (provides node, pnpm, auto-installs deps)
```

## Deploy

```sh
pnpm wrangler login
pnpm run deploy      # production (note: must use 'run' — pnpm has a built-in deploy command)
pnpm run deploy:dev  # dev preview
```

## Upstream PRs

Keep Nix-specific files (`flake.nix`, `flake.lock`, `.envrc`, this guide, `docs/`) out of upstream PRs — branch off `goshujin` for clean patches.

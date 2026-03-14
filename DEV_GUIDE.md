# Dev Guide (Fork-specific)

This fork uses a [Nix flake](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake.html) for a reproducible dev environment. All commands run inside the Nix shell.

## Getting Started

```sh
nix develop          # enter dev shell (provides node, pnpm)
pnpm install         # install dependencies
```

## Deploy

```sh
pnpm wrangler login
pnpm run deploy      # production (note: must use 'run' — pnpm has a built-in deploy command)
pnpm run deploy:dev  # dev preview
```

## Upstream PRs

Keep Nix-specific files (`flake.nix`, `flake.lock`, this guide, `docs/`) out of upstream PRs — branch off `goshujin` for clean patches.

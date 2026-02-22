# Development Guide for pastebin-worker (Fork)

This guide is for contributors and users of this fork who want a reproducible development environment using Nix, as well as other fork-specific instructions.

---

## Development with Nix (Reproducible Environment)

This project supports a reproducible development environment using [Nix flakes](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake.html).

### Getting Started

1. **Install [Nix](https://nixos.org/download.html)** (with flakes enabled).
2. **Enter the development shell:**
   ```sh
   nix develop
   ```
   This will provide you with `nodejs` and `yarn` in a reproducible environment—no need to install anything globally.
3. **Install project dependencies:**
   ```sh
   yarn install
   ```
4. **Login to Cloudflare and deploy:**
   ```sh
   yarn wrangler login
   yarn deploy
   ```

You can use all yarn-based commands as described in the upstream README. If you want to use additional tools, add them to the Nix shell or use yarn add as needed.

---

## Contributing Upstream

- Please avoid including Nix-specific files (like `flake.nix`, `flake.lock`, or this guide) in PRs to the upstream repository unless they are relevant to all users.
- Keep your fork-specific documentation and tooling in separate branches or files as needed.

---

## Fork-specific Notes

- The upstream README and demo links may not apply to this fork. Refer to this guide for development and reproducibility instructions.
- If you have suggestions for improving the development workflow, feel free to update this guide!

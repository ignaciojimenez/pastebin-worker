{
  description = "Development environment for pastebin-worker";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }: {
    devShells.default = nixpkgs.lib.mkShell {
      buildInputs = [
        nixpkgs.nodejs_latest
        nixpkgs.nodePackages.pnpm
        nixpkgs.nodePackages.wrangler
      ];
    };
  };
}


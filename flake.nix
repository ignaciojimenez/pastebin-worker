{
  description = "Development environment for pastebin-worker";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
    in {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in {
          default = pkgs.mkShell {
            buildInputs = [
              pkgs.nodejs_22
              pkgs.pnpm
            ];

            shellHook = ''
              # Auto-install deps if node_modules is stale or missing
              if [ ! -d node_modules ] || [ pnpm-lock.yaml -nt node_modules/.pnpm/lock.yaml ]; then
                echo "📦 Installing dependencies..."
                pnpm install --frozen-lockfile
              fi
              echo "✅ pastebin-worker dev shell"
              echo "   node $(node --version) · pnpm $(pnpm --version)"
            '';
          };
        }
      );
    };
}

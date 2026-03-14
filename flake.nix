{
  description = "Development environment for pastebin-worker";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }: {
    devShells = {
      x86_64-linux = {
        default = let
          pkgs = import nixpkgs { system = "x86_64-linux"; };
        in pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_latest
            pkgs.nodePackages.pnpm
          ];
        };
      };
      x86_64-darwin = {
        default = let
          pkgs = import nixpkgs { system = "x86_64-darwin"; };
        in pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_latest
            pkgs.nodePackages.pnpm
          ];
        };
      };
    };
  };
}

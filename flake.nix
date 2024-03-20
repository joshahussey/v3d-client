{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: {

      devShells.x86_64-linux.default = nixpkgs.legacyPackages."x86_64-linux".mkShell {
        buildInputs = [
          nixpkgs.legacyPackages."x86_64-linux".gdal
          nixpkgs.legacyPackages."x86_64-linux".gcc
        ];
      };

  };
}

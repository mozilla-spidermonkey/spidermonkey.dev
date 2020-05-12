# Code taken from https://nathan.gs/2019/04/19/using-jekyll-and-nix-to-blog/
with import <nixpkgs> { };

let jekyll_env = bundlerEnv rec {
    name = "jekyll_env";
    inherit ruby;
    gemfile = ./Gemfile;
    lockfile = ./Gemfile.lock;
    # File generated with:
    # $ nix-shell -p bundler -p bundix --run 'bundler update; bundler lock; bundler package --no-install --path vendor; bundix; rm -rf vendor'
    gemset = ./gemset.nix;
  };
in
  stdenv.mkDerivation rec {
    name = "spidermonkey.dev";
    buildInputs = [ jekyll_env bundler ruby ];

    shellHook = ''
      exec ${jekyll_env}/bin/jekyll serve --watch
    '';
  }

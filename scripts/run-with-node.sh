#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="$(tr -d '[:space:]' < "$ROOT_DIR/.nvmrc")"
NODE_MAJOR="${NODE_VERSION%%.*}"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

version_matches() {
  case "$1" in
    "$NODE_MAJOR".*) return 0 ;;
    *) return 1 ;;
  esac
}

if command -v node >/dev/null 2>&1; then
  CURRENT_NODE_VERSION="$(node -v | sed 's/^v//')"
  if version_matches "$CURRENT_NODE_VERSION"; then
    exec "$@"
  fi
fi

if [ -s "$NVM_DIR/nvm.sh" ]; then
  # nvm is a shell function, so it must be sourced before use.
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"

  nvm install "$NODE_VERSION"
  nvm use "$NODE_VERSION"

  exec "$@"
fi

if command -v brew >/dev/null 2>&1; then
  BREW_PREFIX="$(brew --prefix 2>/dev/null || true)"
  for prefix in "$BREW_PREFIX" /opt/homebrew /usr/local; do
    NODE_BIN="$prefix/opt/node@$NODE_MAJOR/bin"
    if [ -x "$NODE_BIN/node" ]; then
      BREW_NODE_VERSION="$("$NODE_BIN/node" -v | sed 's/^v//')"
      if version_matches "$BREW_NODE_VERSION"; then
        export PATH="$NODE_BIN:$PATH"
        exec "$@"
      fi
    fi
  done
fi

cat >&2 <<EOF
Node $NODE_MAJOR is required for this project.

Install one supported runtime, then rerun the make command:
  brew install node@$NODE_MAJOR

Alternatively install nvm and let this Makefile use .nvmrc.
EOF

exit 1

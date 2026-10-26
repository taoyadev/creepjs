#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# A missing scanner must fail the gate, not report a clean tree: `rg` is not
# on GitHub's ubuntu runners, and inside an `if` its 127 read as "no match".
if ! command -v rg >/dev/null 2>&1; then
  echo "::error title=Secret scan::ripgrep (rg) is not installed; cannot scan"
  exit 2
fi

tmpfile="$(mktemp)"
trap 'rm -f "$tmpfile"' EXIT

scan() {
  local label="$1"
  local pattern="$2"
  local status=0
  # --hidden: dotfiles (.github/, .env.example siblings) are tracked content.
  rg -n --hidden --pcre2 \
    --glob '!**/node_modules/**' \
    --glob '!**/.git/**' \
    --glob '!**/.next/**' \
    --glob '!**/dist/**' \
    --glob '!**/.turbo/**' \
    --glob '!**/.wrangler/**' \
    --glob '!.env.example' \
    --glob '!apps/web/.env.example' \
    --glob '!apps/api/.dev.vars.example' \
    --glob '!docs/API.md' \
    --glob '!apps/web/src/app/docs/page.tsx' \
    --glob '!.github/SECRETS.md' \
    --glob '!pnpm-lock.yaml' \
    "$pattern" . >>"$tmpfile" || status=$?
  # rg exits 0 on a match, 1 on none, 2+ on an error (bad regex, I/O).
  case "$status" in
    0) echo "::error title=Secret scan::$label pattern matched repository content" ;;
    1) ;;
    *)
      echo "::error title=Secret scan::rg failed (exit $status) scanning for $label"
      exit "$status"
      ;;
  esac
}

scan "API token prefix" '(?<![A-Za-z0-9_])(cfp|ipb)_(?!your|test|example|<)[A-Za-z0-9]{16,}'
scan "Known leaked Cloudflare token prefix" '(?<![A-Za-z0-9_])kbjm[A-Za-z0-9_-]{8,}'
scan "Cloudflare API token assignment" 'CLOUDFLARE_API_TOKEN\s*[:=]\s*["'\'']?(?!<|your|example|\$\{\{)[A-Za-z0-9_-]{20,}'
scan "IPbot API key assignment" 'IPBOT_API_KEY\s*[:=]\s*["'\'']?(?!<|your|example|ipb_test_key)[A-Za-z0-9_-]{16,}'
scan "Test API token assignment" 'TEST_API_TOKEN\s*[:=]\s*["'\'']?(?!<|your|example)cfp_[A-Za-z0-9]{16,}'

if [[ -s "$tmpfile" ]]; then
  echo "Secret scan found potential secrets:"
  cat "$tmpfile"
  exit 1
fi

echo "Secret scan passed."

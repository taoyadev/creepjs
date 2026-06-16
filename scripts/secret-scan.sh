#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

tmpfile="$(mktemp)"
trap 'rm -f "$tmpfile"' EXIT

scan() {
  local label="$1"
  local pattern="$2"
  if rg -n --pcre2 \
    --glob '!**/node_modules/**' \
    --glob '!**/.git/**' \
    --glob '!**/.next/**' \
    --glob '!**/dist/**' \
    --glob '!**/.turbo/**' \
    --glob '!**/.wrangler/**' \
    --glob '!.env.example' \
    --glob '!apps/web/.env.example' \
    --glob '!docs/API.md' \
    --glob '!apps/web/src/app/docs/page.tsx' \
    --glob '!.github/SECRETS.md' \
    --glob '!pnpm-lock.yaml' \
    "$pattern" . >>"$tmpfile"; then
    echo "::error title=Secret scan::$label pattern matched repository content"
  fi
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

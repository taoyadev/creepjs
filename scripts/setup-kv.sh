#!/bin/bash

##############################################################################
# Setup Cloudflare KV Namespaces for CreepJS
#
# This script automates KV namespace creation and updates apps/api/wrangler.toml
# with the generated namespace IDs.
#
# Usage:
#   ./scripts/setup-kv.sh [environment]
#
# Arguments:
#   environment - Optional: production|staging|preview (default: production)
#
# Requirements:
#   - wrangler CLI installed and authenticated
#
# Notes:
#   - This script updates the KV bindings:
#       TOKENS, RATE_LIMIT, IP_CACHE
##############################################################################

set -euo pipefail

# Ensure Wrangler can write logs in restricted environments (CI/sandboxes)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
export WRANGLER_LOG_PATH="${WRANGLER_LOG_PATH:-${PROJECT_ROOT}/.tmp/wrangler-logs}"
mkdir -p "${WRANGLER_LOG_PATH}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT="${1:-production}"

ENV_SLUG=""
case "${ENVIRONMENT}" in
production | prod) ENV_SLUG="prod" ;;
staging) ENV_SLUG="staging" ;;
preview) ENV_SLUG="preview" ;;
*)
  echo -e "${RED}❌ Error: Invalid environment '${ENVIRONMENT}'${NC}"
  echo -e "${YELLOW}   Valid values: production|prod, staging, preview${NC}"
  exit 1
  ;;
esac

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CreepJS - Cloudflare KV Namespace Setup                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}🌍 Environment: ${ENVIRONMENT} (namespace suffix: ${ENV_SLUG})${NC}"
echo ""

if ! command -v wrangler &>/dev/null; then
  echo -e "${RED}❌ Error: wrangler CLI is not installed${NC}"
  echo -e "${YELLOW}   Install it with: npm install -g wrangler${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Wrangler CLI found${NC}"

if ! wrangler whoami &>/dev/null; then
  echo -e "${RED}❌ Error: Not authenticated with Cloudflare${NC}"
  echo -e "${YELLOW}   Run: wrangler login${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Authenticated with Cloudflare${NC}"
echo ""

# Namespace names (scoped by environment)
# NOTE: OpenSpec scenarios expect `*_prod` for production.
TOKENS_NAMESPACE="creepjs_tokens_${ENV_SLUG}"
RATELIMIT_NAMESPACE="creepjs_ratelimit_${ENV_SLUG}"
IP_CACHE_NAMESPACE="creepjs_ip_cache_${ENV_SLUG}"

WRANGLER_CONFIG="apps/api/wrangler.toml"
BACKUP_CONFIG="${WRANGLER_CONFIG}.backup"

TOKENS_ID=""
RATELIMIT_ID=""
IP_CACHE_ID=""

create_namespace() {
  local namespace_name=$1
  local target_var=$2

  echo -e "${YELLOW}Creating namespace: ${namespace_name}${NC}"

  local output
  if ! output=$(wrangler kv:namespace create "$namespace_name" 2>&1); then
    echo -e "${RED}❌ Failed to create namespace: ${namespace_name}${NC}"
    echo "$output"
    return 1
  fi

  # Wrangler outputs a 32-char hex namespace id. Extract the first occurrence.
  local namespace_id
  namespace_id=$(echo "$output" | grep -Eo '[a-f0-9]{32}' | head -n 1 || true)

  if [ -z "$namespace_id" ]; then
    echo -e "${RED}❌ Failed to extract namespace ID${NC}"
    echo "$output"
    return 1
  fi

  printf -v "$target_var" '%s' "$namespace_id"

  echo -e "${GREEN}✓ Created: ${namespace_name}${NC}"
  echo -e "${GREEN}  ID: ${namespace_id}${NC}"
  echo ""
}

echo -e "${BLUE}📦 Creating KV Namespaces...${NC}"
echo ""

create_namespace "$TOKENS_NAMESPACE" "TOKENS_ID"
create_namespace "$RATELIMIT_NAMESPACE" "RATELIMIT_ID"
create_namespace "$IP_CACHE_NAMESPACE" "IP_CACHE_ID"

if [ -z "$TOKENS_ID" ] || [ -z "$RATELIMIT_ID" ] || [ -z "$IP_CACHE_ID" ]; then
  echo -e "${RED}❌ Failed to create one or more namespaces${NC}"
  exit 1
fi

echo -e "${BLUE}📝 Updating wrangler.toml...${NC}"
echo ""

if [ -f "$WRANGLER_CONFIG" ]; then
  cp "$WRANGLER_CONFIG" "$BACKUP_CONFIG"
  echo -e "${GREEN}✓ Backed up wrangler.toml to ${BACKUP_CONFIG}${NC}"

  awk \
    -v tokens_id="$TOKENS_ID" \
    -v ratelimit_id="$RATELIMIT_ID" \
    -v ip_cache_id="$IP_CACHE_ID" \
    '
    BEGIN { binding = "" }
    /^[[:space:]]*binding[[:space:]]*=[[:space:]]*"TOKENS"[[:space:]]*$/ { binding = "TOKENS" }
    /^[[:space:]]*binding[[:space:]]*=[[:space:]]*"RATE_LIMIT"[[:space:]]*$/ { binding = "RATE_LIMIT" }
    /^[[:space:]]*binding[[:space:]]*=[[:space:]]*"IP_CACHE"[[:space:]]*$/ { binding = "IP_CACHE" }
    binding != "" && /^[[:space:]]*id[[:space:]]*=[[:space:]]*"/ {
      if (binding == "TOKENS") sub(/id[[:space:]]*=[[:space:]]*".*"/, "id = \"" tokens_id "\"");
      else if (binding == "RATE_LIMIT") sub(/id[[:space:]]*=[[:space:]]*".*"/, "id = \"" ratelimit_id "\"");
      else if (binding == "IP_CACHE") sub(/id[[:space:]]*=[[:space:]]*".*"/, "id = \"" ip_cache_id "\"");
      binding = "";
    }
    { print }
    ' "$WRANGLER_CONFIG" > "${WRANGLER_CONFIG}.tmp"

  mv "${WRANGLER_CONFIG}.tmp" "$WRANGLER_CONFIG"

  echo -e "${GREEN}✓ Updated ${WRANGLER_CONFIG} with namespace IDs${NC}"
  echo -e "${YELLOW}↩ Rollback:${NC} cp \"${BACKUP_CONFIG}\" \"${WRANGLER_CONFIG}\""
else
  echo -e "${YELLOW}⚠  wrangler.toml not found at ${WRANGLER_CONFIG}${NC}"
  echo -e "${YELLOW}   Please manually add these KV bindings:${NC}"
  echo ""
  echo "[[kv_namespaces]]"
  echo "binding = \"TOKENS\""
  echo "id = \"${TOKENS_ID}\""
  echo ""
  echo "[[kv_namespaces]]"
  echo "binding = \"RATE_LIMIT\""
  echo "id = \"${RATELIMIT_ID}\""
  echo ""
  echo "[[kv_namespaces]]"
  echo "binding = \"IP_CACHE\""
  echo "id = \"${IP_CACHE_ID}\""
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ KV Namespace Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Namespace Summary:${NC}"
echo -e "  ${YELLOW}Tokens Namespace:${NC}      ${TOKENS_NAMESPACE}"
echo -e "  ${YELLOW}Tokens ID:${NC}              ${TOKENS_ID}"
echo -e "  ${YELLOW}Rate Limit Namespace:${NC}  ${RATELIMIT_NAMESPACE}"
echo -e "  ${YELLOW}Rate Limit ID:${NC}          ${RATELIMIT_ID}"
echo -e "  ${YELLOW}IP Cache Namespace:${NC}     ${IP_CACHE_NAMESPACE}"
echo -e "  ${YELLOW}IP Cache ID:${NC}             ${IP_CACHE_ID}"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo -e "  1. Verify the namespace IDs in ${WRANGLER_CONFIG}"
echo -e "  2. Deploy your Worker: ${YELLOW}cd apps/api && wrangler deploy --env ${ENVIRONMENT}${NC}"
echo ""

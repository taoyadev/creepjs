#!/bin/bash

##############################################################################
# Setup Cloudflare Workers Secrets for CreepJS
#
# This script prompts for secret values and uploads them using Wrangler.
#
# Usage:
#   ./scripts/setup-secrets.sh [environment]
#
# Arguments:
#   environment - Optional: production|staging|preview (default: production)
#
# Requirements:
#   - wrangler CLI installed and authenticated
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
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ENVIRONMENT="${1:-production}"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CreepJS - Cloudflare Workers Secrets Setup                  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ ! "$ENVIRONMENT" =~ ^(production|staging|preview)$ ]]; then
  echo -e "${RED}❌ Error: Invalid environment '$ENVIRONMENT'${NC}"
  echo -e "${YELLOW}   Valid values: production, staging, preview${NC}"
  exit 1
fi

echo -e "${GREEN}🌍 Environment: ${ENVIRONMENT}${NC}"
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

if [ "$ENVIRONMENT" = "production" ]; then
  WORKER_NAME="creepjs-api"
  ENV_FLAG=()
else
  WORKER_NAME="creepjs-api-${ENVIRONMENT}"
  ENV_FLAG=(--env "$ENVIRONMENT")
fi

WRANGLER_DIR="apps/api"

echo -e "${BLUE}📦 Managing Secrets for Worker: ${WORKER_NAME}${NC}"
echo ""

set_secret() {
  local secret_name=$1
  local secret_description=$2
  local is_optional=$3

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Secret: ${secret_name}${NC}"
  echo -e "${BLUE}Description: ${secret_description}${NC}"

  if [ "$is_optional" = "true" ]; then
    echo -e "${YELLOW}(Optional - press Enter to skip)${NC}"
  fi
  echo ""

  local secret_value
  read -r -s -p "$(echo -e "${GREEN}Enter value for ${secret_name}:${NC} ")" secret_value
  echo ""

  if [ -z "$secret_value" ] && [ "$is_optional" = "true" ]; then
    echo -e "${YELLOW}⏭  Skipped (optional secret)${NC}"
    echo ""
    return 0
  fi

  if [ -z "$secret_value" ] && [ "$is_optional" = "false" ]; then
    echo -e "${RED}❌ Error: This secret is required and cannot be empty${NC}"
    echo ""
    return 1
  fi

  echo ""
  echo -e "${BLUE}Uploading secret to Cloudflare Workers...${NC}"

  if echo "$secret_value" | wrangler secret put "$secret_name" "${ENV_FLAG[@]}" --name "$WORKER_NAME" &>/dev/null; then
    echo -e "${GREEN}✓ Successfully set: ${secret_name}${NC}"
    echo ""
    return 0
  fi

  echo -e "${RED}❌ Failed to set: ${secret_name}${NC}"
  echo ""
  return 1
}

echo -e "${YELLOW}This script will guide you through setting up secrets for the CreepJS API Worker.${NC}"
echo -e "${YELLOW}Press Ctrl+C at any time to cancel.${NC}"
echo ""

read -r -p "$(echo -e "${GREEN}Ready to proceed? [y/N]:${NC} ")" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Setup cancelled by user.${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setting up secrets...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

FAILED_SECRETS=()

echo -e "${BLUE}📌 Recommended Secrets${NC}"
echo ""

if ! set_secret \
  "IPINFO_TOKEN" \
  "IPinfo.io token used by the /my-ip route for geolocation and ASN enrichment." \
  "true"; then
  FAILED_SECRETS+=("IPINFO_TOKEN")
fi

if ! set_secret \
  "CREEPJS_TOKEN_PRIVATE_KEY" \
  "Private key for signing API tokens (base64-encoded, 32+ bytes). Future enhancement." \
  "true"; then
  FAILED_SECRETS+=("CREEPJS_TOKEN_PRIVATE_KEY")
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ${#FAILED_SECRETS[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠  Some secrets failed to upload:${NC}"
  for secret in "${FAILED_SECRETS[@]}"; do
    echo -e "  ${RED}✗${NC} $secret"
  done
  echo ""
  echo -e "${YELLOW}You can retry by running this script again.${NC}"
  echo ""
fi

echo -e "${BLUE}📝 Verifying secrets...${NC}"
echo ""

cd "$WRANGLER_DIR"

echo -e "${CYAN}Current secrets for ${WORKER_NAME}:${NC}"
if wrangler secret list "${ENV_FLAG[@]}" --name "$WORKER_NAME" 2>/dev/null; then
  echo ""
  echo -e "${GREEN}✅ Secrets successfully configured!${NC}"
else
  echo -e "${YELLOW}⚠  Unable to list secrets. They may still be set correctly.${NC}"
  echo -e "${YELLOW}   Check the Cloudflare Dashboard to verify.${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Secret Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}Next Steps:${NC}"
echo -e "  1. Deploy your Worker: ${YELLOW}cd apps/api && wrangler deploy${NC}"
echo -e "  2. Test the API: ${YELLOW}curl https://api.creepjs.org/${NC}"
echo -e "  3. Monitor logs: ${YELLOW}wrangler tail${NC}"
echo ""

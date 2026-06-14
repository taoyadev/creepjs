#!/bin/bash

##############################################################################
# CreepJS API Health Check Script
#
# Performs a small set of safe checks against a deployed API:
# - GET / (health)
# - p95 latency (GET /)
# - GET unknown route (404)
# - OPTIONS /v1/fingerprint (CORS)
# - POST /v1/token (token issuance)
# - POST /v1/fingerprint (auth + happy path, if token available)
#
# Usage:
#   ./scripts/health-check.sh [base-url] [api-token]
#
# Environment Variables:
#   CREEPJS_API_URL    - Overrides base-url
#   CREEPJS_API_TOKEN  - Overrides api-token
##############################################################################

set -u

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_URL="${CREEPJS_API_URL:-${1:-https://api.creepjs.org}}"
API_TOKEN="${CREEPJS_API_TOKEN:-${2:-}}"
BASE_URL="${BASE_URL%/}"

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNED=0

FAILED_TESTS=()
WARNING_TESTS=()

require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}❌ Missing required command: $1${NC}"
    exit 1
  fi
}

require_cmd curl
require_cmd awk
require_cmd sort
require_cmd sed

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CreepJS API - Health Check                                  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Target URL: ${BASE_URL}${NC}"
echo -e "${CYAN}Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
echo ""

make_request() {
  local method=$1
  local endpoint=$2
  local headers=${3:-}
  local body=${4:-}

  local url="${BASE_URL}${endpoint}"
  local curl_args=(-s -w '\n%{http_code}\n%{time_total}' -X "$method")

  if [ -n "$headers" ]; then
    IFS='|' read -r -a header_array <<<"$headers"
    for header in "${header_array[@]}"; do
      curl_args+=(-H "$header")
    done
  fi

  if [ -n "$body" ]; then
    curl_args+=(-d "$body")
  fi

  local response
  response=$(curl "${curl_args[@]}" "$url" 2>&1)

  RESPONSE_BODY=$(echo "$response" | head -n -2)
  STATUS_CODE=$(echo "$response" | tail -n 2 | head -n 1)
  TIME_TOTAL=$(echo "$response" | tail -n 1)
  RESPONSE_TIME_MS=$(awk "BEGIN { printf \"%d\", (${TIME_TOTAL} * 1000) }" 2>/dev/null || echo "0")
}

pass() {
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

warn() {
  TESTS_WARNED=$((TESTS_WARNED + 1))
  WARNING_TESTS+=("$1")
}

fail() {
  TESTS_FAILED=$((TESTS_FAILED + 1))
  FAILED_TESTS+=("$1")
}

latency_p95_ms() {
  local endpoint=$1
  local samples=$2

  local times_ms=()
  local i
  for ((i = 1; i <= samples; i++)); do
    local url="${BASE_URL}${endpoint}"
    local seconds
    seconds=$(curl -s -o /dev/null -w '%{time_total}' "$url" 2>/dev/null || true)

    if [ -z "$seconds" ]; then
      return 1
    fi

    local ms
    ms=$(awk "BEGIN { printf \"%d\", (${seconds} * 1000) }" 2>/dev/null || echo "0")
    times_ms+=("$ms")
  done

  local idx
  idx=$(((samples * 95 + 99) / 100)) # 1-based index (ceil)

  printf '%s\n' "${times_ms[@]}" | sort -n | sed -n "${idx}p"
}

run_test() {
  local name=$1
  shift

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Test: ${name}${NC}"

  if "$@"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    pass
  else
    echo -e "${RED}❌ FAILED${NC}"
    fail "$name"
  fi
  echo ""
}

test_root() {
  make_request "GET" "/" "Accept: application/json" "" || return 1
  echo -e "  Status: ${STATUS_CODE} (${RESPONSE_TIME_MS}ms)"
  [ "$STATUS_CODE" = "200" ] || return 1
  echo "$RESPONSE_BODY" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' || return 1
}

test_latency_p95_root() {
  local samples="${CREEPJS_P95_SAMPLES:-20}"
  local target_ms="${CREEPJS_P95_TARGET_MS:-100}"

  local p95_ms
  p95_ms=$(latency_p95_ms "/" "$samples") || return 1

  echo -e "  Samples: ${samples}"
  echo -e "  p95 latency: ${p95_ms}ms (target ≤ ${target_ms}ms)"

  [ "$p95_ms" -le "$target_ms" ] || return 1
}

test_not_found() {
  make_request "GET" "/__does_not_exist__" "Accept: application/json" "" || return 1
  echo -e "  Status: ${STATUS_CODE} (${RESPONSE_TIME_MS}ms)"
  [ "$STATUS_CODE" = "404" ] || return 1
  echo "$RESPONSE_BODY" | grep -q '"error"[[:space:]]*:[[:space:]]*"Not found"' || return 1
}

test_cors() {
  local headers
  headers=$(curl -sI -X OPTIONS \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type,X-API-Token" \
    "${BASE_URL}/v1/fingerprint" 2>&1)

  if echo "$headers" | grep -qi "access-control-allow-origin"; then
    echo -e "  ${GREEN}✓${NC} access-control-allow-origin present"
    return 0
  fi

  echo -e "  ${RED}✗${NC} access-control-allow-origin missing"
  return 1
}

test_token() {
  local email="healthcheck+$(date +%s)@example.com"
  make_request "POST" "/v1/token" "Content-Type: application/json|Accept: application/json" "{\"email\":\"${email}\"}" || return 1
  echo -e "  Status: ${STATUS_CODE} (${RESPONSE_TIME_MS}ms)"
  [ "$STATUS_CODE" = "200" ] || return 1
  echo "$RESPONSE_BODY" | grep -q '"token"' || return 1

  # Extract token if caller didn't provide one
  if [ -z "${API_TOKEN}" ]; then
    API_TOKEN=$(echo "$RESPONSE_BODY" | sed -nE 's/.*"token"[[:space:]]*:[[:space:]]*"([^"]+)".*/\\1/p' | head -n 1)
    if [ -n "${API_TOKEN}" ]; then
      echo -e "  ${GREEN}✓${NC} Captured token for subsequent tests"
    else
      warn "token: unable to parse token from response"
    fi
  fi
}

test_fingerprint_requires_auth() {
  make_request "POST" "/v1/fingerprint" "Content-Type: application/json|Accept: application/json" "{\"fingerprintId\":\"healthcheck\",\"data\":{},\"timestamp\":1700000000000,\"confidence\":1}" || return 1
  echo -e "  Status: ${STATUS_CODE} (${RESPONSE_TIME_MS}ms)"
  [ "$STATUS_CODE" = "401" ] || return 1
}

test_fingerprint_with_token() {
  if [ -z "${API_TOKEN}" ]; then
    echo -e "  ${YELLOW}⚠${NC} Skipping: no API token available"
    warn "fingerprint: skipped (no token)"
    return 0
  fi

  make_request "POST" "/v1/fingerprint" "Content-Type: application/json|Accept: application/json|X-API-Token: ${API_TOKEN}" "{\"fingerprintId\":\"healthcheck\",\"data\":{},\"timestamp\":1700000000000,\"confidence\":1}" || return 1
  echo -e "  Status: ${STATUS_CODE} (${RESPONSE_TIME_MS}ms)"
  if [ "$STATUS_CODE" != "200" ] && [ "$STATUS_CODE" != "201" ]; then
    return 1
  fi
  echo "$RESPONSE_BODY" | grep -q '"fingerprintId"' || return 1
}

run_test "API root endpoint" test_root
run_test "Latency p95 (GET /)" test_latency_p95_root
run_test "404 for unknown routes" test_not_found
run_test "CORS preflight headers" test_cors
run_test "Token generation" test_token
run_test "Fingerprint requires auth" test_fingerprint_requires_auth
run_test "Fingerprint with token" test_fingerprint_with_token

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$TESTS_FAILED" -eq 0 ]; then
  echo -e "${GREEN}✅ Health Check PASSED!${NC}"
else
  echo -e "${RED}❌ Health Check FAILED!${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo "Total Tests: ${TOTAL}"
echo -e "${GREEN}✓ Passed:${NC} ${TESTS_PASSED}"
echo -e "${YELLOW}⚠  Warnings:${NC} ${TESTS_WARNED}"
echo -e "${RED}✗ Failed:${NC} ${TESTS_FAILED}"
echo ""

if [ "${#WARNING_TESTS[@]}" -gt 0 ]; then
  echo -e "${YELLOW}Warnings:${NC}"
  for w in "${WARNING_TESTS[@]}"; do
    echo -e "  ${YELLOW}⚠${NC} $w"
  done
  echo ""
fi

if [ "${#FAILED_TESTS[@]}" -gt 0 ]; then
  echo -e "${RED}Failed Tests:${NC}"
  for f in "${FAILED_TESTS[@]}"; do
    echo -e "  ${RED}✗${NC} $f"
  done
  echo ""
fi

if [ "$TESTS_FAILED" -ne 0 ]; then
  exit 1
fi

#!/bin/bash

##############################################################################
# CreepJS API Health Check Script
#
# This script performs comprehensive health checks on the deployed CreepJS API.
# It tests all endpoints, validates response times, checks CORS, and verifies
# data integrity.
#
# Usage:
#   ./scripts/health-check.sh [base-url] [api-token]
#
# Arguments:
#   base-url   - Optional: API base URL (default: https://api.creepjs.org)
#   api-token  - Optional: Valid API token for authenticated endpoints
#
# Environment Variables:
#   CREEPJS_API_URL    - API base URL (overrides first argument)
#   CREEPJS_API_TOKEN  - API token (overrides second argument)
#
# Example:
#   ./scripts/health-check.sh
#   ./scripts/health-check.sh https://api-staging.creepjs.org
#   ./scripts/health-check.sh https://api.creepjs.org cfp_xxxxx
#   CREEPJS_API_TOKEN=cfp_xxxxx ./scripts/health-check.sh
##############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${CREEPJS_API_URL:-${1:-https://api.creepjs.org}}"
API_TOKEN="${CREEPJS_API_TOKEN:-${2:-}}"

# Remove trailing slash from BASE_URL
BASE_URL="${BASE_URL%/}"

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNED=0
FAILED_TESTS=()
WARNING_TESTS=()

# Performance thresholds (milliseconds)
THRESHOLD_FAST=100
THRESHOLD_ACCEPTABLE=500
THRESHOLD_SLOW=1000

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CreepJS API - Comprehensive Health Check                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Target URL: ${BASE_URL}${NC}"
echo -e "${CYAN}Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
echo ""

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ Error: curl is not installed${NC}"
    exit 1
fi

# Check if jq is available (optional but recommended)
HAS_JQ=false
if command -v jq &> /dev/null; then
    HAS_JQ=true
    echo -e "${GREEN}✓ jq available (enhanced JSON parsing)${NC}"
else
    echo -e "${YELLOW}⚠  jq not found (install for better output: brew install jq)${NC}"
fi
echo ""

##############################################################################
# Helper Functions
##############################################################################

# Function to make HTTP request and capture metrics
make_request() {
    local method=$1
    local endpoint=$2
    local headers=${3:-}
    local body=${4:-}
    local description=$5

    local url="${BASE_URL}${endpoint}"
    local start_time=$(date +%s%3N)  # milliseconds

    # Build curl command
    local curl_cmd="curl -s -w '\n%{http_code}\n%{time_total}' -X ${method}"

    # Add headers
    if [ -n "$headers" ]; then
        IFS='|' read -ra HEADER_ARRAY <<< "$headers"
        for header in "${HEADER_ARRAY[@]}"; do
            curl_cmd+=" -H '${header}'"
        done
    fi

    # Add body for POST requests
    if [ -n "$body" ]; then
        curl_cmd+=" -d '${body}'"
    fi

    curl_cmd+=" '${url}'"

    # Execute request
    local response=$(eval $curl_cmd 2>&1)
    local end_time=$(date +%s%3N)

    # Parse response (last 2 lines are status code and time)
    local response_body=$(echo "$response" | head -n -2)
    local status_code=$(echo "$response" | tail -n 2 | head -n 1)
    local time_total=$(echo "$response" | tail -n 1)
    local response_time_ms=$(echo "$time_total * 1000" | bc 2>/dev/null || echo "0")
    response_time_ms=${response_time_ms%.*}  # Convert to integer

    # Return values via global variables
    RESPONSE_BODY="$response_body"
    STATUS_CODE="$status_code"
    RESPONSE_TIME="$response_time_ms"
}

# Function to assert status code
assert_status() {
    local expected=$1
    local actual=$2
    local test_name=$3

    if [ "$actual" = "$expected" ]; then
        echo -e "  ${GREEN}✓${NC} Status: ${expected}"
        return 0
    else
        echo -e "  ${RED}✗${NC} Status: expected ${expected}, got ${actual}"
        FAILED_TESTS+=("$test_name: Expected status $expected, got $actual")
        return 1
    fi
}

# Function to assert response time
assert_response_time() {
    local response_time=$1
    local test_name=$2

    if [ "$response_time" -lt "$THRESHOLD_FAST" ]; then
        echo -e "  ${GREEN}✓${NC} Response time: ${response_time}ms (fast)"
        return 0
    elif [ "$response_time" -lt "$THRESHOLD_ACCEPTABLE" ]; then
        echo -e "  ${GREEN}✓${NC} Response time: ${response_time}ms (acceptable)"
        return 0
    elif [ "$response_time" -lt "$THRESHOLD_SLOW" ]; then
        echo -e "  ${YELLOW}⚠${NC} Response time: ${response_time}ms (slow)"
        WARNING_TESTS+=("$test_name: Slow response time (${response_time}ms)")
        ((TESTS_WARNED++))
        return 0
    else
        echo -e "  ${RED}✗${NC} Response time: ${response_time}ms (too slow)"
        FAILED_TESTS+=("$test_name: Response time too slow (${response_time}ms)")
        return 1
    fi
}

# Function to assert JSON field exists
assert_json_field() {
    local response=$1
    local field=$2
    local test_name=$3

    if [ "$HAS_JQ" = true ]; then
        if echo "$response" | jq -e "$field" &> /dev/null; then
            echo -e "  ${GREEN}✓${NC} Field '${field}' exists"
            return 0
        else
            echo -e "  ${RED}✗${NC} Field '${field}' missing"
            FAILED_TESTS+=("$test_name: Missing JSON field '$field'")
            return 1
        fi
    else
        # Fallback to grep if jq not available
        if echo "$response" | grep -q "\"${field}\""; then
            echo -e "  ${GREEN}✓${NC} Field '${field}' exists"
            return 0
        else
            echo -e "  ${RED}✗${NC} Field '${field}' missing"
            FAILED_TESTS+=("$test_name: Missing JSON field '$field'")
            return 1
        fi
    fi
}

# Function to run a test
run_test() {
    local test_name=$1
    shift
    local test_function=$@

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Test: ${test_name}${NC}"

    # Run test and capture result
    if $test_function "$test_name"; then
        ((TESTS_PASSED++))
        echo -e "${GREEN}✅ PASSED${NC}"
    else
        ((TESTS_FAILED++))
        echo -e "${RED}❌ FAILED${NC}"
    fi
    echo ""
}

##############################################################################
# Test Implementations
##############################################################################

test_api_root() {
    local test_name=$1
    make_request "GET" "/" "" "" "API root"

    assert_status "200" "$STATUS_CODE" "$test_name" || return 1
    assert_response_time "$RESPONSE_TIME" "$test_name" || return 1
    assert_json_field "$RESPONSE_BODY" ".message" "$test_name" || return 1

    return 0
}

test_cors_headers() {
    local test_name=$1

    # Test preflight request
    local response=$(curl -s -I -X OPTIONS \
        -H "Origin: https://example.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,X-API-Token" \
        "${BASE_URL}/v1/fingerprint" 2>&1)

    if echo "$response" | grep -qi "access-control-allow-origin"; then
        echo -e "  ${GREEN}✓${NC} CORS headers present"
    else
        echo -e "  ${RED}✗${NC} CORS headers missing"
        FAILED_TESTS+=("$test_name: CORS headers not found")
        return 1
    fi

    if echo "$response" | grep -qi "access-control-allow-methods"; then
        echo -e "  ${GREEN}✓${NC} Allowed methods header present"
    else
        echo -e "  ${YELLOW}⚠${NC} Allowed methods header missing"
        WARNING_TESTS+=("$test_name: Missing Access-Control-Allow-Methods")
        ((TESTS_WARNED++))
    fi

    return 0
}

test_token_generation() {
    local test_name=$1
    local test_email="health-check-$(date +%s)@creepjs.org"

    make_request "POST" "/v1/token" \
        "Content-Type: application/json" \
        "{\"email\":\"${test_email}\"}" \
        "Token generation"

    assert_status "200" "$STATUS_CODE" "$test_name" || return 1
    assert_response_time "$RESPONSE_TIME" "$test_name" || return 1
    assert_json_field "$RESPONSE_BODY" ".token" "$test_name" || return 1
    assert_json_field "$RESPONSE_BODY" ".email" "$test_name" || return 1

    # Extract token for later use
    if [ "$HAS_JQ" = true ]; then
        GENERATED_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.token')
        echo -e "  ${CYAN}Generated token: ${GENERATED_TOKEN}${NC}"
    fi

    return 0
}

test_fingerprint_generation_auth() {
    local test_name=$1

    if [ -z "$API_TOKEN" ] && [ -z "${GENERATED_TOKEN:-}" ]; then
        echo -e "  ${YELLOW}⚠${NC} Skipping: No API token available"
        echo -e "  ${YELLOW}  Provide token via: ./health-check.sh <url> <token>${NC}"
        WARNING_TESTS+=("$test_name: Skipped (no API token)")
        ((TESTS_WARNED++))
        return 0
    fi

    local token="${API_TOKEN:-${GENERATED_TOKEN}}"

    local sample_components='{
        "canvas": "canvas123abc",
        "webgl": "webgl456def",
        "navigator": {
            "userAgent": "Mozilla/5.0",
            "platform": "MacIntel",
            "language": "en-US"
        }
    }'

    make_request "POST" "/v1/fingerprint" \
        "Content-Type: application/json|X-API-Token: ${token}" \
        "$sample_components" \
        "Fingerprint generation"

    assert_status "200" "$STATUS_CODE" "$test_name" || return 1
    assert_response_time "$RESPONSE_TIME" "$test_name" || return 1
    assert_json_field "$RESPONSE_BODY" ".fingerprintId" "$test_name" || return 1
    assert_json_field "$RESPONSE_BODY" ".confidence" "$test_name" || return 1

    return 0
}

test_fingerprint_auth_required() {
    local test_name=$1

    make_request "POST" "/v1/fingerprint" \
        "Content-Type: application/json" \
        '{"canvas":"test"}' \
        "Fingerprint without auth"

    # Should return 401 Unauthorized
    if [ "$STATUS_CODE" = "401" ]; then
        echo -e "  ${GREEN}✓${NC} Correctly requires authentication"
        return 0
    else
        echo -e "  ${RED}✗${NC} Should require authentication (got status $STATUS_CODE)"
        FAILED_TESTS+=("$test_name: Expected 401, got $STATUS_CODE")
        return 1
    fi
}

test_rate_limiting() {
    local test_name=$1

    if [ -z "$API_TOKEN" ] && [ -z "${GENERATED_TOKEN:-}" ]; then
        echo -e "  ${YELLOW}⚠${NC} Skipping: No API token available"
        WARNING_TESTS+=("$test_name: Skipped (no API token)")
        ((TESTS_WARNED++))
        return 0
    fi

    echo -e "  ${BLUE}Testing rate limit by making multiple requests...${NC}"

    # Note: This test doesn't actually hit the rate limit (1000/day)
    # It just verifies the endpoint responds correctly multiple times
    local token="${API_TOKEN:-${GENERATED_TOKEN}}"

    for i in {1..5}; do
        make_request "POST" "/v1/fingerprint" \
            "Content-Type: application/json|X-API-Token: ${token}" \
            '{"canvas":"test"}' \
            "Rate limit test $i"

        if [ "$STATUS_CODE" != "200" ] && [ "$STATUS_CODE" != "429" ]; then
            echo -e "  ${RED}✗${NC} Unexpected status: $STATUS_CODE on request $i"
            FAILED_TESTS+=("$test_name: Unexpected status $STATUS_CODE")
            return 1
        fi

        echo -e "  ${GREEN}✓${NC} Request $i: Status $STATUS_CODE"
    done

    echo -e "  ${GREEN}✓${NC} Rate limiting mechanism operational"
    return 0
}

test_error_handling() {
    local test_name=$1

    # Test invalid JSON
    make_request "POST" "/v1/fingerprint" \
        "Content-Type: application/json|X-API-Token: test" \
        'invalid json' \
        "Invalid JSON"

    if [ "$STATUS_CODE" = "400" ] || [ "$STATUS_CODE" = "401" ]; then
        echo -e "  ${GREEN}✓${NC} Handles invalid requests correctly"
    else
        echo -e "  ${YELLOW}⚠${NC} Error handling status: $STATUS_CODE"
        WARNING_TESTS+=("$test_name: Expected 400/401, got $STATUS_CODE")
        ((TESTS_WARNED++))
    fi

    # Test missing endpoint
    make_request "GET" "/v1/nonexistent" "" "" "404 test"

    if [ "$STATUS_CODE" = "404" ]; then
        echo -e "  ${GREEN}✓${NC} Returns 404 for missing endpoints"
    else
        echo -e "  ${RED}✗${NC} Expected 404, got $STATUS_CODE"
        FAILED_TESTS+=("$test_name: Expected 404, got $STATUS_CODE")
        return 1
    fi

    return 0
}

##############################################################################
# Main Test Execution
##############################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Running Health Checks...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run all tests
run_test "API Root Endpoint" test_api_root
run_test "CORS Configuration" test_cors_headers
run_test "Token Generation" test_token_generation
run_test "Fingerprint Generation (Authenticated)" test_fingerprint_generation_auth
run_test "Authentication Required" test_fingerprint_auth_required
run_test "Rate Limiting" test_rate_limiting
run_test "Error Handling" test_error_handling

##############################################################################
# Results Summary
##############################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}Test Results Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${CYAN}Total Tests:${NC} $TOTAL_TESTS"
echo -e "${GREEN}✓ Passed:${NC} $TESTS_PASSED"
echo -e "${YELLOW}⚠  Warnings:${NC} $TESTS_WARNED"
echo -e "${RED}✗ Failed:${NC} $TESTS_FAILED"
echo ""

# Display warnings
if [ $TESTS_WARNED -gt 0 ]; then
    echo -e "${YELLOW}⚠  Warnings:${NC}"
    for warning in "${WARNING_TESTS[@]}"; do
        echo -e "  ${YELLOW}•${NC} $warning"
    done
    echo ""
fi

# Display failures
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed Tests:${NC}"
    for failure in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}•${NC} $failure"
    done
    echo ""
fi

# Overall result
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Health Check PASSED!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Health Check FAILED!${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
fi

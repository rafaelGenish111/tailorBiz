#!/bin/bash
#
# cURL test: Generate Quote from Project
#
# Prerequisites:
#   1. Run: node backend/scripts/test_requirement_to_quote.js
#      (adds a requirement and creates a Project - note the Project ID from output)
#   2. Or add requirements manually to an existing Project in DB
#
# Usage:
#   ./backend/scripts/test_requirement_to_quote.sh [PROJECT_ID]
#   Or set env: BASE_URL, USERNAME, PASSWORD, PROJECT_ID
#
# Example:
#   BASE_URL=http://localhost:5000 USERNAME=admin PASSWORD=yourpass PROJECT_ID=xxx ./backend/scripts/test_requirement_to_quote.sh
#

set -e

BASE_URL="${BASE_URL:-http://localhost:5000}"
USERNAME="${USERNAME:-admin}"
PASSWORD="${PASSWORD:-}"
PROJECT_ID="${1:-$PROJECT_ID}"
COOKIE_FILE=$(mktemp)
trap "rm -f $COOKIE_FILE" EXIT

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 PROJECT_ID"
  echo "   Or: PROJECT_ID=xxx $0"
  echo ""
  echo "Get PROJECT_ID: run 'node backend/scripts/test_requirement_to_quote.js' first,"
  echo "  or find a Project with approved requirements in your DB."
  exit 1
fi

if [ -z "$PASSWORD" ]; then
  echo "Set PASSWORD env (e.g. PASSWORD=secret ./test_requirement_to_quote.sh $PROJECT_ID)"
  exit 1
fi

echo "=== 1. Login ==="
LOGIN_RES=$(curl -s -c "$COOKIE_FILE" -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RES" | grep -q '"success":true'; then
  echo "OK: Logged in"
else
  echo "Login failed: $LOGIN_RES"
  exit 1
fi

echo ""
echo "=== 2. Generate Quote from Project $PROJECT_ID ==="
QUOTE_RES=$(curl -s -b "$COOKIE_FILE" -X POST "${BASE_URL}/api/quotes/generate/${PROJECT_ID}" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$QUOTE_RES" | grep -q '"success":true'; then
  echo "OK: Quote created"
  echo "$QUOTE_RES" | head -c 500
  echo ""
else
  echo "Generate failed: $QUOTE_RES"
  exit 1
fi

echo ""
echo "=== Done ==="

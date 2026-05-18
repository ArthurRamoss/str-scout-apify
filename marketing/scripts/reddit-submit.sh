#!/usr/bin/env bash
# Submit drafts to Reddit subreddits via OAuth2 password-grant + /api/submit.
# Reads creds from marketing/.env. Reads draft mapping from below.
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a

: "${REDDIT_CLIENT_ID:?missing REDDIT_CLIENT_ID}"
: "${REDDIT_CLIENT_SECRET:?missing REDDIT_CLIENT_SECRET}"
: "${REDDIT_USERNAME:?missing REDDIT_USERNAME}"
: "${REDDIT_PASSWORD:?missing REDDIT_PASSWORD}"

UA="STR-Scout-Launch/0.1 by ${REDDIT_USERNAME}"

echo "→ Authenticating as ${REDDIT_USERNAME}..."
TOKEN=$(curl -s -A "$UA" \
  -u "${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}" \
  -d "grant_type=password&username=${REDDIT_USERNAME}&password=${REDDIT_PASSWORD}" \
  https://www.reddit.com/api/v1/access_token \
  | python3 -c 'import json,sys;print(json.load(sys.stdin).get("access_token",""))')

if [ -z "$TOKEN" ]; then
  echo "  ✗ auth failed — check creds (note: 2FA-enabled accounts cannot use script app)"
  exit 1
fi
echo "  ✓ authenticated"
echo

# Map: subreddit → draft file → title
# Title is extracted from the **Title:** line in each draft file.
# Body is everything below the "**Body:**" marker, trimmed.

submit_post() {
  local sub="$1"
  local draft_file="$2"

  if [ ! -f "drafts/${draft_file}" ]; then
    echo "  ⚠ skip r/${sub} — draft file drafts/${draft_file} not found"
    return
  fi

  # Extract title: first "**Title:** " or "Title:" line
  local title
  title=$(grep -m1 -E '^\*\*Title' "drafts/${draft_file}" | sed -E 's/^\*\*Title[^:]*:\*\*\s*//')
  if [ -z "$title" ]; then
    echo "  ⚠ skip r/${sub} — no Title field in drafts/${draft_file}"
    return
  fi

  # Extract body: from line after "**Body:**" to EOF
  local body
  body=$(awk '/^\*\*Body[^:]*:\*\*/{flag=1;next}flag' "drafts/${draft_file}")
  if [ -z "$body" ]; then
    echo "  ⚠ skip r/${sub} — no Body field"
    return
  fi

  echo "→ Posting to r/${sub} ..."
  echo "    title: ${title:0:80}..."

  local response
  response=$(curl -s -A "$UA" -H "Authorization: bearer $TOKEN" \
    --data-urlencode "sr=${sub}" \
    --data-urlencode "kind=self" \
    --data-urlencode "title=${title}" \
    --data-urlencode "text=${body}" \
    --data "api_type=json&resubmit=true" \
    https://oauth.reddit.com/api/submit)

  local url
  url=$(echo "$response" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d.get("json",{}).get("data",{}).get("url",""))' 2>/dev/null || true)
  local errors
  errors=$(echo "$response" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d.get("json",{}).get("errors",""))' 2>/dev/null || true)

  if [ -n "$url" ]; then
    echo "  ✓ ${url}"
  else
    echo "  ✗ failed"
    echo "    errors: ${errors}"
    echo "    raw:    ${response:0:300}..."
  fi
  echo

  # Reddit rate-limits ~1 post/9min on new accounts. Sleep generously between posts.
  sleep 12
}

# DRAFT → SUBREDDIT mapping
submit_post "SideProject"           "reddit-sideproject.md"
submit_post "ClaudeAI"              "reddit-claudeai.md"
submit_post "realestateinvesting"   "reddit-realestateinvesting.md"
submit_post "AirBnBHosts"           "reddit-airbnbhosts.md"
submit_post "Entrepreneur"          "reddit-entrepreneur.md"
submit_post "empreendedorismo"      "reddit-brasil.md"
submit_post "investimentos"         "reddit-br-investimentos.md"

echo
echo "Done. Confirm each URL above by opening in a browser."
echo "If any failed with RATELIMIT, retry just those posts after the cooldown shown in the error."

#!/usr/bin/env bash
# Open PRs against MCP registry repos via GitHub REST API.
# Reads GITHUB_PAT, GITHUB_USER from marketing/.env.
# For each registry: fork → edit file via Contents API → create PR.
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a

: "${GITHUB_PAT:?missing GITHUB_PAT}"
: "${GITHUB_USER:?missing GITHUB_USER}"

UA="STR-Scout-Launch/0.1"
API="https://api.github.com"

# Single entry to add to each awesome-* list
ENTRY='- [STR Scout](https://apify.com/ramosss/str-scout) - Short-term rental market intelligence. Tools: search-listings, regulations, market-analysis, arbitrage-score (0-100 viability scoring). Pay-per-call. Apify Standby + StreamableHTTPServerTransport.'

PR_BRANCH="add-str-scout-mcp"
PR_TITLE="Add STR Scout — Airbnb market intelligence MCP server"
PR_BODY_FILE="$(mktemp)"
cat > "$PR_BODY_FILE" <<EOF
## What

Adds **STR Scout** to the registry — an MCP server for short-term rental market intelligence.

## Tools exposed

| Tool | Description |
|---|---|
| \`search-listings\` | Search comparable Airbnb listings by city, bedrooms, price, property type |
| \`regulations\` | Local STR regulatory status (permitted/restricted/banned/capped) |
| \`market-analysis\` | Revenue, ADR, occupancy, saturation, comparables, AI summary |
| \`arbitrage-score\` | Score any property address 0-100 for STR conversion viability |

## How to install

\`\`\`json
{
  "mcpServers": {
    "str-scout": {
      "url": "https://ramosss--str-scout.apify.actor/mcp",
      "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" }
    }
  }
}
\`\`\`

Built on the official \`@modelcontextprotocol/sdk\` (StreamableHTTPServerTransport, stateless mode). Same handlers serve REST + MCP + batch.

Live: https://apify.com/ramosss/str-scout

## Disclaimer

Unofficial. Not affiliated with Airbnb Inc.
EOF

api() {
  local method="$1" path="$2"
  shift 2
  curl -s -X "$method" \
    -H "Authorization: Bearer $GITHUB_PAT" \
    -H "Accept: application/vnd.github+json" \
    -H "User-Agent: $UA" \
    "$API$path" "$@"
}

# $1 = upstream owner, $2 = repo, $3 = path to file to modify, $4 = where to insert entry (search-marker text or "EOF")
submit_pr() {
  local UPSTREAM="$1" REPO="$2" FILEPATH="$3" MARKER="$4"

  echo "════ ${UPSTREAM}/${REPO} ═══════════════════════════════════════════"
  echo "→ Forking..."
  api POST "/repos/${UPSTREAM}/${REPO}/forks" >/dev/null
  # Apify forks are async — give it a moment
  sleep 5

  echo "→ Fetching upstream file ${FILEPATH}..."
  local file_json
  file_json=$(api GET "/repos/${UPSTREAM}/${REPO}/contents/${FILEPATH}")
  local sha original_content
  sha=$(echo "$file_json" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("sha",""))' 2>/dev/null || true)
  original_content=$(echo "$file_json" | python3 -c 'import json,sys,base64;d=json.load(sys.stdin);print(base64.b64decode(d.get("content","")).decode())' 2>/dev/null || true)

  if [ -z "$sha" ] || [ -z "$original_content" ]; then
    echo "  ✗ could not read upstream file (path may have changed)"
    echo "    fallback: open this PR manually with content from marketing/registries/"
    return
  fi

  # Insert entry: if MARKER found, insert after it; else append to end
  local new_content
  if [ "$MARKER" = "EOF" ]; then
    new_content="${original_content}"$'\n'"${ENTRY}"$'\n'
  elif echo "$original_content" | grep -q "$MARKER"; then
    new_content=$(echo "$original_content" | awk -v m="$MARKER" -v e="$ENTRY" 'BEGIN{done=0} {print} !done && index($0,m){print e;done=1}')
  else
    new_content="${original_content}"$'\n'"${ENTRY}"$'\n'
  fi

  # Get fork's default branch + base sha (for branch creation)
  local default_branch
  default_branch=$(api GET "/repos/${GITHUB_USER}/${REPO}" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("default_branch",""))' 2>/dev/null || true)
  if [ -z "$default_branch" ]; then
    echo "  ✗ couldn't read fork default branch"
    return
  fi

  local base_sha
  base_sha=$(api GET "/repos/${GITHUB_USER}/${REPO}/git/refs/heads/${default_branch}" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("object",{}).get("sha",""))' 2>/dev/null || true)

  echo "→ Creating branch ${PR_BRANCH} on fork..."
  api POST "/repos/${GITHUB_USER}/${REPO}/git/refs" \
    -d "{\"ref\":\"refs/heads/${PR_BRANCH}\",\"sha\":\"${base_sha}\"}" >/dev/null

  echo "→ Updating file via Contents API..."
  local encoded
  encoded=$(printf '%s' "$new_content" | base64 -w0)
  api PUT "/repos/${GITHUB_USER}/${REPO}/contents/${FILEPATH}" \
    -d "$(printf '{"message":"Add STR Scout MCP server","content":"%s","sha":"%s","branch":"%s"}' "$encoded" "$sha" "$PR_BRANCH")" >/dev/null

  echo "→ Opening PR against upstream..."
  local pr_body
  pr_body=$(python3 -c 'import json,sys;print(json.dumps(open(sys.argv[1]).read()))' "$PR_BODY_FILE")
  local pr_response
  pr_response=$(api POST "/repos/${UPSTREAM}/${REPO}/pulls" \
    -d "$(printf '{"title":"%s","head":"%s:%s","base":"%s","body":%s}' "$PR_TITLE" "$GITHUB_USER" "$PR_BRANCH" "$default_branch" "$pr_body")")
  local pr_url
  pr_url=$(echo "$pr_response" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("html_url",""))' 2>/dev/null || true)

  if [ -n "$pr_url" ]; then
    echo "  ✓ PR opened: ${pr_url}"
  else
    echo "  ✗ PR creation failed"
    echo "    response: ${pr_response:0:400}..."
  fi
  echo
}

# Registry targets — confirm paths at runtime (these are best-known as of v3 plan; verify by trying)
submit_pr "punkpeye"   "awesome-mcp-servers" "README.md" "EOF"
submit_pr "wong2"      "awesome-mcp-servers" "README.md" "EOF"
submit_pr "appcypher"  "awesome-mcp-servers" "README.md" "EOF"

rm -f "$PR_BODY_FILE"

echo
echo "Done. Open each PR URL above in a browser to confirm the entry is correctly placed."
echo "If any registry refused/404'd, fall back to manual submission per the markdown in marketing/registries/."

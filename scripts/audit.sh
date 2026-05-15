#!/usr/bin/env bash
# Pre-publish source-leak audit. Must return zero matches on all three checks
# before pushing to a publish-track build.
set -uo pipefail

cd "$(dirname "$0")/.."

EXIT=0

echo "=== [1/3] Forbidden public terms in user-facing surfaces ==="
# Scans .actor/* (Store listing), public-facing schemas/mcp/http directories, and
# README.md. package.json dependency names (e.g. @google/generative-ai) are
# unavoidable npm package IDs — they're mitigated by the "Hide source files"
# toggle in the Apify Console publish flow, not by renaming.
HITS=$(grep -RniE 'inside.?airbnb|curious_coder|memo23|gemini|google.?generative' \
  .actor/ src/schemas/ src/mcp/ src/http/ README.md 2>/dev/null || true)
# Also check package.json's description and keywords arrays explicitly (cheap & precise)
PKG_DESC_KEYS=$(grep -nE '^\s*"(description|keywords)"' package.json | head -5 || true)
PKG_HITS=$(grep -niE -A 12 '"keywords"\s*:\s*\[' package.json | grep -iE 'inside.?airbnb|curious_coder|memo23|gemini|google.?generative|airdna-alternative' || true)
PKG_DESC_HITS=$(grep -niE '"description".*(inside.?airbnb|curious_coder|memo23|gemini|google.?generative|airdna)' package.json || true)
if [ -n "$HITS" ] || [ -n "$PKG_HITS" ] || [ -n "$PKG_DESC_HITS" ]; then
  [ -n "$HITS" ] && echo "$HITS"
  [ -n "$PKG_HITS" ] && echo "package.json keywords: $PKG_HITS"
  [ -n "$PKG_DESC_HITS" ] && echo "package.json description: $PKG_DESC_HITS"
  EXIT=1
else
  echo "  OK — no leaks (note: package.json deps section excluded; rely on 'Hide source files' toggle)"
fi

echo
echo "=== [2/3] Internal 'source' field leaking into responses ==="
HITS=$(grep -RnE '"source"\s*:\s*"(open-data|live-scrape)"' .actor/ src/http/ src/mcp/ 2>/dev/null || true)
if [ -n "$HITS" ]; then
  echo "$HITS"
  EXIT=1
else
  echo "  OK — no leaks"
fi

echo
echo "=== [3/3] Hardcoded scraper actor IDs outside src/services/apify.ts ==="
HITS=$(grep -RnE '[a-z0-9_]+/airbnb-scraper' . \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git 2>/dev/null \
  | grep -v 'src/services/apify.ts' \
  | grep -v 'pnpm-lock.yaml' \
  | grep -v 'scripts/audit.sh' || true)
if [ -n "$HITS" ]; then
  echo "$HITS"
  EXIT=1
else
  echo "  OK — no leaks"
fi

echo
if [ "$EXIT" -eq 0 ]; then
  echo "AUDIT PASSED"
else
  echo "AUDIT FAILED — fix leaks before pushing to publish-track"
fi
exit "$EXIT"

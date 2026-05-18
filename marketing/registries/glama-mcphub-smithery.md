**Registries:** glama.ai, mcphub.org, smithery.ai, mcpservers.org
**Mode:** GitHub PR where available, Playwright form submit otherwise

---

## Common metadata (use for all)

```yaml
name: STR Scout
slug: str-scout
author: Ramosss
homepage: https://apify.com/ramosss/str-scout
mcp_url: https://ramosss--str-scout.apify.actor/mcp
auth: bearer
auth_header: Authorization
auth_description: Apify API token (get yours free at apify.com)
categories: [real-estate, finance, travel, ai-agents]
tags: [airbnb, str, short-term-rental, market-analysis, arbitrage, regulations, apify, pay-per-call, mcp]
pricing_model: pay-per-event
pricing_details:
  - tool: search-listings
    price_usd: 0.05
  - tool: regulations
    price_usd: 0.10
  - tool: market-analysis
    price_usd: 0.50
  - tool: arbitrage-score
    price_usd: 1.00
tools:
  - name: search-listings
    description: Search comparable short-term rental listings in a city with filters.
  - name: regulations
    description: Local STR regulatory status (permitted/restricted/banned/capped) with license details.
  - name: market-analysis
    description: Full market intelligence report with revenue, ADR, occupancy, saturation, comparables, AI summary.
  - name: arbitrage-score
    description: Score any property address 0-100 for STR conversion viability.
disclaimer: Unofficial. Not affiliated with Airbnb Inc.
```

---

## Per-registry submission method

### glama.ai
- Has `glama-ai/mcp-server-registry` on GitHub (verify at runtime). Submission via PR adding a YAML/JSON file.
- Format: usually one file per server in `servers/` directory.
- Fall back to web form at glama.ai if no repo exists.

### mcphub.org
- GitHub repo: `mcp-club/mcphub` or similar (verify).
- Format: markdown line + screenshot URL.

### smithery.ai
- Has `smithery-ai/smithery` for the registry + a CLI (`smithery install str-scout` after registration).
- Submission: PR to their server registry with `smithery.yaml` config.

### mcpservers.org
- GitHub: `mcpservers/mcpservers.org` (their site is GitHub Pages from this repo).
- Format: markdown entry in `_data/` or similar.

---

**Playwright fallback:**
For any registry where GitHub PR path fails or is unclear, the Playwright script tries the web form submission. Each registry gets a thin script in `marketing/scripts/playwright/submit-<registry>.ts`.

**Screenshot evidence:**
After each submission (PR or form), the script saves a screenshot/PR URL to `marketing/screenshots/<registry>-<timestamp>.png` for your review.

**Registry:** https://mcp.so
**Mode:** Playwright form submit OR GitHub PR (mcp.so has a `chatmcp/mcp-directory` repo)

---

## Fields to fill

**Name:** STR Scout

**Title:** Short-Term Rental Market Intelligence (MCP-native)

**Author:** Ramosss

**Tagline (≤140 chars):** Pay-per-call Airbnb market intelligence + arbitrage scoring for AI agents. 4 tools accessible via MCP, REST, or Apify batch.

**Description (longer, ~500-1000 chars):**
STR Scout exposes 4 tools for short-term rental market intelligence accessible via Model Context Protocol:

- **search-listings** ($0.05/call): comparable Airbnb listings filtered by city/bedrooms/price/property type
- **regulations** ($0.10/call): local STR regulatory status for major cities (permitted, restricted, banned, capped) including license requirements and night caps
- **market-analysis** ($0.50/call): full market report with revenue estimates, ADR percentiles, occupancy modeling, competitive saturation, top comparable listings, and AI-generated investment summary
- **arbitrage-score** ($1.00/call): score any property address 0-100 for STR conversion viability — combines regulatory status, market demand, profitability vs rental cost, and saturation. Returns recommendation (viable/marginal/avoid), projected revenue and net income, break-even occupancy, AI narrative.

Hybrid data layer: curated open-data feeds for ~30 metros + live-scrape fallback for any other city. Pay-per-event billing via Apify.

Unofficial. Not affiliated with Airbnb Inc.

**Repository / URL:** https://apify.com/ramosss/str-scout

**MCP server URL:** https://ramosss--str-scout.apify.actor/mcp

**Category:** Finance / Real Estate / Travel

**Tags:** airbnb, str, real-estate, market-analysis, arbitrage, regulations, mcp, apify, pay-per-call

**Install snippet (Claude Desktop):**

```json
{
  "mcpServers": {
    "str-scout": {
      "url": "https://ramosss--str-scout.apify.actor/mcp",
      "headers": { "Authorization": "Bearer <YOUR_APIFY_TOKEN>" }
    }
  }
}
```

---

**Playwright notes (`submit-mcp-so.ts`):**
- URL: https://mcp.so/submit (or whichever path is current)
- Detect form fields by label or aria-label
- Pre-check: confirm not logged in path — mcp.so may allow guest submissions
- After submit, screenshot the confirmation
- If they require GitHub auth → halt + ask user to provide login cookie OR add a GitHub OAuth callback flow (probably out of scope; fall back to manual)

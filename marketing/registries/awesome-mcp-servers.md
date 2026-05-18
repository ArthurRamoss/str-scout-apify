**Registry:** punkpeye/awesome-mcp-servers (GitHub) + wong2/awesome-mcp-servers
**Mode:** GitHub REST API (fork → add → PR) via `marketing/scripts/mcp-registry-pr.sh`

---

## Markdown line to add (alphabetical sort under "Real Estate" or "Finance & Fintech" or similar category)

```markdown
- [STR Scout](https://apify.com/ramosss/str-scout) - Short-term rental market intelligence for Airbnb/STR investors. Tools: search-listings, regulations lookup, market-analysis, arbitrage-score. Pay-per-call ($0.05-$1.00).
```

If no STR / real-estate / finance category exists, add under "Other / Miscellaneous" or open a discussion proposing the new category.

---

## PR title

```
Add STR Scout — Airbnb market intelligence MCP server
```

## PR body

```markdown
## What

Adds **STR Scout** to the registry — an MCP server for short-term rental market intelligence.

## Tools exposed

| Tool | Description |
|---|---|
| `search-listings` | Search comparable Airbnb listings in a city by bedrooms/price/property type |
| `regulations` | Local STR regulatory status (permitted/restricted/banned/capped) with license details and night caps |
| `market-analysis` | Revenue estimates, ADR percentiles, occupancy modeling, saturation scoring, comparable listings |
| `arbitrage-score` | Score any property address 0-100 for STR conversion viability with projected revenue/net income |

## Why this fits

- First STR-vertical MCP server in the registry (no overlap with existing entries)
- Built on the official `@modelcontextprotocol/sdk` (StreamableHTTPServerTransport, stateless mode)
- Same handlers serve REST + MCP + batch run modes
- Pay-per-event pricing model (per-tool-call billing)

## How to install

Add to `claude_desktop_config.json`:

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

## Verification

`tools/list` returns 4 tools with full input schemas. Each tool returns `{content: [...], structuredContent: {...}}`.

## Disclaimer

Unofficial. Not affiliated with Airbnb Inc. or any third-party platform.
```

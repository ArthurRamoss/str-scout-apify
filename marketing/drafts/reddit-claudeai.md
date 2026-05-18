**Subreddit:** r/ClaudeAI
**Flair:** Project
**Title:** New MCP server for Claude: short-term rental market intelligence (arbitrage score, regulations, comps)

**Body:**

Just published an MCP server that gives Claude superpowers for real estate / Airbnb investing analysis.

**The 4 tools Claude gets:**

| Tool | What it does |
|---|---|
| `search-listings` | Comparable listings in a city by bedrooms/price |
| `regulations` | Local STR legality (NYC restricted, Barcelona banned, Lisbon capped, etc.) |
| `market-analysis` | Revenue/ADR/occupancy/saturation report with comps |
| `arbitrage-score` | Score any address 0-100 for STR conversion viability |

**Try it in 30s:**

Add to `~/.config/claude-desktop/claude_desktop_config.json`:
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

Restart Claude Desktop, then ask:

> "Check if Austin allows short-term rentals, then score 1234 South Congress Ave for STR investment viability"

Claude will chain `regulations` → `arbitrage-score` and explain the result with projected revenue and break-even occupancy.

**Pricing:** pay-per-call, $0.05 (search) → $1.00 (arbitrage). No subscription. Apify handles billing via your existing token.

**Built with:** TypeScript MCP SDK + Apify Standby for the HTTP transport. StreamableHTTPServerTransport stateless mode, per-request transport instance. Same handlers serve REST/MCP/batch.

Source visible on the Store listing if you want to see how MCP+Apify integration is wired up. Genuinely curious what other "agent-native" data tools people would want — drop ideas.

Disclaimer: unofficial Airbnb data aggregation, not affiliated with Airbnb Inc.

**Subreddit:** r/SideProject
**Flair:** Launch
**Title:** I built an MCP-native Airbnb arbitrage scorer — your Claude/Cursor can now evaluate STR investments

**Body:**

Hey r/SideProject 👋

Just shipped **STR Scout** — a pay-per-query Airbnb market intelligence tool that plugs straight into any MCP client (Claude Desktop, Cursor, Cline, Cody, etc).

**What it does (4 tools):**
- `search-listings` — comparable Airbnb listings in a city, filtered by bedrooms/price ($0.05/call)
- `regulations` — local STR legality lookup for major cities (permitted/restricted/banned/capped) ($0.10/call)
- `market-analysis` — full report: revenue estimates, ADR percentiles, occupancy, saturation, comps + AI summary ($0.50/call)
- `arbitrage-score` — score any address 0-100 for STR viability, with projected net income and break-even occupancy ($1.00/call)

**Why I built it:** the existing players (won't name names, but they charge $200-1000/month per market) priced themselves so devs and small-time investors couldn't touch the data. I wanted something agents could call ad-hoc.

**The MCP angle:** add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "str-scout": {
      "url": "https://ramosss--str-scout.apify.actor/mcp",
      "headers": { "Authorization": "Bearer <your-apify-token>" }
    }
  }
}
```

Then ask Claude "score 1234 South Congress in Austin for STR viability" and it'll run the full analysis (regulations check + market comps + arbitrage scoring) and explain it.

**Tech stack:** TypeScript + Apify Standby + StreamableHTTPServerTransport. Hybrid data: free open-data feeds for major metros, live-scrape fallback for everywhere else. Three surfaces (REST/MCP/Batch) sharing one set of handlers.

Live on the Apify Store: https://apify.com/ramosss/str-scout

Happy to answer technical questions or "why this not that" trade-off questions in the comments. Disclaimer obrigatório: unofficial, not affiliated with Airbnb.

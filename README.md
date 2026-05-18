# STR Scout

Short-term rental market intelligence with regulations lookup, market analysis, and arbitrage scoring. Pay-per-call. MCP-native.

🔗 **Live on Apify Store:** https://apify.com/ramosss/str-scout
🌐 **Landing page:** https://str-scout.vercel.app

> ⚠️ **Unofficial.** Not affiliated with Airbnb Inc. or any third-party platform.

---

## Try it now

### As an MCP server (Claude Desktop, Cursor, Cline)

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

Restart your client. Ask: *"Score 1234 South Congress, Austin TX for STR investment viability."*

### As a REST API

```bash
curl -X POST https://ramosss--str-scout.apify.actor/regulations \
  -H "Authorization: Bearer $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"city":"Austin","state":"TX"}'
```

### Discover the surface

```bash
curl https://ramosss--str-scout.apify.actor/tools          # tool catalog with JSON Schemas
curl https://ramosss--str-scout.apify.actor/openapi.json   # OpenAPI 3.1 spec
curl https://ramosss--str-scout.apify.actor/health
```

---

## Tools and pricing

| Tool | Event | Price | Use case |
|---|---|---|---|
| `search-listings` | `tool-call-search-listings` | $0.05 | Comparable listings discovery |
| `regulations` | `tool-call-regulations` | $0.10 | City legality lookup (kills bad deals fast) |
| `market-analysis` | `tool-call-market-analysis` | $0.50 | Full market report — revenue, ADR, occupancy, saturation, AI summary |
| `arbitrage-score` ⭐ | `tool-call-arbitrage-score` | $1.00 | Score property address (0-100) for STR viability |

Pricing is pay-per-event. Apify handles billing.

---

## Architecture

```
Standby HTTP server (Express on ACTOR_STANDBY_PORT)
├── GET  /health, /tools, /openapi.json        (discovery)
├── POST /search-listings    ──┐
├── POST /market-analysis    ──┤  shared handlers
├── POST /arbitrage-score    ──┤  (charge → validate → run)
├── POST /regulations        ──┘
└── POST /mcp                  (StreamableHTTPServerTransport, stateless)

Batch mode (Apify Console "Run" button)
└── reads INPUT_SCHEMA → handleMarketAnalysis → pushData → exit
```

Same handlers serve all three surfaces. `Actor.charge()` runs at the top of each handler before any work happens.

---

## Development

```bash
pnpm install
cp .env.example .env  # fill APIFY_TOKEN and the AI provider key
pnpm run build
pnpm run dev          # tsx watch on src/server.ts
```

Local smoke tests:
```bash
curl localhost:3000/health
curl localhost:3000/tools
curl -X POST localhost:3000/regulations -H 'content-type: application/json' -d '{"city":"Austin","state":"TX"}'
```

Pre-publish audit (catches public-surface leaks of internal data-source names):
```bash
pnpm run audit
```

---

## Coverage

- **Open-data:** ~30 metros (US, Europe, Asia-Pacific, LatAm). See `src/data/cities.json`.
- **Live-scrape fallback:** any other city (slower cold start ~30s).
- **Regulations:** 10 cities curated (NYC, SF, LA, Austin, Nashville, Miami Beach, Lisbon, Barcelona, Paris, London). Quarterly refresh.

---

## Disclaimer

STR Scout aggregates publicly available data and analytical estimates. Output is informational only and does not constitute investment, legal, or tax advice. Regulatory data may be out of date — verify with local jurisdiction before transacting. **Unofficial.** Not affiliated with Airbnb Inc. or any third-party platform.

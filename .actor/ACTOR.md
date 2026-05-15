# STR Scout — Short-Term Rental Market Intelligence

Short-term rental market intelligence with **4 tools** accessible via **MCP**, **REST**, or batch run. Built for STR investors, hosts, property managers, and AI agents that need market data on demand.

## What you get

- **Search comparable listings** by city with bedroom/price/property-type filters
- **Local regulation lookup** — permitted, restricted, banned, or capped, plus license requirements and night caps
- **Full market analysis** — revenue estimates, ADR percentiles, occupancy, saturation scoring, amenity gaps, comparables, and AI investment summary
- **Arbitrage score** for a specific address (0-100) with regulation-aware viability recommendation, projected net income, and break-even occupancy

## Disclaimer

> STR Scout aggregates publicly available data and analytical estimates. Output is informational only and does not constitute investment, legal, or tax advice. Regulatory data may be out of date — verify with the local jurisdiction before transacting. STR Scout is not affiliated with, endorsed by, or sponsored by Airbnb, Inc., or any third-party platform.

## Tools and pricing

| Tool | Price per call | Use case |
|---|---|---|
| `search-listings` | $0.05 | Discover comparable listings in a city |
| `regulations` | $0.10 | Check whether a city allows STR (kills bad deals fast) |
| `market-analysis` | $0.50 | Full market report — revenue, ADR, occupancy, saturation, AI summary |
| `arbitrage-score` | $1.00 | Score a property address (0-100) for STR viability |

Pricing is **pay-per-event**. You are only charged when a tool successfully starts; failed validations and platform errors are not billed at the tool rate.

## Use from an MCP client (Claude Desktop, Cursor, Cline, etc.)

```json
{
  "mcpServers": {
    "str-scout": {
      "url": "https://<your-actor-standby-url>/mcp",
      "headers": { "Authorization": "Bearer <your-apify-token>" }
    }
  }
}
```

Once connected, the four tools appear in your client's tool palette. Use them like:

> "Use str-scout to look up the regulations for Austin, then run a market analysis for 2-bedroom entire homes there."

## Use from REST / curl

```bash
curl -X POST https://<your-actor-standby-url>/market-analysis \
  -H "Authorization: Bearer $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location":"Austin, TX","bedrooms":2}'
```

Discover the available tool surface at `GET /tools` and the OpenAPI spec at `GET /openapi.json`.

## Use as a one-shot Apify run (batch mode)

Click **Start** with the default input, or override `location`, `propertyType`, `bedrooms`. The market analysis is pushed to the run's default dataset.

```json
{ "location": "Lisbon", "propertyType": "entire_home", "bedrooms": 2 }
```

## Output (market-analysis example)

```json
{
  "location": "Lisbon",
  "dataFreshness": "cached_48h",
  "totalListingsAnalyzed": 1247,
  "filteredListings": 421,
  "revenueEstimate": { "lowEstimate": 28400, "midEstimate": 41200, "highEstimate": 56800, "confidenceLevel": "high" },
  "averageDailyRate": { "median": 142, "percentile25": 98, "percentile75": 198 },
  "occupancyEstimate": { "estimatedRate": 0.72, "confidenceLevel": "high" },
  "competitiveSaturation": { "score": 62, "label": "competitive", "totalListings": 1247 },
  "topComparables": [ "..." ],
  "investmentSummary": "Lisbon shows competitive but profitable conditions..."
}
```

## Output (arbitrage-score example)

```json
{
  "address": "Rua de São Bento 100, Lisbon",
  "city": "Lisbon",
  "score": {
    "total": 64,
    "subscores": { "regulation": 60, "demand": 72, "profitability": 58, "saturation": 38 },
    "projectedAnnualRevenue": 36800,
    "projectedNetIncome": 12400,
    "breakEvenOccupancy": 0.51,
    "recommendation": "marginal",
    "warnings": ["Lisbon AL containment zones suspend new licenses in central districts."]
  },
  "narrative": "Score 64/100 (marginal). Lisbon's AL framework allows operation outside containment zones..."
}
```

## Coverage

- **Open-data feeds** — ~30 metros across North America, Europe, and Asia-Pacific (Austin, NYC, LA, SF, Boston, Chicago, Lisbon, Porto, Barcelona, Madrid, Paris, London, Berlin, Amsterdam, Rome, Milan, Athens, Sydney, Melbourne, Mexico City, Buenos Aires, Rio, Vienna, Copenhagen, Edinburgh, Asheville, Denver, San Diego, Seattle, Nashville, and more)
- **Live market scrape fallback** — any other city, slower cold start (5-30s on first request)
- **Regulatory data** — 10 cities in v1 (NYC, SF, LA, Austin, Nashville, Miami Beach, Lisbon, Barcelona, Paris, London); other cities return `unknown`

## Limits and known issues

- Amenity-gap analysis is reduced for cities served by open-data feeds (the open feed doesn't carry amenity arrays)
- First request to a new city has 5-30s cold start while data loads; subsequent requests are sub-second
- Regulations data is hand-curated and refreshed quarterly — always verify with local jurisdiction before transacting
- ADR/occupancy estimates use a review-velocity model with assumed 60% review rate and 3.5-night average stay; actual performance varies

## Support

Issues, feature requests, or city additions: contact via Apify Console messaging.

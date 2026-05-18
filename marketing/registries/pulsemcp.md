**Registry:** https://www.pulsemcp.com
**Mode:** Playwright form submit at `/submit-server` or similar

---

## Fields

**Server name:** STR Scout

**Author/Organization:** Ramosss (Apify)

**Description (short):** Short-term rental market intelligence with regulations lookup, market analysis, and arbitrage scoring — accessible via MCP/REST/batch.

**Description (long):**

STR Scout is an MCP-native short-term rental market intelligence tool. It exposes 4 tools accessible via Model Context Protocol over StreamableHTTPServerTransport:

1. `search-listings` — Search comparable Airbnb listings by city, bedrooms, price range, property type. Returns up to 100 compact listing records ($0.05/call).
2. `regulations` — Local STR regulatory status lookup for 10+ major cities including license requirements and night caps ($0.10/call).
3. `market-analysis` — Comprehensive market report: revenue estimates with confidence intervals, ADR percentiles, occupancy modeling, competitive saturation scoring, amenity gap analysis, top comparables, and AI investment summary ($0.50/call).
4. `arbitrage-score` — Score any property address 0-100 for STR viability, combining regulation status, market demand, profitability vs rental cost, and saturation. Returns viability recommendation, projected revenue and net income, break-even occupancy, AI narrative ($1.00/call).

**Built on:** TypeScript MCP SDK 1.29.0, deployed as Apify Standby Actor with hybrid data source (curated open-data feeds + live-scrape fallback).

**Pricing model:** Pay-per-event (pay-per-call). No subscription.

**Repository:** https://apify.com/ramosss/str-scout

**MCP endpoint URL:** https://ramosss--str-scout.apify.actor/mcp

**Authentication:** Bearer token (Apify API token; users get their own free at apify.com)

**Tags / Keywords:** airbnb, short-term-rental, str, real-estate, market-analysis, arbitrage, regulations, mcp, apify, pay-per-call

**License:** Proprietary (free to use the tool, code source visible via Apify Store)

**Categories:** Real estate, Finance, Travel, AI Agents

**Unofficial disclaimer:** Not affiliated with Airbnb Inc.

---

**Playwright notes:**
- pulsemcp.com is built with Next.js — form submit likely a `/api/...` POST under the hood
- If anti-spam (Cloudflare Turnstile or hCaptcha), halt and fall back to manual paste

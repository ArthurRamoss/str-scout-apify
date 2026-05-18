**Channel:** Hacker News (Show HN)
**Trigger:** ONLY post after 1st non-creator paid run lands. HN without traction = thread dies, hard to repost. Wait for signal.
**Mode:** Manual submission at https://news.ycombinator.com/submit (no API by design)

---

**Title (≤80 chars):**

Show HN: STR Scout – Airbnb arbitrage scoring as an MCP server (pay-per-call)

**URL field:**

https://apify.com/ramosss/str-scout

**Text field (optional but recommended for Show HN):**

I built STR Scout to scratch a personal itch: existing short-term rental analytics tools want $200-1000/month subscriptions, which is overkill for someone evaluating a few properties a quarter.

Pay-per-event pricing, 4 tools:
- search-listings ($0.05): comparable Airbnb listings filtered by city/bedrooms/price
- regulations ($0.10): local STR legality lookup (NYC restricted, Barcelona banned, etc.)
- market-analysis ($0.50): revenue/ADR/occupancy/saturation report with comps
- arbitrage-score ($1.00): score any address 0-100 for STR viability — combines regulation status + market demand + profitability vs rental cost + saturation

The MCP angle is the differentiator. The same handlers serve REST, batch runs, AND Model Context Protocol — so Claude Desktop / Cursor / Cline can call STR Scout as a tool. To my knowledge it's the first STR-vertical MCP server on a major distribution platform.

Tech: TypeScript MCP SDK 1.29, StreamableHTTPServerTransport in stateless mode (new transport per request), Apify Standby for the HTTP container. Hybrid data layer — free open-data feeds for ~30 metros, live-scrape fallback for everywhere else. Single Actor.charge() per tool call before doing work.

Margins per call: ~80% net on the open-data path, ~50% net on the fallback path. The hybrid is what makes pay-per-call work at these price points.

Live demo from your terminal:
```
curl -X POST https://ramosss--str-scout.apify.actor/regulations \
  -H "Authorization: Bearer $APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"city":"Austin","state":"TX"}'
```

Happy to dig into the engineering trade-offs (why I picked Apify Standby over my own Cloud Run, why MCP stateless transport, how the dual REST+MCP routing works). Unofficial — not affiliated with Airbnb Inc.

---

**First-comment draft (post immediately after the submission):**

> Quick technical detail I didn't fit in the description: every chargeable handler does `await Actor.charge({ eventName: 'tool-call-X' })` BEFORE validation. This means even invalid inputs from buyers trigger the bill, which felt counterintuitive at first, but the alternative ("only bill on success") creates a tunneling incentive for bad actors to send junk inputs and waste compute for free. PPE billing semantics are "the tool was called," not "the tool returned successfully." Stripe-style.

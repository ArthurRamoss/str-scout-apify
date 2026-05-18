**Channel:** Twitter/X
**Posting mode:** 8-tweet thread, your account
**Author tone:** founder shipping receipt, mix of value + numbers + light flex

---

**Tweet 1 (hook):**

i built an Airbnb arbitrage scorer that runs inside Claude/Cursor

ask it: "score 1234 South Congress, Austin TX for STR"

it chains:
→ regulations check
→ market analysis
→ ROI projection

returns a 0-100 viability score in 15 seconds, costs $1

🧵 how + why ↓

---

**Tweet 2:**

incumbents in this space (won't name) charge $200-1000/month per market

ARPU breaks if a real investor only checks 4-5 properties a quarter

so i built pay-per-call

$0.05 for search, $0.10 regulations check, $0.50 full market, $1.00 arbitrage score per address

---

**Tweet 3:**

the MCP angle is the moat

Model Context Protocol = how Claude Desktop, Cursor, Cline talk to external tools

every dev building real estate agents needs data tools

incumbents have zero MCP presence — i'm first to STR data in this channel

---

**Tweet 4 (demo):**

drop this in claude_desktop_config.json:

```json
{
  "mcpServers": {
    "str-scout": {
      "url": "https://ramosss--str-scout.apify.actor/mcp",
      "headers": { "Authorization": "Bearer <APIFY_TOKEN>" }
    }
  }
}
```

restart. ask Claude to evaluate any address. done.

---

**Tweet 5 (real output):**

example: 2BR on South Congress, Austin (long-term rent $2800)

→ score: 41/100 → AVOID
→ projected net: -$22,406/yr
→ break-even occupancy: 55%
→ market median: 24%

regulation: permitted, but saturation killed it

honest numbers, not vibe-based

---

**Tweet 6 (tech for builders):**

stack:
- TypeScript MCP SDK
- Apify Standby (HTTP + container)
- StreamableHTTPServerTransport (stateless)
- one set of handlers serves REST + MCP + batch

3 surfaces, 1 codebase. each tool charges via Actor.charge() before running

---

**Tweet 7 (the hybrid data layer):**

economics only work because of the hybrid:

→ ~30 metros: free open-data feeds (low marginal cost)
→ everywhere else: live-scrape fallback (slower, costs cents)

margin per call: ~80% on the open-data path, ~50% on fallback. averages to ship-able

---

**Tweet 8 (CTA):**

https://apify.com/ramosss/str-scout

free to install
pay only when you query
billed by Apify, not me

if you're a dev: try the MCP integration, tell me what's broken
if you're a host: regulations check is $0.10, see what your city allows

unofficial. not affiliated with Airbnb Inc.

---

**Notes for posting via API:**
- Use Twitter v2 API endpoint: POST /2/tweets
- Chain via `reply.in_reply_to_tweet_id` (returned tweet id from previous post)
- Free tier: 500 writes/month, way more than enough
- If thread is rejected for any reason (rate limit, content), the script saves where it failed and you can resume from that tweet manually

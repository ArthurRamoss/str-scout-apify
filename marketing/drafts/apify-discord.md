**Channel:** Apify Discord → #announcements (or #creators if no #announcements)
**Mode:** Manual paste (you click + paste, ~30 seconds)

---

🎉 New Actor live: **STR Scout** — short-term rental market intelligence with arbitrage scoring

Pay-per-event pricing, 4 tools accessible via REST + MCP + Standby:
• `search-listings` ($0.05)
• `regulations` ($0.10)
• `market-analysis` ($0.50)
• `arbitrage-score` ($1.00) — primary, scores any address 0-100 for STR viability

Tech: TypeScript MCP SDK on Apify Standby + StreamableHTTPServerTransport (stateless, per-request transport). One handler set serves REST/MCP/batch.

The MCP angle is the novel bit — Claude Desktop / Cursor / Cline can call this directly. First STR-vertical MCP server I'm aware of on the Store.

👉 https://apify.com/ramosss/str-scout

Feedback welcome, especially "what tool would you add next" from anyone building agent stacks. Unofficial Airbnb data; not affiliated with Airbnb Inc.

---

**Why I'm not automating this:**
Discord allows webhooks only on YOUR OWN servers. Apify's server doesn't expose a webhook for #announcements (members post manually). 30 seconds of your time.

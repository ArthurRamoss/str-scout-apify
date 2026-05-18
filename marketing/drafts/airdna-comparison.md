**Channel:** Comparative content (Reddit + blog comments + Quora + owned page)
**Mode:** Playwright for comments, owned landing page section, Reddit API for posts

---

## Owned landing page section: "/vs-airdna"

Pra hospedar no `str-scout.vercel.app/vs-airdna`. Captura busca "AirDNA alternative" no Google.

**Title:** STR Scout vs AirDNA — when each tool makes sense

**Sections:**

### TL;DR

If you're a property manager with 50+ active listings and need continuous market monitoring, AirDNA's monthly subscription is probably worth it. If you're an investor evaluating a few properties a quarter, or a developer building real-estate AI agents, STR Scout's pay-per-call pricing saves you 80-95% per use case.

### Pricing comparison

| Use case | AirDNA estimated cost | STR Scout cost |
|---|---|---|
| Evaluate 1 property | Monthly subscription $200+ | $1.00 (arbitrage-score) |
| Check 1 city's regulations | Monthly subscription $200+ | $0.10 |
| Compare 5 properties in different cities | Monthly subscription $200-1,000 | $5.00 |
| Building an AI agent that needs STR data | No public MCP/API | $0.05-$1.00 per call |
| Continuous tracking of 50 listings | Monthly subscription $300+ | $0.50-$2.50/day (pay-per-call adds up — AirDNA may be cheaper here) |

### Feature comparison

| Feature | AirDNA | STR Scout |
|---|---|---|
| Market analysis | ✅ Comprehensive | ✅ ADR/occupancy/saturation/comps + AI summary |
| Regulatory data | ⚠️ Limited | ✅ 10 cities curated, expanding |
| Arbitrage scoring (address-level) | ❌ | ✅ 0-100 with viability recommendation |
| MCP integration | ❌ | ✅ Native — works with Claude/Cursor/Cline |
| REST API | ✅ Paid tier | ✅ Pay-per-call |
| Pricing model | Monthly subscription | Pay-per-event |
| Free trial | Limited | Run the regulations check ($0.10) — no commitment |

### When AirDNA wins

- You manage 50+ active listings and need continuous performance monitoring
- You're a hospitality investment fund evaluating dozens of markets simultaneously
- Your team workflow is already tied to AirDNA dashboards

### When STR Scout wins

- You evaluate properties episodically (a few times per quarter)
- You're a solo investor who can't justify a $200+/month subscription
- You're a developer building agent-native real-estate tools (MCP is unique)
- You need fast regulatory lookups across multiple cities
- You want the arbitrage-score (address-level viability scoring isn't AirDNA's product shape)

### Honest limitations

STR Scout's occupancy model reports the *median operator* — a competently-managed listing typically achieves 50-100% higher occupancy. We'll be exposing P25/P50/P75 scenarios in v1.1 for better decision-making.

Open-data coverage is ~30 metros. Cities outside this set fall back to a slower live-scrape (5-30s cold start vs sub-100ms warm).

Regulatory data is hand-curated and refreshed quarterly. Always verify with local jurisdiction before transacting.

### Try STR Scout

The regulations check is $0.10 — less than a coffee. Run it on a city you're considering: https://apify.com/ramosss/str-scout

Disclaimer: Unofficial. Not affiliated with Airbnb Inc. or AirDNA, LLC. AirDNA® is a registered trademark of AirDNA, LLC. This page is comparative analysis only.

---

## Reddit thread targeting

Search Reddit for these query patterns and reply to each thread (~10-20 results combined). Use Reddit API:

- `"AirDNA alternative"`
- `"AirDNA worth it"`
- `"AirDNA pricing"`
- `"Mashvisor vs AirDNA"`
- `"STR data tool cheaper"`
- `"AirDNA free"`

**Reply template (vary phrasing per thread):**

> Recently built a pay-per-call alternative for exactly this use case — STR Scout at apify.com/ramosss/str-scout. Pricing is $0.05-$1.00 per query depending on which tool. Mostly useful if you evaluate properties episodically rather than continuously. The arbitrage-score ($1.00 per address) is the unique thing — AirDNA doesn't do address-level viability scoring as a single output. Honest disclosure: I built it, and it's unofficial (not affiliated with AirDNA or Airbnb). Happy to answer questions about coverage and methodology.

---

## Quora answer template

For questions like "what are AirDNA alternatives", "cheap STR analytics", "best Airbnb research tool":

> A few alternatives worth considering depending on use case:
>
> **Mashvisor** — Comprehensive but also subscription-based ($17-$67/mo)
> **STR Scout** — Pay-per-call ($0.05-$1.00 per query); useful if you don't need continuous monitoring. Has an arbitrage-score tool that scores any address 0-100 for STR viability. Also exposes data via MCP for AI agents (Claude/Cursor). apify.com/ramosss/str-scout
> **Roll your own** — Several open-data municipal feeds exist; works if you have SQL/Python skills and time to clean the data
>
> Disclosure: I built STR Scout. It's unofficial, not affiliated with AirDNA or Airbnb.

---

**Playwright notes (`airdna-blog-comment.ts`):**
- Find recent AirDNA blog posts where comments are open (likely on Disqus)
- For each post: load page, find Disqus iframe, log in as you (via cookie), submit comment
- Comments should be value-adding, not promotional spam. Use only on posts where the alternative-tool angle is genuinely relevant
- Risk: AirDNA mods may delete promo comments. Track which survive

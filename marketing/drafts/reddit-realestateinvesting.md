**Subreddit:** r/realestateinvesting
**Flair:** New Investor
**Title:** Built a $1-per-query alternative to subscription STR analytics tools — sharing it free for feedback

**Body:**

Long-time lurker, first STR-focused investor. Tired of paying $200+/month for market data tools just to evaluate a handful of properties a quarter, so I built my own.

**The problem:** Most STR analytics tools want a subscription. If you're vetting 5 properties a quarter you're paying $40 each. Real cost is closer to a dollar of compute.

**What I built:** STR Scout — pay $1 to score any property address (0-100) for STR conversion viability. It checks:
- Local regulations (does this city even ALLOW non-owner-occupied STR? big filter)
- Market demand (ADR, occupancy from real comps)
- Profitability (projected revenue vs. long-term rent + ops cost)
- Saturation (oversupplied markets ramp slow)

Then gives you a recommendation: viable / marginal / avoid. With break-even occupancy and projected net income.

**Example real output for a hypothetical 2BR on South Congress, Austin TX (long-term rent $2800):**
> Score: 41/100 → AVOID
> Projected net income: -$22,406/yr
> Break-even occupancy: 55% (market only sustains 24% median)
> Regulation: permitted (Type 2 license, $788/yr)
> *"Despite favorable regulations, market saturation at 61/100 means achieving above-median occupancy requires aggressive optimization. Break-even occupancy 55% is well above the 24% market median."*

**Coverage:** ~30 metros with curated open-data feeds (US: Austin, NYC, LA, SF, Boston, Chicago, Nashville, Seattle, etc; international: Lisbon, Barcelona, Paris, London, Berlin, Rome, Sydney). Cities outside the list fall back to a slower live-scrape.

**Limitations (honest):** the median operator's occupancy is what gets reported. A well-managed listing (P75) does 1.5-2x the median. The score is calibrated for "if you operate like the median host" — competent operators should mentally adjust upward.

Live on Apify Store: https://apify.com/ramosss/str-scout

Run the regulation check (it's $0.10) for any city you're considering, results are immediate. Genuinely interested in feedback from people who've used the paid tools — what's missing here that you'd want?

Unofficial, not affiliated with Airbnb or any STR data vendor.

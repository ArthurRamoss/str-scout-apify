# STR Scout — Airbnb Market Analyzer

**The AirDNA alternative at pay-per-query pricing.** Analyze any Airbnb short-term rental market in seconds instead of paying $250+/month for a subscription.

## What it does

STR Scout scrapes live Airbnb listings for any location and runs a full investment-grade market analysis:

- **Revenue Estimation** — Annual revenue projections with confidence intervals (low / mid / high) based on comparable listings
- **Average Daily Rate (ADR)** — Median, 25th, and 75th percentile nightly rates so you know where to price
- **Occupancy Modeling** — Estimated occupancy rates derived from review velocity analysis (no guesswork)
- **Competitive Saturation Scoring** — A 0-100 score telling you if the market is undersupplied, balanced, competitive, or oversaturated
- **Amenity Gap Detection** — Identifies amenities that top-performing listings have but the average listing doesn't, revealing the highest-ROI upgrades
- **AI Investment Summary** — A Gemini-powered narrative summarizing key takeaways and investment recommendation
- **Top Comparables** — The 5 most relevant comparable listings with pricing, ratings, and links

## Who is this for?

| Use Case | How STR Scout Helps |
|---|---|
| **Real estate investors** | Evaluate STR income potential before buying a property |
| **Airbnb hosts** | Benchmark your pricing against the local market |
| **Property managers** | Identify amenity gaps and optimize listings for more bookings |
| **Market researchers** | Get structured market data without expensive subscriptions |

## How to use

### Batch Mode (Standard Apify Run)

Set the input with a `location` (required) and optional filters, then run the Actor. Results are pushed to the default dataset.

**Example input:**
```json
{
    "location": "Austin, TX",
    "propertyType": "entire_home",
    "bedrooms": 2
}
```

### Standby Mode (HTTP API)

The Actor also supports standby mode for low-latency HTTP requests:

```bash
curl -X POST https://your-actor-standby-url/ \
  -H "Content-Type: application/json" \
  -d '{"location": "Miami Beach, FL", "propertyType": "entire_home"}'
```

## Output

Each run produces a structured JSON object with:

| Field | Description |
|---|---|
| `location` | The analyzed market |
| `dataFreshness` | Whether data is live or cached |
| `totalListingsAnalyzed` | Number of Airbnb listings scraped |
| `filteredListings` | Listings matching your property type / bedroom filters |
| `revenueEstimate` | Low, mid, high annual revenue with confidence level |
| `averageDailyRate` | Median and percentile ADR |
| `occupancyEstimate` | Estimated occupancy rate and methodology |
| `competitiveSaturation` | Score (0-100), label, listing count, avg rating |
| `amenityGapAnalysis` | Top performer amenities + recommended additions |
| `topComparables` | 5 best comparable listings with links |
| `investmentSummary` | AI-generated narrative summary |

## Pricing

This Actor uses **pay-per-event** pricing. You are charged per successful market analysis. Check the Actor's pricing tab for current rates.

## Input parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `location` | string | ✅ | — | City, neighborhood, or address to analyze |
| `propertyType` | string | — | `entire_home` | `entire_home`, `private_room`, or `any` |
| `bedrooms` | integer | — | all | Number of bedrooms (0 = studio) |
| `checkIn` | string | — | — | Check-in date (YYYY-MM-DD) for seasonal analysis |
| `checkOut` | string | — | — | Check-out date (YYYY-MM-DD) for seasonal analysis |
| `currency` | string | — | `USD` | Currency code |
| `maxResults` | integer | — | `50` | Max listings to scrape (10-200) |

## Data sources

- **Listings data**: Scraped from Airbnb via the [curious_coder/airbnb-scraper](https://apify.com/curious_coder/airbnb-scraper) Apify Actor
- **AI summaries**: Generated with Google Gemini
- **Caching**: Results are cached to reduce costs on repeated queries for the same location

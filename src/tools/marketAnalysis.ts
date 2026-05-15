import { Actor } from "apify";
import { z } from "zod";
import type { MarketAnalysis } from "../types/index.js";
import { getListings } from "../services/dataSource.js";
import { analyzeMarketData } from "../services/analysis.js";
import { generateInvestmentSummary } from "../services/gemini.js";
import { marketAnalysisSchema } from "../schemas/index.js";

export type MarketAnalysisInput = z.infer<typeof marketAnalysisSchema>;

export interface ToolResponse<T> {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: T;
}

// Chargeless internal — used by arbitrage-score and the chargeable shell.
export async function runMarketAnalysisInternal(
  input: MarketAnalysisInput,
): Promise<MarketAnalysis> {
  const { location, propertyType, bedrooms, checkIn, checkOut } = input;

  const { listings, dataFreshness, cachedAt, amenityDataAvailable } = await getListings({
    location,
    minBedrooms: bedrooms,
    checkIn,
    checkOut,
    propertyType,
  });

  if (listings.length === 0) {
    throw new Error(
      `No listings found for "${location}". Try a different location or broader filters.`,
    );
  }

  const { filtered, revenue, adr, occupancy, saturation, amenityGap, comparables } =
    analyzeMarketData(listings, propertyType);

  const partial: Omit<MarketAnalysis, "investmentSummary"> = {
    location,
    dataFreshness,
    cachedAt,
    totalListingsAnalyzed: listings.length,
    filteredListings: filtered.length,
    amenityDataAvailable,
    revenueEstimate: revenue,
    averageDailyRate: adr,
    occupancyEstimate: occupancy,
    competitiveSaturation: saturation,
    amenityGapAnalysis: amenityGap,
    topComparables: comparables,
  };

  let investmentSummary: string;
  try {
    investmentSummary = await generateInvestmentSummary(partial);
  } catch (err: any) {
    console.warn(`[marketAnalysis] AI summary failed, using fallback: ${err.message}`);
    investmentSummary = buildFallbackSummary(partial);
  }

  return { ...partial, investmentSummary };
}

export async function handleMarketAnalysis(
  args: unknown,
): Promise<ToolResponse<MarketAnalysis>> {
  try {
    await Actor.charge({ eventName: "tool-call-market-analysis" });
  } catch (err: any) {
    console.error(`[charge] failed but continuing: ${err.message}`);
  }
  const input = marketAnalysisSchema.parse(args);
  const result = await runMarketAnalysisInternal(input);
  return {
    content: [{ type: "text", text: formatTextSummary(result) }],
    structuredContent: result,
  };
}

function buildFallbackSummary(data: Omit<MarketAnalysis, "investmentSummary">): string {
  const { revenueEstimate: r, competitiveSaturation: s, averageDailyRate: a } = data;
  return `The ${data.location} STR market shows ${s.label} conditions with ${data.filteredListings} comparable listings. Estimated annual revenue ranges $${r.lowEstimate.toLocaleString()}-$${r.highEstimate.toLocaleString()} at a median ADR of $${a.median}/night (${r.confidenceLevel} confidence).`;
}

function formatTextSummary(d: MarketAnalysis): string {
  return `STR Market Analysis — ${d.location}

${d.investmentSummary}

Key metrics:
- Revenue: $${d.revenueEstimate.lowEstimate.toLocaleString()}–$${d.revenueEstimate.highEstimate.toLocaleString()}/yr (${d.revenueEstimate.confidenceLevel})
- ADR median: $${d.averageDailyRate.median}/night (P25 $${d.averageDailyRate.percentile25} – P75 $${d.averageDailyRate.percentile75})
- Occupancy: ${(d.occupancyEstimate.estimatedRate * 100).toFixed(0)}%
- Saturation: ${d.competitiveSaturation.label} (${d.competitiveSaturation.score}/100)
- Listings: ${d.filteredListings}/${d.totalListingsAnalyzed}
- Data: ${d.dataFreshness}${d.cachedAt ? ` (cached ${d.cachedAt})` : ""}${d.amenityDataAvailable ? "" : " — amenity-gap analysis limited for this market"}`;
}

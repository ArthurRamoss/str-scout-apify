import { Actor } from "apify";
import { z } from "zod";
import type { ArbitrageReport } from "../types/index.js";
import { arbitrageScoreSchema } from "../schemas/index.js";
import { runMarketAnalysisInternal } from "./marketAnalysis.js";
import { lookupRegulation } from "./regulations.js";
import { computeArbitrageScore } from "../services/scoring.js";
import { generateArbitrageNarrative } from "../services/gemini.js";
import type { ToolResponse } from "./marketAnalysis.js";

export type ArbitrageScoreInput = z.infer<typeof arbitrageScoreSchema>;

export async function handleArbitrageScore(
  args: unknown,
): Promise<ToolResponse<ArbitrageReport>> {
  try {
    await Actor.charge({ eventName: "tool-call-arbitrage-score" });
  } catch (err: any) {
    console.error(`[charge] failed but continuing: ${err.message}`);
  }
  const input = arbitrageScoreSchema.parse(args);

  const regulations = lookupRegulation({ city: input.city, country: "US" });

  const market = await runMarketAnalysisInternal({
    location: input.city,
    propertyType: input.propertyType,
    bedrooms: input.bedrooms,
  });

  const score = computeArbitrageScore({
    regulations,
    market,
    monthlyRent: input.monthlyRent,
  });

  let narrative: string;
  try {
    narrative = await generateArbitrageNarrative({
      address: input.address,
      city: input.city,
      score,
      regulationStatus: regulations?.status ?? "unknown",
      marketSnapshot: {
        medianAdr: market.averageDailyRate.median,
        estimatedOccupancy: market.occupancyEstimate.estimatedRate,
        saturationLabel: market.competitiveSaturation.label,
      },
    });
  } catch (err: any) {
    console.warn(`[arbitrageScore] narrative failed, using fallback: ${err.message}`);
    narrative = `Score ${score.total}/100 (${score.recommendation}). Projected $${score.projectedAnnualRevenue.toLocaleString()}/yr gross, $${score.projectedNetIncome.toLocaleString()}/yr net at ${(market.occupancyEstimate.estimatedRate * 100).toFixed(0)}% occupancy. Break-even occupancy: ${(score.breakEvenOccupancy * 100).toFixed(0)}%.`;
  }

  const report: ArbitrageReport = {
    address: input.address,
    city: input.city,
    score,
    narrative,
    marketSnapshot: {
      medianAdr: market.averageDailyRate.median,
      estimatedOccupancy: market.occupancyEstimate.estimatedRate,
      saturationLabel: market.competitiveSaturation.label,
      listingsAnalyzed: market.filteredListings,
    },
    regulationStatus: regulations?.status ?? "unknown",
  };

  return {
    content: [{ type: "text", text: narrative }],
    structuredContent: report,
  };
}

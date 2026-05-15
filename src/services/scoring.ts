import type {
  ArbitrageScore,
  ArbitrageRecommendation,
  MarketAnalysis,
  RegulationRecord,
  RegulationStatus,
} from "../types/index.js";

const REGULATION_SCORE: Record<RegulationStatus, number> = {
  permitted: 90,
  capped: 60,
  restricted: 30,
  banned: 0,
  unknown: 50,
};

const ASSUMED_OPS_COST_USD = 500; // monthly: cleaning, supplies, utilities adjustment, platform fees
const ASSUMED_RENT_TO_ADR_RATIO = 7; // crude default: monthly rent ~ 7x nightly ADR

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function estimateRentFromAdr(medianAdr: number): number {
  return Math.round(medianAdr * ASSUMED_RENT_TO_ADR_RATIO);
}

export function computeArbitrageScore(args: {
  regulations: RegulationRecord | null;
  market: Pick<
    MarketAnalysis,
    | "averageDailyRate"
    | "occupancyEstimate"
    | "competitiveSaturation"
    | "filteredListings"
  >;
  monthlyRent?: number;
}): ArbitrageScore {
  const status: RegulationStatus = args.regulations?.status ?? "unknown";
  const regulationScore = REGULATION_SCORE[status];

  const occRate = args.market.occupancyEstimate.estimatedRate;
  const demandScore = clamp(occRate * 100, 0, 100);

  const adr = args.market.averageDailyRate.median;
  const grossMonthly = adr * 30 * occRate;
  const monthlyRent = args.monthlyRent ?? estimateRentFromAdr(adr);
  const monthlyCost = monthlyRent + ASSUMED_OPS_COST_USD;
  const profitabilityRaw = monthlyCost > 0
    ? ((grossMonthly - monthlyCost) / monthlyCost) * 100
    : 0;
  const profitabilityScore = clamp(profitabilityRaw, 0, 100);

  const saturationScore = clamp(100 - args.market.competitiveSaturation.score, 0, 100);

  const total = Math.round(
    regulationScore * 0.35 +
      demandScore * 0.25 +
      profitabilityScore * 0.30 +
      saturationScore * 0.10,
  );

  let recommendation: ArbitrageRecommendation;
  if (status === "banned") {
    recommendation = "avoid";
  } else if (total >= 70) {
    recommendation = "viable";
  } else if (total >= 50) {
    recommendation = "marginal";
  } else {
    recommendation = "avoid";
  }

  const projectedAnnualRevenue = Math.round(grossMonthly * 12);
  const projectedNetIncome = Math.round((grossMonthly - monthlyCost) * 12);
  const breakEvenOccupancy = adr > 0
    ? clamp(monthlyCost / (adr * 30), 0, 1)
    : 1;

  const warnings: string[] = [];
  if (args.regulations) {
    if (status === "banned" || status === "restricted") {
      warnings.push(`Regulatory status: ${status}. ${args.regulations.summary}`);
    }
    if (args.regulations.details.nightLimit) {
      warnings.push(`Annual night cap: ${args.regulations.details.nightLimit} nights.`);
    }
    if (args.regulations.details.ownerOccupancyRequired) {
      warnings.push(`Owner-occupancy required — non-resident operation may be illegal.`);
    }
  } else {
    warnings.push(`No regulatory record on file for this city. Verify locally before transacting.`);
  }
  if (args.market.filteredListings < 20) {
    warnings.push(`Small comparable sample (${args.market.filteredListings} listings). Estimates have low confidence.`);
  }
  if (args.market.competitiveSaturation.score >= 75) {
    warnings.push(`Market is oversaturated; ramp-up to median occupancy may take 12+ months.`);
  }

  return {
    total: clamp(total, 0, 100),
    subscores: {
      regulation: regulationScore,
      demand: Math.round(demandScore),
      profitability: Math.round(profitabilityScore),
      saturation: Math.round(saturationScore),
    },
    projectedAnnualRevenue,
    projectedNetIncome,
    breakEvenOccupancy: Math.round(breakEvenOccupancy * 100) / 100,
    recommendation,
    warnings,
  };
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MarketAnalysis } from "../types/index.js";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not configured");
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

export async function generateInvestmentSummary(
  analysis: Omit<MarketAnalysis, "investmentSummary">
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a short-term rental investment analyst. Given the following market data, write a concise 2-3 sentence investment summary with a clear recommendation (bullish, cautious, or bearish).

Market: ${analysis.location}
Listings analyzed: ${analysis.filteredListings} (of ${analysis.totalListingsAnalyzed} total)
Revenue estimate: $${analysis.revenueEstimate.lowEstimate.toLocaleString()}-$${analysis.revenueEstimate.highEstimate.toLocaleString()}/year (${analysis.revenueEstimate.confidenceLevel} confidence)
ADR: $${analysis.averageDailyRate.median}/night (range: $${analysis.averageDailyRate.percentile25}-$${analysis.averageDailyRate.percentile75})
Occupancy: ${(analysis.occupancyEstimate.estimatedRate * 100).toFixed(0)}%
Saturation: ${analysis.competitiveSaturation.label} (${analysis.competitiveSaturation.score}/100)
Guest Favorites: ${analysis.competitiveSaturation.guestFavoritePercent}%
Top recommended amenities: ${analysis.amenityGapAnalysis.recommendedAmenities.join(", ") || "N/A"}

Write the summary as if briefing a real estate investor. Be specific with numbers. No bullet points.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  return text;
}

interface ArbitrageNarrativeInput {
  address: string;
  city: string;
  score: {
    total: number;
    recommendation: string;
    projectedAnnualRevenue: number;
    projectedNetIncome: number;
    breakEvenOccupancy: number;
    subscores: { regulation: number; demand: number; profitability: number; saturation: number };
    warnings: string[];
  };
  regulationStatus: string;
  marketSnapshot: {
    medianAdr: number;
    estimatedOccupancy: number;
    saturationLabel: string;
  };
}

export async function generateArbitrageNarrative(
  input: ArbitrageNarrativeInput
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

  const { score, marketSnapshot } = input;
  const prompt = `You are an STR investment analyst briefing a real estate investor on a specific property. Write 3-4 sentences. Lead with the recommendation and overall score, then justify with the strongest numerical drivers. Mention regulatory risk if relevant. End with a concrete next-step suggestion.

Address: ${input.address}
City: ${input.city}
Overall score: ${score.total}/100 (${score.recommendation})
Regulation status: ${input.regulationStatus}
Subscores — regulation: ${score.subscores.regulation}, demand: ${score.subscores.demand}, profitability: ${score.subscores.profitability}, saturation: ${score.subscores.saturation}
Projected annual revenue: $${score.projectedAnnualRevenue.toLocaleString()}
Projected net income: $${score.projectedNetIncome.toLocaleString()}
Break-even occupancy: ${(score.breakEvenOccupancy * 100).toFixed(0)}%
Market median ADR: $${marketSnapshot.medianAdr}/night
Market estimated occupancy: ${(marketSnapshot.estimatedOccupancy * 100).toFixed(0)}%
Market saturation: ${marketSnapshot.saturationLabel}
Warnings: ${score.warnings.join(" | ") || "none"}

Be specific with numbers. No bullet points. No preamble.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

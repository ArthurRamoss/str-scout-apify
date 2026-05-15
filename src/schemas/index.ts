import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Raw shapes — passed to MCP registerTool (which expects ZodRawShapeCompat)
// AND wrapped with z.object() for REST endpoint validation. Single source of truth.

export const searchListingsShape = {
  city: z
    .string()
    .min(2)
    .describe("City to search (e.g. 'Austin, TX', 'Lisbon', 'Barcelona')."),
  bedrooms: z.number().int().min(0).max(10).optional()
    .describe("Filter to listings with at least this many bedrooms."),
  bathrooms: z.number().min(0).max(10).optional()
    .describe("Filter to listings with at least this many bathrooms."),
  minPrice: z.number().nonnegative().optional()
    .describe("Minimum nightly price in USD."),
  maxPrice: z.number().nonnegative().optional()
    .describe("Maximum nightly price in USD."),
  propertyType: z
    .enum(["entire_home", "private_room", "any"])
    .default("entire_home")
    .describe("Property type filter."),
  limit: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of listings to return."),
} as const;

export const marketAnalysisShape = {
  location: z
    .string()
    .min(2)
    .describe("City to analyze (e.g. 'Austin, TX', 'Lisbon', 'Barcelona')."),
  propertyType: z
    .enum(["entire_home", "private_room", "any"])
    .default("entire_home")
    .describe("Property type filter."),
  bedrooms: z.number().int().min(0).max(10).optional()
    .describe("Filter to listings with at least this many bedrooms."),
  checkIn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .describe("Check-in date (YYYY-MM-DD) for seasonal pricing analysis."),
  checkOut: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional()
    .describe("Check-out date (YYYY-MM-DD) for seasonal pricing analysis."),
} as const;

export const arbitrageScoreShape = {
  address: z.string().min(5)
    .describe("Property address (e.g. '123 Main St, Austin TX 78701')."),
  city: z.string().min(2)
    .describe("City for regulation lookup and market comps."),
  monthlyRent: z.number().positive().optional()
    .describe("Long-term monthly rent in USD (for rent-arbitrage ROI). If omitted, estimated from local ADR."),
  bedrooms: z.number().int().min(0).max(10)
    .describe("Number of bedrooms."),
  bathrooms: z.number().min(0).max(10).optional()
    .describe("Number of bathrooms."),
  propertyType: z
    .enum(["entire_home", "private_room"])
    .default("entire_home")
    .describe("Property type."),
} as const;

export const regulationsShape = {
  city: z.string().min(2).describe("City to look up (e.g. 'Austin', 'Lisbon')."),
  state: z.string().length(2).optional().describe("US state code (e.g. 'TX', 'CA')."),
  country: z.string().length(2).default("US").describe("ISO 3166-1 alpha-2 country code."),
} as const;

export const searchListingsSchema = z.object(searchListingsShape);
export const marketAnalysisSchema = z.object(marketAnalysisShape);
export const arbitrageScoreSchema = z.object(arbitrageScoreShape);
export const regulationsSchema = z.object(regulationsShape);

export interface ToolDefinition {
  name: string;
  description: string;
  shape: Record<string, z.ZodTypeAny>;
  schema: z.ZodObject<any>;
  jsonSchema: ReturnType<typeof zodToJsonSchema>;
  pricing: { event: string; priceUsd: number };
}

function def(
  name: string,
  description: string,
  shape: Record<string, z.ZodTypeAny>,
  schema: z.ZodObject<any>,
  event: string,
  priceUsd: number,
): ToolDefinition {
  return {
    name,
    description,
    shape,
    schema,
    jsonSchema: zodToJsonSchema(schema, { target: "jsonSchema7" }),
    pricing: { event, priceUsd },
  };
}

export const toolDefinitions: ToolDefinition[] = [
  def(
    "search-listings",
    "Search short-term rental listings in a city with filters (bedrooms, price range, property type). Returns up to 100 compact listing records with price, rating, and location.",
    searchListingsShape,
    searchListingsSchema,
    "tool-call-search-listings",
    0.05,
  ),
  def(
    "regulations",
    "Look up local short-term rental regulations for a city: permitted/restricted/banned/capped status, license requirements, night caps, fees. Use this BEFORE arbitrage-score to filter out hostile markets.",
    regulationsShape,
    regulationsSchema,
    "tool-call-regulations",
    0.10,
  ),
  def(
    "market-analysis",
    "Full market intelligence report for a city: revenue estimates with confidence intervals, ADR percentiles, occupancy modeling, competitive saturation scoring, amenity gap analysis, top comparable listings, and AI investment summary.",
    marketAnalysisShape,
    marketAnalysisSchema,
    "tool-call-market-analysis",
    0.50,
  ),
  def(
    "arbitrage-score",
    "Score a specific property address for short-term rental conversion viability (0-100). Combines local regulation status, market demand, profitability vs rental cost, and saturation. Returns recommendation (viable/marginal/avoid), projected revenue and net income, and break-even occupancy.",
    arbitrageScoreShape,
    arbitrageScoreSchema,
    "tool-call-arbitrage-score",
    1.00,
  ),
];

export function getToolDefinition(name: string): ToolDefinition | undefined {
  return toolDefinitions.find((t) => t.name === name);
}

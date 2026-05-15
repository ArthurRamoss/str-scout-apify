import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  searchListingsShape,
  marketAnalysisShape,
  arbitrageScoreShape,
  regulationsShape,
} from "../schemas/index.js";
import {
  handleSearchListings,
  handleMarketAnalysis,
  handleArbitrageScore,
  handleRegulations,
} from "../tools/index.js";

function wrap(handler: (args: unknown) => Promise<{ content: any[]; structuredContent: any }>) {
  return async (args: unknown) => {
    try {
      const result = await handler(args);
      return result;
    } catch (err: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  };
}

export function buildMcpServer(): McpServer {
  const server = new McpServer({ name: "str-scout", version: "0.1.0" });

  server.registerTool(
    "search-listings",
    {
      description:
        "Search short-term rental listings in a city with filters. Returns up to 100 compact records (price, bedrooms, rating, location).",
      inputSchema: searchListingsShape,
    },
    wrap(handleSearchListings) as any,
  );

  server.registerTool(
    "regulations",
    {
      description:
        "Look up local short-term rental regulations for a city: status (permitted/restricted/banned/capped), license requirements, night caps, fees.",
      inputSchema: regulationsShape,
    },
    wrap(handleRegulations) as any,
  );

  server.registerTool(
    "market-analysis",
    {
      description:
        "Full market intelligence report: revenue estimates, ADR percentiles, occupancy modeling, saturation scoring, amenity gaps, top comparables, and AI investment summary.",
      inputSchema: marketAnalysisShape,
    },
    wrap(handleMarketAnalysis) as any,
  );

  server.registerTool(
    "arbitrage-score",
    {
      description:
        "Score a property address (0-100) for short-term rental conversion viability. Combines regulations, market demand, profitability vs rental cost, and saturation. Returns recommendation, projected revenue/net income, and break-even occupancy.",
      inputSchema: arbitrageScoreShape,
    },
    wrap(handleArbitrageScore) as any,
  );

  return server;
}

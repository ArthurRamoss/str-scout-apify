import { Router, type Request, type Response } from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { toolDefinitions } from "../schemas/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// In dist layout: dist/http/discovery.js → ../../.actor/web_server_openapi.json
const OPENAPI_PATH = join(__dirname, "..", "..", ".actor", "web_server_openapi.json");

let openApiCache: string | null = null;
function loadOpenApi(): string {
  if (openApiCache !== null) return openApiCache;
  try {
    openApiCache = readFileSync(OPENAPI_PATH, "utf-8");
  } catch (err: any) {
    console.warn(`[discovery] could not load OpenAPI spec at ${OPENAPI_PATH}: ${err.message}`);
    openApiCache = JSON.stringify({
      openapi: "3.1.0",
      info: { title: "STR Scout", version: "0.1.0" },
      paths: {},
    });
  }
  return openApiCache;
}

export const discoveryRouter: Router = Router();

discoveryRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "str-scout",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

discoveryRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "str-scout",
    version: "0.1.0",
    description: "Short-term rental market intelligence — REST + MCP",
    endpoints: {
      tools: "/tools",
      openapi: "/openapi.json",
      mcp: "/mcp",
      health: "/health",
      rest: ["/search-listings", "/regulations", "/market-analysis", "/arbitrage-score"],
    },
  });
});

discoveryRouter.get("/tools", (_req: Request, res: Response) => {
  res.json({
    tools: toolDefinitions.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.jsonSchema,
      pricing: t.pricing,
    })),
  });
});

discoveryRouter.get("/openapi.json", (_req: Request, res: Response) => {
  res.type("application/json").send(loadOpenApi());
});

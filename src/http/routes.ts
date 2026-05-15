import { Router, type Request, type Response } from "express";
import {
  handleSearchListings,
  handleMarketAnalysis,
  handleRegulations,
  handleArbitrageScore,
  type ToolResponse,
} from "../tools/index.js";
import { ZodError } from "zod";

type Handler = (args: unknown) => Promise<ToolResponse<unknown>>;

function wrapRoute(handler: Handler) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await handler(req.body ?? {});
      res.json(result.structuredContent);
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: "ValidationError", issues: err.issues });
        return;
      }
      console.error(`[http] ${req.path} failed: ${err.message}`);
      res.status(500).json({ error: "InternalError", message: err.message });
    }
  };
}

export const restRouter: Router = Router();

restRouter.post("/search-listings", wrapRoute(handleSearchListings as Handler));
restRouter.post("/regulations", wrapRoute(handleRegulations as Handler));
restRouter.post("/market-analysis", wrapRoute(handleMarketAnalysis as Handler));
restRouter.post("/arbitrage-score", wrapRoute(handleArbitrageScore as Handler));

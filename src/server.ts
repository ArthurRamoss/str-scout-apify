import "dotenv/config";
import { Actor } from "apify";
import express, { type Request, type Response } from "express";
import { handleAnalyzeMarket } from "./tools/analyzeMarket.js";

const isStandby = process.env.ACTOR_STANDBY_PORT || process.env.APIFY_ACTOR_STANDBY_PORT;

if (isStandby) {
  const app = express();
  app.use(express.json());

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "str-scout",
      version: "1.0.0",
      mode: "standby",
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/", async (req: Request, res: Response) => {
    const { location, propertyType, bedrooms, checkIn, checkOut } = req.body ?? {};

    if (!location) {
      res.status(400).json({ error: "location is required" });
      return;
    }

    try {
      const result = await handleAnalyzeMarket({
        location,
        propertyType,
        bedrooms,
        checkIn,
        checkOut,
      });

      await Actor.charge({ eventName: "market-analysis" });

      res.json(result.structuredContent);
    } catch (err: any) {
      console.error(`[standby] Analysis failed: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  const port = Number(
    process.env.ACTOR_STANDBY_PORT ||
    process.env.APIFY_ACTOR_STANDBY_PORT ||
    process.env.PORT ||
    3000
  );

  app.listen(port, () => {
    console.log(`STR Scout standby server running on port ${port}`);
  });
} else {
  await Actor.init();

  try {
    const input = (await Actor.getInput<Record<string, unknown>>()) ?? {};
    const { location, propertyType, bedrooms, checkIn, checkOut } = input;

    if (!location || typeof location !== "string") {
      throw new Error("Input must include a 'location' string (e.g. 'Austin, TX')");
    }

    console.log(`[batch] Running STR Scout analysis for "${location}"`);

    const result = await handleAnalyzeMarket({
      location,
      propertyType,
      bedrooms,
      checkIn,
      checkOut,
    });

    await Actor.pushData(result.structuredContent);
    await Actor.charge({ eventName: "market-analysis" });

    console.log(`[batch] Analysis complete for "${location}"`);
  } catch (err: any) {
    console.error(`[batch] Fatal error: ${err.message}`);
    await Actor.fail(err.message);
  }

  await Actor.exit();
}

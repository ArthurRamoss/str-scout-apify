import "dotenv/config";
import { Actor } from "apify";
import express from "express";
import { restRouter } from "./http/routes.js";
import { discoveryRouter } from "./http/discovery.js";
import { mcpHandler } from "./mcp/transport.js";
import { handleMarketAnalysis } from "./tools/marketAnalysis.js";

const isStandby = !!(
  process.env.ACTOR_STANDBY_PORT || process.env.APIFY_ACTOR_STANDBY_PORT
);

if (isStandby) {
  await Actor.init();

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.use(discoveryRouter);
  app.use(restRouter);
  app.post("/mcp", mcpHandler);

  app.use((req, res) => {
    res.status(404).json({ error: "NotFound", path: req.path });
  });

  const port = Number(
    process.env.ACTOR_STANDBY_PORT ||
      process.env.APIFY_ACTOR_STANDBY_PORT ||
      process.env.PORT ||
      3000,
  );

  app.listen(port, () => {
    console.log(`STR Scout standby server listening on port ${port}`);
  });
} else {
  await Actor.init();
  try {
    const input = (await Actor.getInput<Record<string, unknown>>()) ?? {};
    const { location, propertyType, bedrooms, checkIn, checkOut } = input;

    if (!location || typeof location !== "string") {
      throw new Error("Input must include a 'location' string (e.g. 'Lisbon')");
    }

    console.log(`[batch] Running market analysis for "${location}"`);

    const result = await handleMarketAnalysis({
      location,
      propertyType,
      bedrooms,
      checkIn,
      checkOut,
    });

    await Actor.pushData(result.structuredContent as any);
    console.log(`[batch] Done — pushed analysis for "${location}"`);
  } catch (err: any) {
    console.error(`[batch] Fatal: ${err.message}`);
    await Actor.fail(err.message);
  }
  await Actor.exit();
}

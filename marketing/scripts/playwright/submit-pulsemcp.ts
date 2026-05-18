// Submit STR Scout to pulsemcp.com via Playwright form automation.
// Run: cd marketing/scripts/playwright && npm run submit-pulsemcp

import { openBrowser, screenshot, humanDelay } from "./lib/browser.js";

const SUBMISSION_URL = "https://www.pulsemcp.com/submit";

const payload = {
  name: "STR Scout",
  description_short: "Short-term rental market intelligence with regulations lookup, market analysis, and arbitrage scoring — accessible via MCP/REST/batch.",
  description_long: `STR Scout is an MCP-native short-term rental market intelligence tool exposing 4 tools:

1. search-listings — comparable Airbnb listings by city/bedrooms/price ($0.05)
2. regulations — local STR regulatory status for 10+ major cities ($0.10)
3. market-analysis — revenue, ADR, occupancy, saturation, comps, AI summary ($0.50)
4. arbitrage-score — score any address 0-100 for STR viability ($1.00)

Built on TypeScript MCP SDK 1.29 + Apify Standby. Pay-per-event pricing. Hybrid data layer (open-data feeds + live-scrape fallback). Unofficial — not affiliated with Airbnb Inc.`,
  url: "https://apify.com/ramosss/str-scout",
  mcp_url: "https://ramosss--str-scout.apify.actor/mcp",
  category: "Real Estate / Finance",
  tags: "airbnb,str,real-estate,market-analysis,arbitrage,regulations,mcp,apify,pay-per-call",
};

(async () => {
  const { page, close } = await openBrowser({ headless: true });
  try {
    console.log(`→ Opening ${SUBMISSION_URL}`);
    await page.goto(SUBMISSION_URL, { waitUntil: "networkidle", timeout: 30_000 });
    await humanDelay();

    const fieldMap: Record<string, string> = {
      name: payload.name,
      description: payload.description_long,
      url: payload.url,
      "mcp url": payload.mcp_url,
      "mcp_url": payload.mcp_url,
      category: payload.category,
      tags: payload.tags,
    };

    for (const [labelOrName, value] of Object.entries(fieldMap)) {
      const candidates = [
        `input[name*="${labelOrName.replace(/\s+/g, "_")}" i]`,
        `textarea[name*="${labelOrName.replace(/\s+/g, "_")}" i]`,
        `input[placeholder*="${labelOrName}" i]`,
        `textarea[placeholder*="${labelOrName}" i]`,
        `[aria-label*="${labelOrName}" i]`,
        `label:has-text("${labelOrName}") + input`,
        `label:has-text("${labelOrName}") + textarea`,
      ];
      let filled = false;
      for (const sel of candidates) {
        try {
          if (await page.locator(sel).first().isVisible({ timeout: 800 })) {
            await page.locator(sel).first().fill(value);
            filled = true;
            console.log(`  ✓ filled "${labelOrName}"`);
            break;
          }
        } catch { /* try next selector */ }
      }
      if (!filled) console.warn(`  ⚠ could not locate field "${labelOrName}"`);
      await humanDelay(500, 1500);
    }

    await screenshot(page, "pulsemcp-pre-submit");

    const submitCandidates = ['button:has-text("Submit")', 'button[type="submit"]', 'button:has-text("Send")', 'button:has-text("Add")'];
    for (const sel of submitCandidates) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible().catch(() => false)) {
        console.log(`→ Clicking submit (${sel})`);
        await btn.click();
        break;
      }
    }

    await page.waitForLoadState("networkidle", { timeout: 30_000 });
    const finalUrl = page.url();
    const screenshotPath = await screenshot(page, "pulsemcp-post-submit");
    console.log(`  ✓ post-submit URL: ${finalUrl}`);
    console.log(`  ✓ evidence: ${screenshotPath}`);
  } catch (err: any) {
    const path = await screenshot(page, "pulsemcp-error");
    console.error(`✗ submission failed: ${err.message}`);
    console.error(`  evidence: ${path}`);
    console.error(`  fallback: copy fields from marketing/registries/pulsemcp.md and paste manually`);
    process.exitCode = 1;
  } finally {
    await close();
  }
})();

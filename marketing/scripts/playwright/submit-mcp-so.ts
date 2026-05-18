// Submit STR Scout to mcp.so via Playwright form automation.
// Pre-requisite: no cookie needed if mcp.so allows guest submissions; if it requires
// GitHub OAuth, halt and emit a manual-fallback hint.
//
// Run: cd marketing/scripts/playwright && npm run submit-mcp-so

import { openBrowser, screenshot, humanDelay } from "./lib/browser.js";

const SUBMISSION_URL = "https://mcp.so/submit";

const payload = {
  name: "STR Scout",
  title: "Short-Term Rental Market Intelligence (MCP-native)",
  tagline: "Pay-per-call Airbnb market intelligence + arbitrage scoring for AI agents.",
  description: `STR Scout exposes 4 tools for short-term rental market intelligence accessible via Model Context Protocol:

- search-listings ($0.05/call): comparable Airbnb listings
- regulations ($0.10/call): local STR regulatory status for major cities
- market-analysis ($0.50/call): full market report with revenue, ADR, occupancy
- arbitrage-score ($1.00/call): score any property address 0-100 for STR viability

Hybrid data: curated open-data feeds for ~30 metros + live-scrape fallback. Pay-per-event billing via Apify. Unofficial. Not affiliated with Airbnb Inc.`,
  homepage: "https://apify.com/ramosss/str-scout",
  mcp_url: "https://ramosss--str-scout.apify.actor/mcp",
  category: "Real Estate",
  tags: ["airbnb", "str", "real-estate", "market-analysis", "arbitrage", "mcp", "apify"],
};

(async () => {
  const { page, close } = await openBrowser({ headless: true });
  try {
    console.log(`→ Opening ${SUBMISSION_URL}`);
    await page.goto(SUBMISSION_URL, { waitUntil: "networkidle", timeout: 30_000 });
    await humanDelay();

    // Detect form fields — mcp.so uses Next.js so selectors may be JS-rendered
    // Try common input patterns. Adjust as needed once we see the live form.
    const fieldMap: Record<string, string> = {
      "name": payload.name,
      "title": payload.title,
      "tagline": payload.tagline,
      "description": payload.description,
      "homepage": payload.homepage,
      "url": payload.mcp_url,
    };

    for (const [labelOrName, value] of Object.entries(fieldMap)) {
      const candidates = [
        `input[name="${labelOrName}"]`,
        `textarea[name="${labelOrName}"]`,
        `input[placeholder*="${labelOrName}" i]`,
        `textarea[placeholder*="${labelOrName}" i]`,
        `[aria-label*="${labelOrName}" i]`,
      ];
      let filled = false;
      for (const sel of candidates) {
        if (await page.locator(sel).first().isVisible().catch(() => false)) {
          await page.locator(sel).first().fill(value);
          filled = true;
          console.log(`  ✓ filled "${labelOrName}" via ${sel}`);
          break;
        }
      }
      if (!filled) console.warn(`  ⚠ could not locate field "${labelOrName}"`);
      await humanDelay(500, 1500);
    }

    await screenshot(page, "mcp-so-pre-submit");

    // Look for submit button — adjust selector once verified
    const submitCandidates = ['button:has-text("Submit")', 'button[type="submit"]', 'button:has-text("Send")'];
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
    const screenshotPath = await screenshot(page, "mcp-so-post-submit");
    console.log(`  ✓ post-submit URL: ${finalUrl}`);
    console.log(`  ✓ evidence: ${screenshotPath}`);
  } catch (err: any) {
    const path = await screenshot(page, "mcp-so-error");
    console.error(`✗ submission failed: ${err.message}`);
    console.error(`  evidence: ${path}`);
    console.error(`  fallback: copy fields from marketing/registries/mcp-so.md and paste at ${SUBMISSION_URL} manually`);
    process.exitCode = 1;
  } finally {
    await close();
  }
})();

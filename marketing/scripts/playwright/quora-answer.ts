// Answer relevant Quora questions about STR analytics tools / AirDNA alternatives.
// Requires cookies export at $COOKIES_QUORA
//
// Run: cd marketing/scripts/playwright && npm run quora-answer

import { openBrowser, screenshot, humanDelay } from "./lib/browser.js";

// Edit this list with confirmed Quora question URLs that fit the angle.
// The answer template is in marketing/drafts/airdna-comparison.md under "Quora answer template".
const TARGETS: Array<{ url: string; note: string }> = [
  // { url: "https://www.quora.com/What-are-some-alternatives-to-AirDNA", note: "alternatives to AirDNA" },
  // { url: "https://www.quora.com/Is-there-a-free-AirDNA", note: "free AirDNA" },
];

const ANSWER = `A few alternatives worth considering depending on use case:

• **Mashvisor** — Comprehensive but subscription-based ($17-$67/mo)
• **STR Scout** — Pay-per-call ($0.05-$1.00 per query). Useful when you don't need continuous monitoring. Has an arbitrage-score tool that scores any address 0-100 for STR viability. Also exposes data via MCP (Model Context Protocol) for AI agents like Claude/Cursor. Link: https://apify.com/ramosss/str-scout
• **Inside Airbnb open data (free)** — Raw CSVs you analyze yourself, works if you know SQL/Python

Disclosure: I built STR Scout. It's unofficial — not affiliated with AirDNA, Airbnb, or Mashvisor.`;

const COOKIES = process.env.COOKIES_QUORA ?? "./marketing/cookies/quora.json";

(async () => {
  if (TARGETS.length === 0) {
    console.error("No question URLs. Edit TARGETS[] with confirmed Quora URLs.");
    process.exit(1);
  }

  const { page, close } = await openBrowser({ cookiePath: COOKIES, headless: false });
  try {
    for (const t of TARGETS) {
      console.log(`→ [${t.note}] ${t.url}`);
      try {
        await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await humanDelay(3000, 5000);

        // Click "Answer" button
        const answerBtn = page.locator('button:has-text("Answer")').first();
        if (!(await answerBtn.isVisible({ timeout: 8000 }).catch(() => false))) {
          console.warn(`  ⚠ no Answer button (already answered? sign-in expired?)`);
          await screenshot(page, `quora-no-answer-${t.note.replace(/\s+/g, '-')}`);
          continue;
        }
        await answerBtn.click();
        await humanDelay(2000, 4000);

        // Type answer
        const editor = page.locator('div[role="textbox"][contenteditable="true"]').last();
        await editor.fill(ANSWER);
        await humanDelay(3000, 5000);

        // Submit
        const submit = page.locator('button:has-text("Post")').last();
        await submit.click();
        await humanDelay(5000, 8000);

        const sshot = await screenshot(page, `quora-${t.note.replace(/\s+/g, '-')}`);
        console.log(`  ✓ answered (evidence: ${sshot})`);
      } catch (e: any) {
        const sshot = await screenshot(page, `quora-error-${t.note.replace(/\s+/g, '-')}`);
        console.error(`  ✗ failed: ${e.message}`);
        console.error(`    evidence: ${sshot}`);
      }
      // Cool down between Quora answers
      await humanDelay(45_000, 120_000);
    }
  } finally {
    await close();
  }
})();

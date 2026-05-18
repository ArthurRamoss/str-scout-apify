// Post comments on a list of YouTube video URLs.
// Requires cookies export at $COOKIES_YOUTUBE (default: ./marketing/cookies/youtube.json)
//
// Run: cd marketing/scripts/playwright && npm run youtube-comment

import { openBrowser, screenshot, humanDelay } from "./lib/browser.js";

// Edit this list per-launch — match templates from marketing/drafts/youtube-comments-br.md
// Format: { url, template (1-5, see draft), context (extracted theme: market/regulation/pricing/arbitrage/saturation) }
const TARGETS: Array<{ url: string; theme: string; comment: string }> = [
  // Filled at runtime by user from confirmed video URLs. Example placeholders below:
  // {
  //   url: "https://www.youtube.com/watch?v=XXXX",
  //   theme: "market",
  //   comment: "Excelente análise! ...",
  // },
];

const COOKIES = process.env.COOKIES_YOUTUBE ?? "./marketing/cookies/youtube.json";

(async () => {
  if (TARGETS.length === 0) {
    console.error("No targets configured. Edit TARGETS[] in this file with video URLs + comments.");
    console.error("Use templates from marketing/drafts/youtube-comments-br.md");
    process.exit(1);
  }

  const { page, close } = await openBrowser({ cookiePath: COOKIES, headless: false });
  try {
    for (const target of TARGETS) {
      console.log(`→ ${target.url}`);
      try {
        await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await humanDelay(2000, 4000);

        // Scroll to comments section (YouTube lazy-loads comments)
        await page.evaluate(() => window.scrollBy(0, 600));
        await humanDelay(2000, 3000);
        await page.locator("#comments").waitFor({ state: "visible", timeout: 15_000 });

        // Click into the comment input
        await page.locator("#simplebox-placeholder").click();
        await humanDelay(500, 1500);

        // Type the comment (humanlike, not pasted)
        await page.locator('#contenteditable-root[contenteditable="true"]').first().fill(target.comment);
        await humanDelay(1000, 2500);

        // Click "Comment" button
        await page.locator('#submit-button button:has-text("Comment")').or(page.locator('#submit-button button:has-text("Comentar")')).click();
        await humanDelay(3000, 5000);

        const sshot = await screenshot(page, `youtube-${target.theme}`);
        console.log(`  ✓ posted (evidence: ${sshot})`);
      } catch (e: any) {
        const sshot = await screenshot(page, `youtube-error-${target.theme}`);
        console.error(`  ✗ failed: ${e.message}`);
        console.error(`    evidence: ${sshot}`);
      }

      // Rate-limit yourself: 30-90s between comments. YouTube will shadowban a flood.
      await humanDelay(30_000, 90_000);
    }
  } finally {
    await close();
  }
})();

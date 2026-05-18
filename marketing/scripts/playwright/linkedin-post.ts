// Post the LinkedIn BR draft to your LinkedIn feed.
// Requires cookies export at $COOKIES_LINKEDIN
//
// Run: cd marketing/scripts/playwright && npm run linkedin-post

import { openBrowser, screenshot, humanDelay } from "./lib/browser.js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COOKIES = process.env.COOKIES_LINKEDIN ?? "./marketing/cookies/linkedin.json";

function getBody(): string {
  const raw = readFileSync(resolve(__dirname, "../../drafts/linkedin-br.md"), "utf-8");
  const m = raw.match(/## Post[\s\S]*?\n\n([\s\S]*?)(?=\n---)/);
  return m?.[1]?.trim() ?? "";
}

(async () => {
  const body = getBody();
  if (!body) {
    console.error("Could not parse linkedin-br.md body");
    process.exit(1);
  }

  const { page, close } = await openBrowser({ cookiePath: COOKIES, headless: false });
  try {
    console.log(`→ Opening LinkedIn feed...`);
    await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 30_000 });
    await humanDelay(4000, 7000);

    // Find "Start a post" button
    const startPost = page.locator('button:has-text("Start a post")')
      .or(page.locator('button:has-text("Comece uma publicação")'))
      .or(page.locator('button[aria-label*="Start a post" i]'))
      .first();

    if (!(await startPost.isVisible({ timeout: 10_000 }).catch(() => false))) {
      const sshot = await screenshot(page, "linkedin-no-start-button");
      console.error(`  ✗ Could not find Start-a-post button. Login expired? evidence: ${sshot}`);
      process.exit(1);
    }

    await startPost.click();
    await humanDelay(2000, 4000);

    // Type in the modal
    const editor = page.locator('div[role="textbox"][contenteditable="true"]').last();
    await editor.fill(body);
    await humanDelay(3000, 5000);

    // Find "Post" button (active when content is typed)
    const postBtn = page.locator('button:has-text("Post")')
      .or(page.locator('button:has-text("Publicar")'))
      .or(page.locator('button[aria-label*="Post" i]'))
      .last();

    await postBtn.click();
    await humanDelay(5000, 8000);

    const sshot = await screenshot(page, "linkedin-post-success");
    console.log(`  ✓ posted (evidence: ${sshot})`);
  } catch (e: any) {
    const sshot = await screenshot(page, "linkedin-error");
    console.error(`  ✗ failed: ${e.message}`);
    console.error(`    evidence: ${sshot}`);
    process.exitCode = 1;
  } finally {
    await close();
  }
})();

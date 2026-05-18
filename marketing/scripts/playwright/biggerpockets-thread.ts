// Create a new thread in BiggerPockets STR forum.
// Requires cookies export at $COOKIES_BIGGERPOCKETS
//
// Run: cd marketing/scripts/playwright && npm run biggerpockets-thread

import { openBrowser, screenshot, humanDelay, readDraft } from "./lib/browser.js";

const COOKIES = process.env.COOKIES_BIGGERPOCKETS ?? "./marketing/cookies/biggerpockets.json";
const FORUM_NEW_TOPIC_URL = "https://www.biggerpockets.com/forums/53/topics/new"; // STR forum ID — verify at runtime

(async () => {
  const { title, body } = readDraft("biggerpockets-thread.md");
  if (!title || !body) {
    console.error("Could not parse drafts/biggerpockets-thread.md");
    process.exit(1);
  }

  const { page, close } = await openBrowser({ cookiePath: COOKIES, headless: false });
  try {
    console.log(`→ Opening ${FORUM_NEW_TOPIC_URL}`);
    await page.goto(FORUM_NEW_TOPIC_URL, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await humanDelay(3000, 5000);

    // Title field (BP uses rails-style names; verify at runtime)
    const titleField = page.locator('input[name*="title" i]').first();
    if (!(await titleField.isVisible({ timeout: 8000 }).catch(() => false))) {
      const sshot = await screenshot(page, "bp-no-title-field");
      console.error(`  ✗ couldn't find title field. Logged in? ${sshot}`);
      process.exit(1);
    }
    await titleField.fill(title);
    await humanDelay(1500, 3000);

    // Body field — BiggerPockets uses a rich editor (TinyMCE or similar)
    // Try common selectors
    const bodyEditor = page.locator('textarea[name*="body" i]')
      .or(page.locator('div[role="textbox"][contenteditable="true"]'))
      .first();
    await bodyEditor.fill(body);
    await humanDelay(2000, 4000);

    await screenshot(page, "bp-pre-submit");

    // Submit
    const submit = page.locator('button:has-text("Post")')
      .or(page.locator('button:has-text("Create")'))
      .or(page.locator('input[type="submit"]'))
      .first();
    await submit.click();
    await humanDelay(5000, 8000);

    const sshot = await screenshot(page, "bp-post-submit");
    console.log(`  ✓ thread posted (evidence: ${sshot})`);
    console.log(`  final URL: ${page.url()}`);
  } catch (e: any) {
    const sshot = await screenshot(page, "bp-error");
    console.error(`  ✗ failed: ${e.message}`);
    console.error(`    evidence: ${sshot}`);
    console.error(`    fallback: paste from marketing/drafts/biggerpockets-thread.md manually`);
    process.exitCode = 1;
  } finally {
    await close();
  }
})();

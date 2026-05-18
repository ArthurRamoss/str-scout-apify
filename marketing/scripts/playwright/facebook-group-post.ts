// Post a STR Scout draft to a list of Facebook group URLs.
// Requires cookies export at $COOKIES_FACEBOOK
//
// Run: cd marketing/scripts/playwright && npm run facebook-group-post

import { openBrowser, screenshot, humanDelay, readDraft } from "./lib/browser.js";

// List of FB group URLs to post into. User confirms membership before running.
// Pick "Versão A" (drafts/facebook-br-groups.md) for groups that allow promo,
// "Versão B" for stricter groups (question framing).
const TARGETS: Array<{ url: string; variant: "A" | "B"; note: string }> = [
  // Example: { url: "https://www.facebook.com/groups/anfitrioesairbnbbrasil/", variant: "A", note: "Anfitriões Airbnb Brasil" },
];

const COOKIES = process.env.COOKIES_FACEBOOK ?? "./marketing/cookies/facebook.json";

// Load both variants from the consolidated draft file
function loadFbDrafts(): { A: string; B: string } {
  const raw = readDraft("facebook-br-groups.md", "## Versão A — \"Compartilhando ferramenta\"");
  // The draft has both Versão A and Versão B sections — parse them separately
  const fullPath = "../../drafts/facebook-br-groups.md";
  // Simpler: read the full file and split on the section markers
  const full = require("node:fs").readFileSync(require("node:path").resolve(__dirname, "../../drafts/facebook-br-groups.md"), "utf-8");
  const aMatch = full.match(/## Versão A[\s\S]*?\*\*Body:\*\*\s*\n\n([\s\S]*?)(?=\n---)/);
  const bMatch = full.match(/## Versão B[\s\S]*?\*\*Body:\*\*\s*\n\n([\s\S]*?)(?=\n---)/);
  return {
    A: aMatch?.[1]?.trim() ?? "",
    B: bMatch?.[1]?.trim() ?? "",
  };
}

(async () => {
  if (TARGETS.length === 0) {
    console.error("No targets. Edit TARGETS[] with FB group URLs + variant choice.");
    process.exit(1);
  }

  const drafts = loadFbDrafts();
  if (!drafts.A || !drafts.B) {
    console.error("Could not parse Versão A/B from drafts/facebook-br-groups.md");
    process.exit(1);
  }

  const { page, close } = await openBrowser({ cookiePath: COOKIES, headless: false });
  try {
    for (const t of TARGETS) {
      const body = t.variant === "A" ? drafts.A : drafts.B;
      console.log(`→ [${t.note}] (${t.variant}) ${t.url}`);
      try {
        await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await humanDelay(3000, 6000);

        // Click "Create post" / "Escreva algo" placeholder
        const composeSelectors = [
          'div[role="button"]:has-text("Escreva algo")',
          'div[role="button"]:has-text("Write something")',
          'div[aria-label*="Create" i][role="button"]',
        ];
        let opened = false;
        for (const sel of composeSelectors) {
          if (await page.locator(sel).first().isVisible({ timeout: 4000 }).catch(() => false)) {
            await page.locator(sel).first().click();
            opened = true;
            break;
          }
        }
        if (!opened) {
          console.warn(`  ⚠ could not find composer for ${t.url} — skipping`);
          await screenshot(page, `fb-no-composer-${t.note.replace(/\s+/g, '-')}`);
          continue;
        }
        await humanDelay(2000, 4000);

        // Find the editable area in the modal that just opened
        const editor = page.locator('div[role="textbox"][contenteditable="true"]').last();
        await editor.fill(body);
        await humanDelay(2000, 4000);

        // Post button
        const postBtn = page.locator('div[role="button"][aria-label*="Post" i]')
          .or(page.locator('div[role="button"][aria-label*="Publicar" i]'));
        if (await postBtn.first().isVisible({ timeout: 4000 }).catch(() => false)) {
          await postBtn.first().click();
          await humanDelay(5000, 8000);
          const sshot = await screenshot(page, `fb-${t.note.replace(/\s+/g, '-')}`);
          console.log(`  ✓ posted (evidence: ${sshot})`);
        } else {
          console.warn(`  ⚠ no Post button visible (group may require moderation)`);
          await screenshot(page, `fb-pending-${t.note.replace(/\s+/g, '-')}`);
        }
      } catch (e: any) {
        const sshot = await screenshot(page, `fb-error-${t.note.replace(/\s+/g, '-')}`);
        console.error(`  ✗ failed: ${e.message}`);
        console.error(`    evidence: ${sshot}`);
      }

      // Cool down: 60-180s between posts. FB anti-spam is aggressive.
      await humanDelay(60_000, 180_000);
    }
  } finally {
    await close();
  }
})();

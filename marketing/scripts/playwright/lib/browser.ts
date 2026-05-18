import { chromium, BrowserContext, Page } from "playwright";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = resolve(__dirname, "../../screenshots");

/**
 * Load a cookies-export JSON (EditThisCookie format) and return a Playwright
 * StorageState that can be passed to browser.newContext({ storageState: ... }).
 *
 * Accepts:
 *   - Array of cookie objects (EditThisCookie's "export" format)
 *   - { cookies: [...] } object
 */
export function loadCookiesAsStorageState(cookiePath: string) {
  const raw = JSON.parse(readFileSync(cookiePath, "utf-8"));
  const cookies = Array.isArray(raw) ? raw : raw.cookies ?? [];

  // EditThisCookie uses `expirationDate` (seconds-with-decimals). Playwright wants `expires` (integer seconds).
  const playwrightCookies = cookies.map((c: any) => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path ?? "/",
    expires: c.expirationDate ? Math.floor(c.expirationDate) : -1,
    httpOnly: c.httpOnly ?? false,
    secure: c.secure ?? false,
    sameSite: (c.sameSite === "no_restriction" ? "None" : c.sameSite === "lax" ? "Lax" : c.sameSite === "strict" ? "Strict" : "Lax") as "Strict" | "Lax" | "None",
  }));

  return { cookies: playwrightCookies, origins: [] };
}

export interface BrowserOptions {
  cookiePath?: string;
  headless?: boolean;
  channel?: "chromium" | "chrome";
  userAgent?: string;
}

export async function openBrowser(opts: BrowserOptions = {}): Promise<{ context: BrowserContext; page: Page; close: () => Promise<void> }> {
  const browser = await chromium.launch({
    headless: opts.headless ?? true,
    channel: opts.channel,
  });

  const storageState = opts.cookiePath ? loadCookiesAsStorageState(opts.cookiePath) : undefined;

  const context = await browser.newContext({
    storageState,
    userAgent: opts.userAgent ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  return {
    context,
    page,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}

export async function screenshot(page: Page, name: string): Promise<string> {
  if (!existsSync(SCREENSHOT_DIR)) mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const file = resolve(SCREENSHOT_DIR, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

export async function humanDelay(min = 1500, max = 4500) {
  const ms = Math.floor(Math.random() * (max - min) + min);
  await new Promise((r) => setTimeout(r, ms));
}

export function readDraft(file: string, marker = "**Body:**"): { title: string; body: string } {
  const raw = readFileSync(resolve(__dirname, "../../drafts", file), "utf-8");
  const titleMatch = raw.match(/^\*\*Title[^:]*:\*\*\s*(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? "";
  const bodyIdx = raw.indexOf(marker);
  const body = bodyIdx >= 0 ? raw.slice(bodyIdx + marker.length).trim() : "";
  return { title, body };
}

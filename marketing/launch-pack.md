# STR Scout — Launch Pack

Master index of every distribution channel. Status: 🟢 ready · 🟡 needs creds · ⚪ manual · ✅ done · ❌ failed.

**Actor URL:** https://apify.com/ramosss/str-scout
**Standby URL:** https://ramosss--str-scout.apify.actor
**Landing page:** https://str-scout.vercel.app (after deploy)

---

## Phase A — Direct API (automated)

| # | Channel | Status | Mechanism | Draft | Notes |
|---|---|---|---|---|---|
| 1 | Reddit r/SideProject | 🟡 needs Reddit creds | `scripts/reddit-submit.sh` | `drafts/reddit-sideproject.md` | Launch-tone |
| 2 | Reddit r/ClaudeAI | 🟡 | same script | `drafts/reddit-claudeai.md` | MCP-demo tone |
| 3 | Reddit r/realestateinvesting | 🟡 | same script | `drafts/reddit-realestateinvesting.md` | Investor case-study tone |
| 4 | Reddit r/AirBnBHosts | 🟡 | same script | `drafts/reddit-airbnbhosts.md` | Pricing-benchmark tone |
| 5 | Reddit r/Entrepreneur | 🟡 | same script | `drafts/reddit-entrepreneur.md` | Pricing-model strategy tone |
| 6 | Reddit r/empreendedorismo (BR) | 🟡 | same script | `drafts/reddit-brasil.md` | "lessons learned" PT-BR |
| 7 | Reddit r/investimentos (BR) | 🟡 | same script | `drafts/reddit-br-investimentos.md` | Investor PT-BR |
| 8 | Twitter/X launch thread | 🟡 needs Twitter API creds | `scripts/twitter-thread.sh` | `drafts/twitter-thread.md` | 8 tweets chained |
| 9 | GitHub PRs: awesome-mcp-servers (punkpeye, wong2, appcypher) | 🟡 needs GitHub PAT | `scripts/mcp-registry-pr.sh` | `registries/awesome-mcp-servers.md` | Auto fork + PR via REST |

---

## Phase B — Browser automation (Playwright)

Install Playwright first: `cd marketing/scripts/playwright && npm install && npx playwright install chromium`

| # | Channel | Status | Script | Cookie needed? |
|---|---|---|---|---|
| 10 | mcp.so submit | 🟢 no auth (probably) | `submit-mcp-so.ts` | No |
| 11 | pulsemcp.com submit | 🟢 no auth (probably) | `submit-pulsemcp.ts` | No |
| 12 | mcphub.org submit | 🟢 | — (similar to mcp.so, copy template) | No |
| 13 | YouTube comments (BR STR creators) | 🟡 needs YT cookie | `youtube-comment.ts` | Yes |
| 14 | Facebook BR host group posts | 🟡 needs FB cookie | `facebook-group-post.ts` | Yes |
| 15 | LinkedIn BR post | 🟡 needs LinkedIn cookie | `linkedin-post.ts` | Yes |
| 16 | Quora answers (AirDNA alternative questions) | 🟡 needs Quora cookie | `quora-answer.ts` | Yes |
| 17 | BiggerPockets STR forum thread | 🟡 needs BP cookie | `biggerpockets-thread.ts` | Yes |
| 18 | AirDNA blog comments | 🟡 needs Disqus/AirDNA login | — (write `airdna-blog-comment.ts` ad-hoc if you have an AirDNA account) | Yes |

---

## Phase C — Manual paste (truly unautomatable)

| # | Channel | Draft file | Your action |
|---|---|---|---|
| 19 | Apify Discord #announcements | `drafts/apify-discord.md` | Paste in Discord (~30s) |
| 20 | Instagram BR carrossel posts (3 posts + stories) | `drafts/instagram-br.md` | Schedule via Buffer or upload native |
| 21 | Telegram BR host groups | `drafts/facebook-br-groups.md` (Versão B for stricter groups) | Manual paste in groups you're a member of |
| 22 | Show HN (Hacker News) | `drafts/hackernews.md` | **TRIGGER: only after 1st paid review lands** |
| 23 | BR STR podcast outreach emails | `drafts/podcast-pitch-br.md` | I create Gmail drafts via MCP, you review + send |

---

## Phase D — Owned media

| # | Item | Status | Notes |
|---|---|---|---|
| 24 | Landing page `str-scout.vercel.app` | 🟢 ready in `landing/`, needs `vercel` CLI auth | Free deploy, no domain needed |
| 25 | README "Try it now" section | ✅ done | Updated at repo root |
| 26 | `/vs-airdna` comparison page | 🟢 content in `drafts/airdna-comparison.md`, can be added as second HTML file under `landing/` | Captures "AirDNA alternative" search |

---

## Phase E — Critical user actions (non-marketing but blocks revenue)

| # | Action | Why | Where |
|---|---|---|---|
| 27 | **KYC: W-8BEN tax form** | Without this, **revenue forfeited at 12 months** (cl. 11.2.4) | `console.apify.com/billing/tax-information` |
| 28 | **KYC: payout method (Wise for BR)** | Same forfeit risk | `console.apify.com/billing/payout-method` |
| 29 | Toggle "Hide source files from Actor detail" | Protects scraper actor names in source code | Apify Console → str-scout → Publication → settings |

---

## Credentials handoff (when ready)

Paste all of these in one message. Format:

```
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USERNAME=...
REDDIT_PASSWORD=...
GITHUB_PAT=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
```

For browser automation (logged-in sites), use a Chrome extension like "Cookie-Editor" to export cookies as JSON:
- YouTube: visit youtube.com logged in → Export → paste in chat
- LinkedIn: same
- Facebook: same
- Quora, BiggerPockets, etc.: same

Cookies go to `marketing/cookies/<site>.json` (gitignored, never committed).

---

## Verification

After Phase 1 + 2 + 3 complete:

- 5-7 Reddit URLs (open each, confirm live)
- 8-tweet Twitter thread (open first, confirm renders correctly)
- 3-5 GitHub PR URLs (open each, confirm entry placed)
- 3-5 MCP registry submission screenshots (saved to `screenshots/`)
- 1-3 BR YouTube/FB/LinkedIn post screenshots
- Landing page returns 200 at `str-scout.vercel.app`
- `bash scripts/audit.sh` returns 0
- Apify dashboard: `chargedEventCounts > 0` from non-Ramosss userId within 48-72h

#!/usr/bin/env bash
# Post an 8-tweet thread via Twitter v2 API (free tier OK — 500 writes/month).
# Reads creds from marketing/.env. Reads tweet bodies from marketing/drafts/twitter-thread.md.
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a

: "${TWITTER_API_KEY:?missing TWITTER_API_KEY}"
: "${TWITTER_API_SECRET:?missing TWITTER_API_SECRET}"
: "${TWITTER_ACCESS_TOKEN:?missing TWITTER_ACCESS_TOKEN}"
: "${TWITTER_ACCESS_TOKEN_SECRET:?missing TWITTER_ACCESS_TOKEN_SECRET}"

# OAuth 1.0a signing in Bash is verbose; delegate to a small Node helper.
# Run via: node twitter-thread.mjs (Node 22 has built-in fetch + we sign manually)

if ! command -v node >/dev/null 2>&1; then
  echo "Node is required (uses built-in fetch + crypto)"; exit 1
fi

NODE_NO_WARNINGS=1 node --experimental-vm-modules - <<'NODE'
import { createHmac, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

const env = process.env;
const key = env.TWITTER_API_KEY, sec = env.TWITTER_API_SECRET;
const tok = env.TWITTER_ACCESS_TOKEN, tokSec = env.TWITTER_ACCESS_TOKEN_SECRET;

function pct(s) { return encodeURIComponent(s).replace(/[!*'()]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()); }
function sign(method, url, params, body) {
  const oauthParams = {
    oauth_consumer_key: key,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: tok,
    oauth_version: '1.0',
    ...params,
  };
  const sorted = Object.keys(oauthParams).sort().map(k => `${pct(k)}=${pct(oauthParams[k])}`).join('&');
  const base = `${method.toUpperCase()}&${pct(url)}&${pct(sorted)}`;
  const signingKey = `${pct(sec)}&${pct(tokSec)}`;
  const sig = createHmac('sha1', signingKey).update(base).digest('base64');
  oauthParams.oauth_signature = sig;
  const header = 'OAuth ' + Object.entries(oauthParams).filter(([k]) => k.startsWith('oauth_'))
    .sort(([a],[b]) => a < b ? -1 : 1)
    .map(([k,v]) => `${pct(k)}="${pct(v)}"`).join(', ');
  return header;
}

async function postTweet(text, replyTo = null) {
  const url = 'https://api.twitter.com/2/tweets';
  const body = { text };
  if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };
  const header = sign('POST', url, {});
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': header, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  return json.data;
}

// Parse marketing/drafts/twitter-thread.md → extract the 8 tweet bodies
const draft = readFileSync('drafts/twitter-thread.md', 'utf-8');
const tweets = [];
const re = /\*\*Tweet (\d+)[^*]*\*\*:\s*\n\n([\s\S]*?)(?=\n\n---|\n\*\*Tweet \d|$)/g;
let m;
while ((m = re.exec(draft)) !== null) tweets.push(m[2].trim());

if (tweets.length === 0) {
  console.error('No tweets found in drafts/twitter-thread.md — check the **Tweet N**: pattern');
  process.exit(1);
}

console.log(`→ Posting ${tweets.length} tweets...\n`);

let prevId = null;
for (let i = 0; i < tweets.length; i++) {
  const text = tweets[i];
  if (text.length > 280) {
    console.warn(`  ⚠ Tweet ${i+1} is ${text.length} chars (over 280). Truncating.`);
  }
  try {
    const tweet = await postTweet(text.slice(0, 280), prevId);
    const url = `https://twitter.com/${tweet.author_id || 'user'}/status/${tweet.id}`;
    console.log(`  ✓ Tweet ${i+1}: ${url}`);
    prevId = tweet.id;
  } catch (e) {
    console.error(`  ✗ Tweet ${i+1} failed:`, e.message);
    console.error(`    Resume from tweet ${i+1} manually after fixing.`);
    process.exit(1);
  }
  // Stagger to avoid rate limits
  await new Promise(r => setTimeout(r, 2000));
}

console.log('\nDone. Thread is live.');
NODE

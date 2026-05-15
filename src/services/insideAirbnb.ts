import { parse } from "csv-parse/sync";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { AirbnbListing, ScrapeOptions } from "../types/index.js";
import { normalizeCacheKey } from "./cache.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CITIES_PATH = join(__dirname, "..", "data", "cities.json");

interface CityRecord {
  displayName: string;
  aliases: string[];
  country: string;
  datasetUrl: string;
  lastSnapshot: string;
}

interface CitiesFile {
  _notes?: string;
  cities: Record<string, CityRecord>;
}

let citiesCache: CitiesFile | null = null;

function loadCities(): CitiesFile {
  if (!citiesCache) {
    const raw = readFileSync(CITIES_PATH, "utf-8");
    citiesCache = JSON.parse(raw) as CitiesFile;
  }
  return citiesCache;
}

function buildAliasIndex(): Map<string, string> {
  const index = new Map<string, string>();
  const { cities } = loadCities();
  for (const [key, rec] of Object.entries(cities)) {
    index.set(key, key);
    for (const alias of rec.aliases) {
      index.set(alias, key);
    }
    index.set(normalizeCacheKey(rec.displayName), key);
  }
  return index;
}

let aliasIndex: Map<string, string> | null = null;
function getAliasIndex(): Map<string, string> {
  if (!aliasIndex) aliasIndex = buildAliasIndex();
  return aliasIndex;
}

export function resolveCityKey(input: string): string | null {
  const normalized = normalizeCacheKey(input);
  const idx = getAliasIndex();
  if (idx.has(normalized)) return idx.get(normalized)!;
  // Try splitting on first dash and matching head (e.g. "lisbon-portugal" → "lisbon")
  const head = normalized.split("-")[0];
  if (head && idx.has(head)) return idx.get(head)!;
  return null;
}

export function isCitySupported(input: string): boolean {
  return resolveCityKey(input) !== null;
}

export function getCityRecord(input: string): (CityRecord & { key: string }) | null {
  const key = resolveCityKey(input);
  if (!key) return null;
  const rec = loadCities().cities[key];
  return rec ? { ...rec, key } : null;
}

interface OpenDataRow {
  id?: string;
  name?: string;
  listing_url?: string;
  room_type?: string;
  accommodates?: string;
  bedrooms?: string;
  beds?: string;
  bathrooms?: string;
  bathrooms_text?: string;
  price?: string;
  latitude?: string;
  longitude?: string;
  number_of_reviews?: string;
  reviews_per_month?: string;
  review_scores_rating?: string;
  host_is_superhost?: string;
  neighbourhood?: string;
  neighbourhood_cleansed?: string;
  property_type?: string;
}

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function parseNum(raw: string | undefined): number | null {
  if (raw === undefined || raw === "" || raw === "N/A") return null;
  const num = parseFloat(raw);
  return Number.isFinite(num) ? num : null;
}

function rowToListing(row: OpenDataRow): AirbnbListing {
  const price = parsePrice(row.price);
  const lat = parseNum(row.latitude);
  const lng = parseNum(row.longitude);
  const bedroomsN = parseNum(row.bedrooms);
  const reviewsN = parseNum(row.number_of_reviews) ?? 0;
  const reviewsPerMonth = parseNum(row.reviews_per_month);
  const ratingN = parseNum(row.review_scores_rating);

  return {
    id: row.id,
    title: row.name,
    name: row.name,
    url: row.listing_url || (row.id ? `https://www.airbnb.com/rooms/${row.id}` : undefined),
    roomType: row.room_type,
    type: row.property_type,
    coordinates: lat !== null && lng !== null ? { latitude: lat, longitude: lng } : undefined,
    isSuperHost: row.host_is_superhost === "t",
    reviewsCount: Math.round(reviewsN),
    reviewsPerMonth: reviewsPerMonth ?? undefined,
    rating: ratingN !== null
      ? { reviewsCount: Math.round(reviewsN), guestSatisfaction: ratingN > 5 ? ratingN / 20 : ratingN }
      : { reviewsCount: Math.round(reviewsN) },
    price: price !== null ? { amount: String(price) } : undefined,
    location: lat !== null && lng !== null
      ? { latitude: lat, longitude: lng }
      : undefined,
    // Bedrooms/bathrooms not in standard AirbnbListing top-level — stash via subDescription
    subDescription: bedroomsN !== null
      ? { items: [`${bedroomsN} bedroom${bedroomsN === 1 ? "" : "s"}`] }
      : undefined,
  };
}

const FETCH_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function downloadAndParse(url: string): Promise<AirbnbListing[]> {
  const start = Date.now();
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from open-data feed`);

  const buf = Buffer.from(await res.arrayBuffer());
  const text = url.endsWith(".gz") ? gunzipSync(buf).toString("utf-8") : buf.toString("utf-8");

  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as OpenDataRow[];

  const listings = records.map(rowToListing);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[insideAirbnb] Loaded ${listings.length} listings from feed in ${elapsed}s`);
  return listings;
}

const memoryCache = new Map<string, { listings: AirbnbListing[]; cachedAt: number }>();
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function loadListings(cityKey: string): Promise<AirbnbListing[]> {
  const cached = memoryCache.get(cityKey);
  if (cached && Date.now() - cached.cachedAt < TTL_MS) {
    return cached.listings;
  }
  const rec = loadCities().cities[cityKey];
  if (!rec) throw new Error(`Unknown city key: ${cityKey}`);
  const listings = await downloadAndParse(rec.datasetUrl);
  memoryCache.set(cityKey, { listings, cachedAt: Date.now() });
  return listings;
}

function applyFilters(listings: AirbnbListing[], opts: ScrapeOptions): AirbnbListing[] {
  return listings.filter((l) => {
    if (opts.minBedrooms !== undefined) {
      const item = l.subDescription?.items?.[0] ?? "";
      const m = item.match(/^(\d+)\s+bedroom/);
      const bedrooms = m ? parseInt(m[1], 10) : null;
      if (bedrooms === null || bedrooms < opts.minBedrooms) return false;
    }
    if (opts.propertyType && opts.propertyType !== "any") {
      const rt = (l.roomType || "").toLowerCase();
      if (opts.propertyType === "entire_home" && !rt.includes("entire")) return false;
      if (opts.propertyType === "private_room" && !rt.includes("private")) return false;
    }
    return true;
  });
}

export async function searchListings(opts: ScrapeOptions): Promise<AirbnbListing[]> {
  const key = resolveCityKey(opts.location);
  if (!key) throw new Error(`City "${opts.location}" not in open-data coverage`);
  const all = await loadListings(key);
  return applyFilters(all, opts);
}

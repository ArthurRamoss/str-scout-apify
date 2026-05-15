import { ApifyClient } from "apify-client";
import type { AirbnbListing, ScrapeOptions } from "../types/index.js";

const PRIMARY_ACTOR = "curious_coder/airbnb-scraper";
const FALLBACK_ACTOR = "memo23/airbnb-scraper";
const APIFY_TIMEOUT = 300; // seconds
const DEFAULT_COUNT = 100;

// Normalize raw scraper output (which uses snake_case fields like
// `listing_url`, `pricing_base_price`, `accommodation_bedrooms`) into the
// internal AirbnbListing shape that analysis.ts and the tools expect.
function normalize(raw: any): AirbnbListing {
  const url: string | undefined = raw.listing_url ?? raw.url;
  const idFromUrl = url ? (url.match(/\/rooms\/(\d+)/)?.[1] ?? "") : "";
  const price = Number(raw.pricing_base_price ?? raw.pricing_original_price ?? raw.booking_price ?? raw.pricing_total_price ?? 0);

  // Collect boolean amenity_* flags into FlatAmenity-style array
  const flatAmenities: Array<{ groupName: string; title: string; available: boolean }> = [];
  for (const k of Object.keys(raw)) {
    if (k.startsWith("amenity_") && raw[k] === true) {
      const title = k.slice("amenity_".length)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      flatAmenities.push({ groupName: "Amenities", title, available: true });
    }
  }
  // Also accept already-structured amenities if scraper returns them
  const structured = raw.amenities_structured ?? raw.amenities;
  const amenitiesField = flatAmenities.length > 0
    ? flatAmenities
    : Array.isArray(structured)
      ? structured
      : undefined;

  return {
    id: raw.id || idFromUrl,
    title: raw.title,
    name: raw.title ?? raw.property_name,
    url: url ?? (idFromUrl ? `https://www.airbnb.com/rooms/${idFromUrl}` : undefined),
    propertyUrl: url,
    roomType: raw.room_type,
    type: raw.property_type,
    coordinates: (raw.location_latitude && raw.location_longitude)
      ? { latitude: Number(raw.location_latitude), longitude: Number(raw.location_longitude) }
      : undefined,
    location: (raw.location_latitude && raw.location_longitude)
      ? { latitude: Number(raw.location_latitude), longitude: Number(raw.location_longitude) }
      : undefined,
    isSuperHost: Boolean(raw.host_is_superhost),
    starRating: Number(raw.review_overall_rating ?? raw.review_guest_satisfaction_overall ?? 0) || undefined,
    reviewsCount: Number(raw.review_count ?? 0),
    rating: {
      reviewsCount: Number(raw.review_count ?? 0),
      guestSatisfaction: Number(raw.review_guest_satisfaction_overall ?? raw.review_overall_rating ?? 0) || undefined,
      accuracy: Number(raw.review_accuracy ?? 0) || undefined,
      cleanliness: Number(raw.review_cleanliness ?? 0) || undefined,
      communication: Number(raw.review_communication ?? 0) || undefined,
      location: Number(raw.review_location ?? 0) || undefined,
      value: Number(raw.review_value ?? 0) || undefined,
    },
    host: {
      id: raw.host_id,
      name: raw.host_name,
      isSuperHost: Boolean(raw.host_is_superhost),
    },
    hostDetails: {
      id: raw.host_id,
      name: raw.host_name,
      isSuperhost: Boolean(raw.host_is_superhost),
    },
    price: price > 0
      ? { amount: String(price) }
      : undefined,
    costPerNight: price > 0 ? price : null,
    amenities: amenitiesField,
    // Stash bedroom info for searchListings extractor fallback
    subDescription: typeof raw.accommodation_bedrooms === "number"
      ? { items: [`${raw.accommodation_bedrooms} bedroom${raw.accommodation_bedrooms === 1 ? "" : "s"}`] }
      : undefined,
    bedInfo: raw.accommodation_bedrooms != null
      ? `${raw.accommodation_bedrooms} bedrooms, ${raw.accommodation_beds ?? "?"} beds, ${raw.accommodation_bathrooms ?? "?"} baths`
      : undefined,
    maxGuestCapacity: typeof raw.accommodation_guests === "number" ? raw.accommodation_guests : undefined,
  };
}

let client: ApifyClient | null = null;

function getClient(): ApifyClient {
  if (!client) {
    // Prefer an operator-supplied token for child Actor calls so scraper
    // costs can be routed to a separate account from the Actor's owner.
    // Overriding APIFY_TOKEN itself breaks Actor.charge() PPE billing,
    // so we keep that env var alone and look for a sibling override.
    const token =
      process.env.SCRAPER_APIFY_TOKEN ||
      process.env.STARTER_APIFY_TOKEN ||
      process.env.APIFY_TOKEN;
    if (!token) {
      throw new Error(
        "Neither SCRAPER_APIFY_TOKEN, STARTER_APIFY_TOKEN, nor APIFY_TOKEN configured",
      );
    }
    client = new ApifyClient({ token });
  }
  return client;
}

// Build Airbnb search URL from location string
function buildSearchUrl(options: ScrapeOptions): string {
  const { location, minBedrooms, checkIn, checkOut } = options;
  const encoded = encodeURIComponent(location);
  const slug = location.replace(/[,\s]+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");

  let url = `https://www.airbnb.com/s/${slug}/homes?query=${encoded}&tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&currency=USD`;

  const bedrooms = minBedrooms ?? 1; // default filter to reduce cost
  url += `&min_bedrooms=${bedrooms}`;

  if (checkIn) url += `&checkin=${checkIn}`;
  if (checkOut) url += `&checkout=${checkOut}`;

  return url;
}

// Primary: curious_coder/airbnb-scraper
// Input: urls[], count, currency, scrapeDetail
async function scrapePrimary(options: ScrapeOptions): Promise<AirbnbListing[]> {
  const apify = getClient();
  const searchUrl = buildSearchUrl(options);
  const count = Number(process.env.APIFY_MAX_RESULTS) || DEFAULT_COUNT;

  console.log(`[apify] PRIMARY (${PRIMARY_ACTOR}) — "${options.location}", count=${count}`);
  const startTime = Date.now();

  const run = await apify.actor(PRIMARY_ACTOR).call(
    {
      urls: [searchUrl],
      currency: "USD",
      scrapeDetail: true,
      scrapeAvailability: true,
      scrapeReviews: false,
      count,
    },
    { timeout: APIFY_TIMEOUT }
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  console.log(
    `[apify] PRIMARY: ${items.length} listings in ${elapsed}s (cost: $${run.usageTotalUsd ?? "?"})`
  );

  if (items.length === 0) {
    throw new Error("Primary scraper returned 0 results");
  }

  return (items as any[]).map(normalize);
}

// Fallback: memo23/airbnb-scraper
// Input: startUrls[], maxItems, adults
async function scrapeFallback(options: ScrapeOptions): Promise<AirbnbListing[]> {
  const apify = getClient();
  const searchUrl = buildSearchUrl(options);
  const maxItems = Number(process.env.APIFY_MAX_RESULTS) || DEFAULT_COUNT;

  console.log(`[apify] FALLBACK (${FALLBACK_ACTOR}) — "${options.location}", maxItems=${maxItems}`);
  const startTime = Date.now();

  const run = await apify.actor(FALLBACK_ACTOR).call(
    {
      startUrls: [{ url: searchUrl }],
      maxItems,
      adults: 2,
    },
    { timeout: APIFY_TIMEOUT }
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  console.log(
    `[apify] FALLBACK: ${items.length} listings in ${elapsed}s (cost: $${run.usageTotalUsd ?? "?"})`
  );

  return (items as any[]).map(normalize);
}

// Main entry: try primary, fallback on failure
export async function scrapeAirbnbListings(
  options: ScrapeOptions
): Promise<AirbnbListing[]> {
  let primaryMsg = "";

  // Try primary scraper
  try {
    return await scrapePrimary(options);
  } catch (primaryError: any) {
    primaryMsg = primaryError.message;
    console.warn(`[apify] Primary failed: ${primaryMsg}`);
  }

  // Try fallback scraper
  try {
    return await scrapeFallback(options);
  } catch (fallbackError: any) {
    console.error(`[apify] Fallback also failed: ${fallbackError.message}`);
    throw new Error(
      `Both scrapers failed for "${options.location}". Primary: ${primaryMsg}. Fallback: ${fallbackError.message}`
    );
  }
}

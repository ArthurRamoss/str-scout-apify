import { Actor } from "apify";
import { z } from "zod";
import type { AirbnbListing, CompactListing, SearchListingsResult } from "../types/index.js";
import { getListings } from "../services/dataSource.js";
import { searchListingsSchema } from "../schemas/index.js";
import type { ToolResponse } from "./marketAnalysis.js";

export type SearchListingsInput = z.infer<typeof searchListingsSchema>;

function extractPrice(l: AirbnbListing): number | null {
  if (typeof l.costPerNight === "number" && l.costPerNight > 0) return l.costPerNight;
  if (l.price && typeof l.price === "object") {
    if (l.price.amount) {
      const n = parseFloat(String(l.price.amount).replace(/[^\d.]/g, ""));
      if (Number.isFinite(n) && n > 0) return n;
    }
    if (l.price.label) {
      const m = String(l.price.label).match(/\$?([\d,]+)/);
      if (m) {
        const n = parseFloat(m[1].replace(/,/g, ""));
        if (Number.isFinite(n) && n > 0) return n;
      }
    }
  }
  if (typeof l.pricing === "number" && l.pricing > 0) return l.pricing;
  if (l.pricing?.rate?.amount) return l.pricing.rate.amount;
  if (typeof l.originalPrice === "string") {
    const n = parseFloat(l.originalPrice.replace(/[^\d.]/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function extractRating(l: AirbnbListing): number | null {
  if (typeof l.starRating === "number" && l.starRating > 0) return l.starRating;
  if (l.rating?.guestSatisfaction) return l.rating.guestSatisfaction;
  // Parse from title like "... ★4.95 · ..."
  const titleMatch = (l.title ?? l.name ?? "").match(/★\s*(\d+(?:\.\d+)?)/);
  if (titleMatch) {
    const n = parseFloat(titleMatch[1]);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function extractBedrooms(l: AirbnbListing): number | null {
  // Try title: "... · 2 bedrooms · ..."
  const fromTitle = (l.title ?? l.name ?? "").match(/(\d+)\s+bedroom/i);
  if (fromTitle) return parseInt(fromTitle[1], 10);
  // Try bedInfo / subDescription
  const item = l.subDescription?.items?.[0] ?? l.bedInfo ?? "";
  const m = item.match(/(\d+)\s+bedroom/i);
  return m ? parseInt(m[1], 10) : null;
}

function extractBathrooms(l: AirbnbListing): number | null {
  const text = (l.title ?? l.name ?? l.bedInfo ?? "");
  const m = text.match(/(\d+(?:\.\d+)?)\s+(?:private\s+)?bath/i);
  return m ? parseFloat(m[1]) : null;
}

function extractReviewCount(l: AirbnbListing): number {
  if (typeof l.reviewsCount === "number") return l.reviewsCount;
  if (l.rating?.reviewsCount) return l.rating.reviewsCount;
  return 0;
}

function extractId(l: AirbnbListing): string {
  if (l.id) return l.id;
  // Try to parse from url/propertyUrl
  const url = l.url ?? l.propertyUrl ?? "";
  const m = url.match(/\/rooms\/(\d+)/);
  return m ? m[1] : "";
}

function toCompact(l: AirbnbListing): CompactListing {
  const lat = l.coordinates?.latitude ?? l.location?.latitude ?? null;
  const lng = l.coordinates?.longitude ?? l.location?.longitude ?? null;
  const id = extractId(l);
  return {
    id,
    name: l.title ?? l.name ?? "Unnamed listing",
    url: l.url ?? l.propertyUrl ?? (id ? `https://www.airbnb.com/rooms/${id}` : ""),
    pricePerNight: extractPrice(l),
    bedrooms: extractBedrooms(l),
    bathrooms: extractBathrooms(l),
    rating: extractRating(l),
    reviewCount: extractReviewCount(l),
    isSuperhost: Boolean(l.isSuperHost ?? l.host?.isSuperHost ?? l.hostDetails?.isSuperhost ?? false),
    lat,
    lng,
  };
}

function applyClientFilters(
  listings: AirbnbListing[],
  input: SearchListingsInput,
): AirbnbListing[] {
  return listings.filter((l) => {
    const price = extractPrice(l);
    if (input.minPrice !== undefined && (price === null || price < input.minPrice)) return false;
    if (input.maxPrice !== undefined && (price === null || price > input.maxPrice)) return false;
    if (input.bathrooms !== undefined) {
      const b = extractBathrooms(l);
      if (b === null || b < input.bathrooms) return false;
    }
    return true;
  });
}

export async function handleSearchListings(
  args: unknown,
): Promise<ToolResponse<SearchListingsResult>> {
  try {
    await Actor.charge({ eventName: "tool-call-search-listings" });
  } catch (err: any) {
    console.error(`[charge] failed but continuing: ${err.message}`);
  }
  const input = searchListingsSchema.parse(args);

  const { listings, dataFreshness } = await getListings({
    location: input.city,
    minBedrooms: input.bedrooms,
    propertyType: input.propertyType,
  });

  const filtered = applyClientFilters(listings, input);
  const trimmed = filtered.slice(0, input.limit);
  const compact = trimmed.map(toCompact);

  const result: SearchListingsResult = {
    city: input.city,
    dataFreshness,
    count: compact.length,
    listings: compact,
  };

  return {
    content: [
      { type: "text", text: `${compact.length} listings in ${input.city} (data: ${dataFreshness})` },
    ],
    structuredContent: result,
  };
}

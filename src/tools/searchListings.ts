import { Actor } from "apify";
import { z } from "zod";
import type { AirbnbListing, CompactListing, SearchListingsResult } from "../types/index.js";
import { getListings } from "../services/dataSource.js";
import { searchListingsSchema } from "../schemas/index.js";
import type { ToolResponse } from "./marketAnalysis.js";

export type SearchListingsInput = z.infer<typeof searchListingsSchema>;

function extractPrice(l: AirbnbListing): number | null {
  if (typeof l.price === "object" && l.price?.amount) {
    const n = parseFloat(String(l.price.amount).replace(/[^\d.]/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (typeof l.price === "object" && l.price?.label) {
    const m = String(l.price.label).match(/\$?([\d,]+)/);
    if (m) {
      const n = parseFloat(m[1].replace(/,/g, ""));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  if (typeof l.pricing === "number" && l.pricing > 0) return l.pricing;
  return null;
}

function extractRating(l: AirbnbListing): number | null {
  if (l.rating?.guestSatisfaction) return l.rating.guestSatisfaction;
  if (typeof l.starRating === "number") return l.starRating;
  return null;
}

function extractBedrooms(l: AirbnbListing): number | null {
  const item = l.subDescription?.items?.[0] ?? "";
  const m = item.match(/^(\d+)\s+bedroom/);
  return m ? parseInt(m[1], 10) : null;
}

function extractBathrooms(_l: AirbnbListing): number | null {
  return null;
}

function toCompact(l: AirbnbListing): CompactListing {
  const lat = l.coordinates?.latitude ?? l.location?.latitude ?? null;
  const lng = l.coordinates?.longitude ?? l.location?.longitude ?? null;
  return {
    id: l.id ?? "",
    name: l.title ?? l.name ?? "Unnamed listing",
    url: l.url ?? l.propertyUrl ?? (l.id ? `https://www.airbnb.com/rooms/${l.id}` : ""),
    pricePerNight: extractPrice(l),
    bedrooms: extractBedrooms(l),
    bathrooms: extractBathrooms(l),
    rating: extractRating(l),
    reviewCount: l.reviewsCount ?? l.rating?.reviewsCount ?? 0,
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

import type { AirbnbListing, DataFreshness, ScrapeOptions } from "../types/index.js";
import * as openData from "./insideAirbnb.js";
import { scrapeAirbnbListings } from "./apify.js";
import { getCachedListings, saveToCache } from "./cache.js";

export interface DataSourceResult {
  listings: AirbnbListing[];
  source: "open-data" | "live-scrape";
  dataFreshness: DataFreshness;
  cachedAt: string | null;
  amenityDataAvailable: boolean;
}

export async function getListings(opts: ScrapeOptions): Promise<DataSourceResult> {
  if (openData.isCitySupported(opts.location)) {
    try {
      const listings = await openData.searchListings(opts);
      if (listings.length > 0) {
        return {
          listings,
          source: "open-data",
          dataFreshness: "cached_48h",
          cachedAt: null,
          amenityDataAvailable: false,
        };
      }
      console.warn(`[dataSource] open-data returned 0 listings for "${opts.location}", falling back to scraper`);
    } catch (err: any) {
      console.warn(`[dataSource] open-data failed: ${err.message}, falling back to scraper`);
    }
  }

  const cached = await getCachedListings(opts.location);
  if (cached) {
    return {
      listings: cached.listings,
      source: "live-scrape",
      dataFreshness: cached.dataFreshness,
      cachedAt: cached.cachedAt,
      amenityDataAvailable: true,
    };
  }

  const fresh = await scrapeAirbnbListings(opts);
  await saveToCache(opts.location, fresh);
  return {
    listings: fresh,
    source: "live-scrape",
    dataFreshness: "live",
    cachedAt: null,
    amenityDataAvailable: true,
  };
}

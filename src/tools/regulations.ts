import { Actor } from "apify";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { z } from "zod";
import type { RegulationRecord, RegulationStatus } from "../types/index.js";
import { regulationsSchema } from "../schemas/index.js";
import { normalizeCacheKey } from "../services/cache.js";
import type { ToolResponse } from "./marketAnalysis.js";

export type RegulationsInput = z.infer<typeof regulationsSchema>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGS_PATH = join(__dirname, "..", "data", "regulations.json");

interface RegsFile {
  _notes?: string;
  records: Record<string, RegulationRecord>;
}

let regsCache: RegsFile | null = null;
let aliasIndex: Map<string, string> | null = null;

function loadRegs(): RegsFile {
  if (!regsCache) {
    regsCache = JSON.parse(readFileSync(REGS_PATH, "utf-8")) as RegsFile;
  }
  return regsCache;
}

function buildAliasIndex(): Map<string, string> {
  const idx = new Map<string, string>();
  for (const [key, rec] of Object.entries(loadRegs().records)) {
    idx.set(key, key);
    idx.set(normalizeCacheKey(rec.city), key);
    // First word of city (e.g. "New York, NY" -> "new")
    const head = normalizeCacheKey(rec.city.split(",")[0] ?? rec.city);
    idx.set(head, key);
  }
  return idx;
}

function getIndex(): Map<string, string> {
  if (!aliasIndex) aliasIndex = buildAliasIndex();
  return aliasIndex;
}

export function lookupRegulation(input: RegulationsInput): RegulationRecord | null {
  const { city, state, country } = input;
  const idx = getIndex();
  const candidates = [
    state ? `${city}-${state}` : null,
    `${city}-${country}`,
    city,
  ]
    .filter((s): s is string => Boolean(s))
    .map(normalizeCacheKey);

  for (const cand of candidates) {
    if (idx.has(cand)) return loadRegs().records[idx.get(cand)!];
  }
  return null;
}

function unknownRecord(input: RegulationsInput): RegulationRecord {
  return {
    city: input.city,
    country: input.country,
    status: "unknown" as RegulationStatus,
    summary: `No regulatory record on file for ${input.city}. Consult the local jurisdiction's housing or tourism office before transacting.`,
    details: {
      licenseRequired: null,
      licenseType: null,
      ownerOccupancyRequired: null,
      nightLimit: null,
      feeUsd: null,
      renewalMonths: null,
    },
    sources: [],
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

export async function handleRegulations(
  args: unknown,
): Promise<ToolResponse<RegulationRecord>> {
  try {
    await Actor.charge({ eventName: "tool-call-regulations" });
  } catch (err: any) {
    console.error(`[charge] failed but continuing: ${err.message}`);
  }
  const input = regulationsSchema.parse(args);
  const record = lookupRegulation(input) ?? unknownRecord(input);
  return {
    content: [{ type: "text", text: `${record.city}: ${record.status} — ${record.summary}` }],
    structuredContent: record,
  };
}

import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;
let _leadEngineDb: ReturnType<typeof drizzle> | null = null;
let _leadEngineDbMeta: LeadEngineDbMeta | null = null;

const CONNECTIVITY_ERROR_PATTERNS = [
  /ETIMEDOUT/i,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /EHOSTUNREACH/i,
  /ENETUNREACH/i,
  /ECONNRESET/i,
  /network\s+error/i,
  /failed to fetch/i,
  /connection\s+refused/i,
];

function walkErrorChain(err: unknown): Error[] {
  const out: Error[] = [];
  let current: unknown = err;
  for (let depth = 0; depth < 8 && current != null; depth++) {
    if (current instanceof Error) out.push(current);
    current = (current as { cause?: unknown }).cause;
  }
  return out;
}

export function getLeadEngineDatabaseConnectivityCode(err: unknown): string | undefined {
  for (const e of walkErrorChain(err)) {
    const code = (e as NodeJS.ErrnoException).code;
    if (typeof code === "string") return code;
    for (const pattern of CONNECTIVITY_ERROR_PATTERNS) {
      if (pattern.test(e.message)) return pattern.source.replace(/[\\^$]/g, "").toUpperCase();
    }
  }
  return undefined;
}

export function isLeadEngineDatabaseConnectivityError(err: unknown): boolean {
  for (const e of walkErrorChain(err)) {
    const code = (e as NodeJS.ErrnoException).code;
    if (typeof code === "string" && CONNECTIVITY_ERROR_PATTERNS.some(p => p.test(code))) return true;
    if (CONNECTIVITY_ERROR_PATTERNS.some(p => p.test(e.message))) return true;
  }
  return false;
}

export type LeadEngineDbMeta = {
  available: boolean;
  source: "turso" | "none";
  reason?: "missing_url" | "missing_auth_token" | "database_unavailable" | "missing_table";
  tableReady?: boolean;
};

export function invalidateLeadEngineDbCache(): void {
  _client?.close();
  _client = null;
  _leadEngineDb = null;
  _leadEngineDbMeta = null;
}

function selectTursoCredentials(): { url: string | null; authToken: string | null; meta: LeadEngineDbMeta } {
  const url = process.env.TURSO_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url) {
    return { url: null, authToken: null, meta: { available: false, source: "none", reason: "missing_url" } };
  }
  if (!authToken) {
    return { url: null, authToken: null, meta: { available: false, source: "none", reason: "missing_auth_token" } };
  }
  return { url, authToken, meta: { available: true, source: "turso" } };
}

async function verifyLeadEngineTables(client: Client): Promise<boolean> {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='lead_engine_leads'"
  );
  return result.rows.length > 0;
}

export function getLeadEngineDbMeta(): LeadEngineDbMeta {
  if (_leadEngineDbMeta) return _leadEngineDbMeta;
  return selectTursoCredentials().meta;
}

/**
 * Lead Engine uses Turso (libSQL). Credentials are read from:
 *   TURSO_URL        — libsql://... remote URL
 *   TURSO_AUTH_TOKEN — JWT auth token
 */
export async function getLeadEngineDb() {
  const selected = selectTursoCredentials();
  _leadEngineDbMeta = selected.meta;

  if (!selected.url || !selected.authToken) {
    console.warn("[LeadEngine][db] unavailable", _leadEngineDbMeta);
    return null;
  }

  if (!_client) {
    try {
      console.info("[LeadEngine][db] connecting to Turso", { url: selected.url });
      _client = createClient({ url: selected.url, authToken: selected.authToken });
      _leadEngineDb = drizzle(_client);
      const tableReady = await verifyLeadEngineTables(_client);
      _leadEngineDbMeta = {
        ...selected.meta,
        available: tableReady,
        tableReady,
        reason: tableReady ? undefined : "missing_table",
      };
      if (!tableReady) {
        console.warn("[LeadEngine][db] missing required table lead_engine_leads");
        _client.close();
        _client = null;
        _leadEngineDb = null;
        return null;
      }
    } catch (error) {
      console.warn("[LeadEngine][db] Failed to connect:", error);
      _client?.close();
      _client = null;
      _leadEngineDb = null;
      _leadEngineDbMeta = { ...selected.meta, available: false, reason: "database_unavailable" };
    }
  }

  return _leadEngineDb;
}

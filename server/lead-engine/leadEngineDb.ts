import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { isSupabaseDatabaseDisabled } from "../db";

let _pool: Pool | null = null;
let _leadEngineDb: ReturnType<typeof drizzle> | null = null;
let _leadEngineDbMeta: LeadEngineDbMeta | null = null;

const CONNECTIVITY_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ECONNRESET",
  "EPIPE",
  "PROTOCOL_CONNECTION_LOST",
]);

function walkErrorChain(err: unknown): Error[] {
  const out: Error[] = [];
  let current: unknown = err;
  for (let depth = 0; depth < 8 && current != null; depth++) {
    if (current instanceof Error) out.push(current);
    const next =
      current instanceof Error && current.cause != null
        ? current.cause
        : (current as { cause?: unknown }).cause;
    current = next;
  }
  return out;
}

/** Best-effort errno / code string for logs (avoids dumping full Drizzle stacks). */
export function getLeadEngineDatabaseConnectivityCode(err: unknown): string | undefined {
  for (const e of walkErrorChain(err)) {
    const code = (e as NodeJS.ErrnoException).code;
    if (typeof code === "string" && CONNECTIVITY_ERROR_CODES.has(code)) {
      return code;
    }
    const pgCode = (e as { code?: string }).code;
    if (typeof pgCode === "string" && /^[0-9A-Z]{5}$/.test(pgCode)) {
      return pgCode;
    }
  }
  for (const e of walkErrorChain(err)) {
    if (/connect\s+ETIMEDOUT|ETIMEDOUT/i.test(e.message)) return "ETIMEDOUT";
    if (/ECONNREFUSED/i.test(e.message)) return "ECONNREFUSED";
    if (/ENOTFOUND/i.test(e.message)) return "ENOTFOUND";
  }
  return undefined;
}

export function isLeadEngineDatabaseConnectivityError(err: unknown): boolean {
  for (const e of walkErrorChain(err)) {
    const code = (e as NodeJS.ErrnoException).code;
    if (typeof code === "string" && CONNECTIVITY_ERROR_CODES.has(code)) {
      return true;
    }
    if (/connect\s+ETIMEDOUT|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(e.message)) {
      return true;
    }
  }
  return false;
}

export function invalidateLeadEngineDbCache(): void {
  void _pool
    ?.end()
    .catch(() => {
      /* ignore */
    });
  _pool = null;
  _leadEngineDb = null;
  _leadEngineDbMeta = null;
}

function isPostgresUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.startsWith("postgres://") || u.startsWith("postgresql://");
}

function looksLikeMySqlUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.startsWith("mysql://") || u.startsWith("mysql2://");
}

export type LeadEngineDbMeta = {
  available: boolean;
  source: "lead_engine_database_url" | "database_url" | "none";
  reason?:
    | "missing_url"
    | "invalid_database_url"
    | "invalid_lead_engine_database_url"
    | "database_unavailable"
    | "missing_table"
    | "supabase_paused";
  tableReady?: boolean;
  chosenUrlKind?: "postgres" | "mysql" | "other" | "none";
};

function selectLeadEngineDatabaseUrl(): { url: string | null; meta: LeadEngineDbMeta } {
  if (isSupabaseDatabaseDisabled()) {
    return {
      url: null,
      meta: {
        available: false,
        source: "none",
        reason: "supabase_paused",
        chosenUrlKind: "none",
      },
    };
  }

  const explicit = process.env.LEAD_ENGINE_DATABASE_URL?.trim();
  const fallback = process.env.DATABASE_URL?.trim();

  if (explicit) {
    if (!isPostgresUrl(explicit)) {
      return {
        url: null,
        meta: {
          available: false,
          source: "lead_engine_database_url",
          reason: "invalid_lead_engine_database_url",
          chosenUrlKind: looksLikeMySqlUrl(explicit) ? "mysql" : "other",
        },
      };
    }
    return {
      url: explicit,
      meta: { available: true, source: "lead_engine_database_url", chosenUrlKind: "postgres" },
    };
  }

  if (fallback) {
    if (!isPostgresUrl(fallback)) {
      return {
        url: null,
        meta: {
          available: false,
          source: "database_url",
          reason: "invalid_database_url",
          chosenUrlKind: looksLikeMySqlUrl(fallback) ? "mysql" : "other",
        },
      };
    }
    return {
      url: fallback,
      meta: { available: true, source: "database_url", chosenUrlKind: "postgres" },
    };
  }

  return {
    url: null,
    meta: { available: false, source: "none", reason: "missing_url", chosenUrlKind: "none" },
  };
}

async function verifyLeadEngineTables(db: ReturnType<typeof drizzle>): Promise<boolean> {
  const result = await db.execute(sql`select to_regclass('public.lead_engine_leads') as lead_engine_leads`);
  const row = Array.isArray(result) ? result[0] : (result as { rows?: unknown[] }).rows?.[0];
  const value = row && typeof row === "object" ? (row as Record<string, unknown>).lead_engine_leads : null;
  return Boolean(value);
}

export function getLeadEngineDbMeta(): LeadEngineDbMeta {
  if (_leadEngineDbMeta) return _leadEngineDbMeta;
  return selectLeadEngineDatabaseUrl().meta;
}

/**
 * Lead Engine uses PostgreSQL (Supabase). Connection string priority:
 * 1. `LEAD_ENGINE_DATABASE_URL` if set (must be Postgres)
 * 2. else `DATABASE_URL` only if it is also Postgres
 */
export async function getLeadEngineDb() {
  const selected = selectLeadEngineDatabaseUrl();
  _leadEngineDbMeta = selected.meta;
  if (!selected.url) {
    console.warn("[LeadEngine][db] unavailable", _leadEngineDbMeta);
    return null;
  }

  if (!_pool) {
    try {
      console.info("[LeadEngine][db] connecting", { source: selected.meta.source, kind: selected.meta.chosenUrlKind });
      _pool = new Pool({ connectionString: selected.url, max: 10 });
      _leadEngineDb = drizzle({ client: _pool });
      const tableReady = await verifyLeadEngineTables(_leadEngineDb);
      _leadEngineDbMeta = { ...selected.meta, available: tableReady, tableReady, reason: tableReady ? undefined : "missing_table" };
      if (!tableReady) {
        console.warn("[LeadEngine][db] missing required table lead_engine_leads");
        await _pool.end().catch(() => undefined);
        _pool = null;
        _leadEngineDb = null;
        return null;
      }
    } catch (error) {
      console.warn("[LeadEngine][db] Failed to create/verify pool:", error);
      _pool = null;
      _leadEngineDb = null;
      _leadEngineDbMeta = { ...selected.meta, available: false, reason: "database_unavailable" };
    }
  }
  return _leadEngineDb;
}

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let _pool: Pool | null = null;
let _leadEngineDb: ReturnType<typeof drizzle> | null = null;

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
}

function isPostgresUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.startsWith("postgres://") || u.startsWith("postgresql://");
}

/**
 * Lead Engine uses PostgreSQL (Supabase). Connection string priority:
 * 1. `LEAD_ENGINE_DATABASE_URL` if set (Postgres only)
 * 2. else `DATABASE_URL` if it looks like Postgres
 */
export async function getLeadEngineDb() {
  const explicit = process.env.LEAD_ENGINE_DATABASE_URL?.trim();
  const fallback = process.env.DATABASE_URL?.trim();
  const url = explicit && isPostgresUrl(explicit) ? explicit : fallback && isPostgresUrl(fallback) ? fallback : null;
  if (!url) {
    if (explicit && !isPostgresUrl(explicit)) {
      console.warn("[LeadEngine] LEAD_ENGINE_DATABASE_URL must be a postgres:// or postgresql:// URL.");
    }
    return null;
  }

  if (!_pool) {
    try {
      _pool = new Pool({ connectionString: url, max: 10 });
      _leadEngineDb = drizzle({ client: _pool });
    } catch (error) {
      console.warn("[LeadEngine] Failed to create pool:", error);
      _pool = null;
      _leadEngineDb = null;
    }
  }
  return _leadEngineDb;
}

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

/** Drop cached Drizzle client so the next `getDb()` creates a new connection pool (e.g. after ETIMEDOUT). */
export function invalidateDbCache(): void {
  _db = null;
}

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

/** Best-effort errno string for logs (avoids dumping full Drizzle stacks). */
export function getDatabaseConnectivityCode(err: unknown): string | undefined {
  for (const e of walkErrorChain(err)) {
    const code = (e as NodeJS.ErrnoException).code;
    if (typeof code === "string" && CONNECTIVITY_ERROR_CODES.has(code)) {
      return code;
    }
  }
  for (const e of walkErrorChain(err)) {
    if (/connect\s+ETIMEDOUT|ETIMEDOUT/i.test(e.message)) return "ETIMEDOUT";
    if (/ECONNREFUSED/i.test(e.message)) return "ECONNREFUSED";
    if (/ENOTFOUND/i.test(e.message)) return "ENOTFOUND";
  }
  return undefined;
}

/** True if the error (or nested `cause`) looks like a network / MySQL reachability failure. */
export function isDatabaseConnectivityError(err: unknown): boolean {
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

let _databaseTargetLogged = false;

/** When `DISABLE_SUPABASE_DB` is exactly `"true"`, skip creating any DB pool (paused / disconnected Supabase). */
export function isSupabaseDatabaseDisabled(): boolean {
  return process.env.DISABLE_SUPABASE_DB === "true";
}

function defaultPortForDatabaseUrl(protocol: string): string {
  const p = protocol.toLowerCase();
  if (p === "mysql:" || p === "mysql2:") return "3306";
  if (p === "postgres:" || p === "postgresql:") return "5432";
  return "default";
}

/**
 * Parse DATABASE_URL for safe logging only. Never returns username/password.
 * Returns null if the string is not a valid URL with a hostname.
 */
function parseDatabaseTargetSafe(raw: string): { host: string; port: string; database?: string } | null {
  try {
    const u = new URL(raw);
    const host = u.hostname?.trim();
    if (!host) return null;
    const port = u.port || defaultPortForDatabaseUrl(u.protocol);
    const pathSeg = u.pathname.replace(/^\//, "").trim();
    let database: string | undefined;
    if (pathSeg) {
      const first = pathSeg.split("/")[0] ?? pathSeg;
      try {
        database = decodeURIComponent(first);
      } catch {
        database = first;
      }
      if (!database) database = undefined;
    }
    return { host, port, database };
  } catch {
    return null;
  }
}

/**
 * Once per process: log DB host, port, and database name (if present). No credentials, no full URL.
 */
export function logDatabaseTargetAtStartup(): void {
  if (_databaseTargetLogged) return;
  _databaseTargetLogged = true;

  if (isSupabaseDatabaseDisabled()) {
    console.warn(
      "[Database] DISABLE_SUPABASE_DB=true — database connections skipped (Supabase paused)."
    );
    return;
  }

  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    console.warn(
      "[Database] DATABASE_URL is missing or empty — cannot log connection target."
    );
    return;
  }

  const parsed = parseDatabaseTargetSafe(raw);
  if (!parsed) {
    console.warn(
      "[Database] DATABASE_URL is present but malformed — cannot parse host/port/database for logging."
    );
    return;
  }

  const dbPart = parsed.database ? ` database=${parsed.database}` : "";
  console.log(`[Database] Target host=${parsed.host} port=${parsed.port}${dbPart}`);
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (isSupabaseDatabaseDisabled()) {
    return null;
  }
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

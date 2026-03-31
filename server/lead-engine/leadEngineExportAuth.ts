import type { Request } from "express";
import { sdk } from "../_core/sdk";

/**
 * When true, POST /api/leads/export requires a valid session (same cookie as tRPC auth).
 * - Explicit "true" / "false" always wins.
 * - Default: required in production, optional in development (so local Lead Engine works without OAuth).
 */
export function leadEngineExportRequiresAuth(): boolean {
  const raw = process.env.LEAD_ENGINE_EXPORT_REQUIRE_AUTH?.trim().toLowerCase();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return process.env.NODE_ENV === "production";
}

export async function assertLeadEngineExportAuth(req: Request): Promise<void> {
  if (!leadEngineExportRequiresAuth()) {
    return;
  }
  await sdk.authenticateRequest(req);
}

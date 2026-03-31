import type { Request } from "express";
import { sdk } from "../_core/sdk";

/**
 * When true, POST /api/leads/export requires a valid session (same cookie as tRPC auth).
 * - Explicit LEAD_ENGINE_EXPORT_REQUIRE_AUTH=true / false always wins.
 * - Default false: matches public GET /api/leads for the mock Lead Engine (browse + export without login).
 * - Set to true in production when lead data is sensitive or per-tenant.
 */
export function leadEngineExportRequiresAuth(): boolean {
  const raw = process.env.LEAD_ENGINE_EXPORT_REQUIRE_AUTH?.trim().toLowerCase();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return false;
}

export async function assertLeadEngineExportAuth(req: Request): Promise<void> {
  if (!leadEngineExportRequiresAuth()) {
    return;
  }
  await sdk.authenticateRequest(req);
}

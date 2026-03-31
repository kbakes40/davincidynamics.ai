import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import type { PipelineStage } from "../../shared/lead-engine-types";
import { leadEngineImportBatches, leadEngineLeads } from "../../drizzle/leadEngineSchema";
import { registerLeadsExportRoute } from "./leadsExportRoute";
import type { GooglePlacesSearchInput } from "./googlePlaces";
import {
  assignAgentQueueStub,
  cancelJobApi,
  checkWebsiteBatchLeadIds,
  checkWebsiteForLeadId,
  getAnalyticsOverviewApi,
  getDashboardOverviewApi,
  getJobApi,
  getLeadDetailApi,
  importGooglePlacesToLeadEngine,
  importLeadsFromCsv,
  listImportBatchesApi,
  listJobsApi,
  listLeadsApi,
  patchLeadPipelineStageApi,
  getOutreachQueueApi,
  requireLeadEngineDb,
  runDedupeReportApi,
  scoreAllLeads,
  scoreLeadById,
  validateLeadEmailForLead,
} from "./leadEngineRepo";

function json(res: Response, body: unknown, status = 200) {
  res.status(status).json(body);
}

function parseStage(s: string | undefined): PipelineStage | undefined {
  const allowed: PipelineStage[] = [
    "new_lead",
    "verified",
    "site_reviewed",
    "outreach_ready",
    "contacted",
    "follow_up",
    "closed_won",
    "closed_lost",
  ];
  return allowed.includes(s as PipelineStage) ? (s as PipelineStage) : undefined;
}

/**
 * Lead Engine REST API — backed by MySQL (`lead_engine_*` tables).
 */
export function registerLeadEngineRoutes(app: Express): void {
  registerLeadsExportRoute(app);

  app.get("/api/lead-engine/dashboard", async (_req: Request, res: Response) => {
    json(res, await getDashboardOverviewApi());
  });

  app.get("/api/lead-engine/analytics", async (_req: Request, res: Response) => {
    json(res, await getAnalyticsOverviewApi());
  });

  app.get("/api/dashboard/overview", async (_req: Request, res: Response) => {
    json(res, await getDashboardOverviewApi());
  });

  app.get("/api/jobs", async (_req: Request, res: Response) => {
    json(res, await listJobsApi());
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    const row = await getJobApi(req.params.id);
    if (!row) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, row);
  });

  app.post("/api/jobs", async (req: Request, res: Response) => {
    const db = await requireLeadEngineDb();
    if (!db) {
      json(res, { error: "database_unavailable" }, 503);
      return;
    }
    const id = nanoid();
    await db.insert(leadEngineImportBatches).values({
      id,
      sourceName: typeof req.body?.source === "string" ? req.body.source : "manual",
      fileName: typeof req.body?.niche === "string" ? req.body.niche : null,
      status: "pending",
      totalRows: 0,
    });
    json(res, { ok: true, jobId: id });
  });

  app.post("/api/jobs/:id/cancel", async (req: Request, res: Response) => {
    const job = await cancelJobApi(req.params.id);
    if (!job) {
      json(res, { error: "cannot_cancel" }, 400);
      return;
    }
    json(res, { ok: true, job });
  });

  app.get("/api/import-batches", async (_req: Request, res: Response) => {
    json(res, await listImportBatchesApi());
  });

  /** JSON body: `{ csvText, fileName?, source? }` (global `express.json` applies). */
  app.post("/api/leads/import/csv", async (req: Request, res: Response) => {
    const db = await requireLeadEngineDb();
    if (!db) {
      json(res, { error: "database_unavailable" }, 503);
      return;
    }
    const csvText =
      typeof req.body?.csvText === "string"
        ? req.body.csvText
        : typeof req.body?.csv === "string"
          ? req.body.csv
          : null;
    if (!csvText?.trim()) {
      json(res, {
        error: "missing_csv",
        message: "Send JSON { csvText, fileName?, source? } with CSV contents.",
      }, 400);
      return;
    }
    try {
      const result = await importLeadsFromCsv(csvText, {
        fileName: typeof req.body?.fileName === "string" ? req.body.fileName : undefined,
        sourceLabel: typeof req.body?.source === "string" ? req.body.source : "csv",
      });
      json(res, { ok: true, ...result });
    } catch (e) {
      console.error("[leads/import/csv]", e);
      json(res, { error: "import_failed", message: e instanceof Error ? e.message : String(e) }, 500);
    }
  });

  /** Body: GooglePlacesSearchInput-style fields; uses `GOOGLE_PLACES_API_KEY` server-side only. */
  app.post("/api/leads/import/google-places", async (req: Request, res: Response) => {
    const db = await requireLeadEngineDb();
    if (!db) {
      json(res, { error: "database_unavailable" }, 503);
      return;
    }
    const b = req.body ?? {};
    const maxResults =
      typeof b.maxResults === "number" && Number.isFinite(b.maxResults)
        ? Math.min(200, Math.max(1, Math.floor(b.maxResults)))
        : 20;
    const radiusMiles =
      typeof b.radiusMiles === "number" && Number.isFinite(b.radiusMiles)
        ? Math.max(0.5, b.radiusMiles)
        : 10;
    const input: GooglePlacesSearchInput = {
      searchTerm: typeof b.searchTerm === "string" ? b.searchTerm : undefined,
      category: typeof b.category === "string" ? b.category : undefined,
      zip: typeof b.zip === "string" ? b.zip : undefined,
      city: typeof b.city === "string" ? b.city : undefined,
      state: typeof b.state === "string" ? b.state : undefined,
      latitude: typeof b.latitude === "number" && Number.isFinite(b.latitude) ? b.latitude : undefined,
      longitude: typeof b.longitude === "number" && Number.isFinite(b.longitude) ? b.longitude : undefined,
      radiusMiles,
      maxResults,
    };
    try {
      const result = await importGooglePlacesToLeadEngine(input);
      json(res, { ok: true, ...result });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[leads/import/google-places]", e);
      if (msg === "database_unavailable") {
        json(res, { error: "database_unavailable" }, 503);
        return;
      }
      if (msg.includes("GOOGLE_PLACES_API_KEY")) {
        json(res, { error: "places_not_configured", message: msg }, 503);
        return;
      }
      json(res, { error: "import_failed", message: msg }, 500);
    }
  });

  app.get("/api/leads", async (req: Request, res: Response) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const stage = parseStage(typeof req.query.stage === "string" ? req.query.stage : undefined);
    const verification =
      typeof req.query.verification === "string" ? req.query.verification : undefined;
    json(res, await listLeadsApi({ q, stage, verification }));
  });

  app.get("/api/leads/:id", async (req: Request, res: Response) => {
    const row = await getLeadDetailApi(req.params.id);
    if (!row) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, row);
  });

  app.patch("/api/leads/:id/stage", async (req: Request, res: Response) => {
    const stage = parseStage(req.body?.stage as string | undefined);
    if (!stage) {
      json(res, { error: "invalid_stage" }, 400);
      return;
    }
    const lead = await patchLeadPipelineStageApi(req.params.id, stage);
    if (!lead) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, lead });
  });

  app.post("/api/leads/:id/verify-phone", async (req: Request, res: Response) => {
    const row = await getLeadDetailApi(req.params.id);
    if (!row) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, {
      ok: true,
      message: "Phone verification not wired — Twilio/Clerk integration is phase 2.",
      leadId: req.params.id,
    });
  });

  app.post("/api/leads/:id/review-website", async (req: Request, res: Response) => {
    const r = await checkWebsiteForLeadId(req.params.id);
    if (!r.ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, leadId: req.params.id, status: r.status });
  });

  app.post("/api/leads/check-website/:id", async (req: Request, res: Response) => {
    const r = await checkWebsiteForLeadId(req.params.id);
    if (!r.ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, leadId: req.params.id, status: r.status });
  });

  app.post("/api/leads/check-website/batch", async (req: Request, res: Response) => {
    const raw = (req.body ?? {}) as { leadIds?: unknown };
    const leadIds = Array.isArray(raw.leadIds)
      ? raw.leadIds.filter((x): x is string => typeof x === "string" && x.length > 0)
      : [];
    if (!leadIds.length) {
      json(res, { error: "missing_leadIds", message: "Send JSON { leadIds: string[] }." }, 400);
      return;
    }
    const batch = await checkWebsiteBatchLeadIds(leadIds, 4);
    json(res, { ok: true, processed: batch.ok, failed: batch.failed, total: leadIds.length });
  });

  app.post("/api/leads/:id/merge", async (req: Request, res: Response) => {
    json(res, {
      ok: true,
      message: "Merge not implemented — use dedupe report then manual resolution.",
      target: req.params.id,
      body: req.body ?? {},
    });
  });

  app.post("/api/leads/:id/enrich", async (req: Request, res: Response) => {
    const r = await checkWebsiteForLeadId(req.params.id);
    if (!r.ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, leadId: req.params.id, status: r.status });
  });

  app.post("/api/leads/enrich/batch", async (_req: Request, res: Response) => {
    const db = await requireLeadEngineDb();
    if (!db) {
      json(res, { error: "database_unavailable" }, 503);
      return;
    }
    const rows = await db.select({ id: leadEngineLeads.id }).from(leadEngineLeads);
    const ids = rows.map(r => r.id);
    const batch = await checkWebsiteBatchLeadIds(ids, 4);
    json(res, { ok: true, processed: batch.ok, failed: batch.failed, total: ids.length });
  });

  app.post("/api/leads/score/:id", async (req: Request, res: Response) => {
    const ok = await scoreLeadById(req.params.id);
    if (!ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, leadId: req.params.id });
  });

  app.post("/api/leads/score/batch", async (_req: Request, res: Response) => {
    json(res, { ok: true, ...(await scoreAllLeads()) });
  });

  app.post("/api/leads/dedupe", async (_req: Request, res: Response) => {
    json(res, await runDedupeReportApi());
  });

  app.post("/api/leads/:id/validate", async (req: Request, res: Response) => {
    const r = await validateLeadEmailForLead(req.params.id);
    if (!r.ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, r);
  });

  app.post("/api/leads/queue/assign", async (req: Request, res: Response) => {
    const leadId = typeof req.body?.leadId === "string" ? req.body.leadId : "";
    const agentRaw = typeof req.body?.agent === "string" ? req.body.agent.toLowerCase() : "";
    const agent = agentRaw === "leo" ? "leo" : "vinci";
    if (!leadId) {
      json(res, { error: "missing_leadId" }, 400);
      return;
    }
    const ok = await assignAgentQueueStub(leadId, agent, typeof req.body?.reason === "string" ? req.body.reason : undefined);
    if (!ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, leadId, agent });
  });

  app.get("/api/outreach/queue", async (_req: Request, res: Response) => {
    json(res, await getOutreachQueueApi());
  });
}

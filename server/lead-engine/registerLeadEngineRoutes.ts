import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import type { PipelineStage } from "../../shared/lead-engine-types";
import { leadEngineImportBatches, leadEngineLeads } from "../../drizzle/leadEngineSchema";
import { registerLeadsExportRoute } from "./leadsExportRoute";
import {
  assignAgentQueueStub,
  cancelJobApi,
  enrichLeadStub,
  getAnalyticsOverviewApi,
  getDashboardOverviewApi,
  getJobApi,
  getLeadDetailApi,
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
  validateLeadStub,
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
    const ok = await enrichLeadStub(req.params.id);
    if (!ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, message: "Website review stub stored on enrichment row.", leadId: req.params.id });
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
    const ok = await enrichLeadStub(req.params.id);
    if (!ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, leadId: req.params.id });
  });

  app.post("/api/leads/enrich/batch", async (_req: Request, res: Response) => {
    const db = await requireLeadEngineDb();
    if (!db) {
      json(res, { error: "database_unavailable" }, 503);
      return;
    }
    const rows = await db.select({ id: leadEngineLeads.id }).from(leadEngineLeads);
    let ok = 0;
    for (const r of rows) {
      if (await enrichLeadStub(r.id)) ok++;
    }
    json(res, { ok: true, enriched: ok });
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
    const ok = await validateLeadStub(req.params.id);
    if (!ok) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, leadId: req.params.id });
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

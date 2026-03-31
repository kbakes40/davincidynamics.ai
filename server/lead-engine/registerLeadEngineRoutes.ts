import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import type { LeadWorkflowStatus, PipelineStage } from "../../shared/lead-engine-types";
import { leadEngineAddresses, leadEngineContactPoints, leadEngineEnrichment, leadEngineImportBatches, leadEngineLeads } from "../../drizzle/leadEngineSchema";
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

function parseWorkflowStatus(s: unknown): LeadWorkflowStatus | undefined {
  const allowed: LeadWorkflowStatus[] = [
    "new",
    "researched",
    "drafted",
    "ready_to_send",
    "sent",
    "replied",
    "interested",
    "not_interested",
    "follow_up_needed",
  ];
  return typeof s === "string" && allowed.includes(s as LeadWorkflowStatus)
    ? (s as LeadWorkflowStatus)
    : undefined;
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
      json(
        res,
        {
          error: "missing_csv",
          message: "Send JSON { csvText, fileName?, source? } with CSV contents.",
        },
        400
      );
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

  app.post("/api/leads/manual", async (req: Request, res: Response) => {
    const db = await requireLeadEngineDb();
    if (!db) {
      json(res, { error: "database_unavailable" }, 503);
      return;
    }

    const businessName = typeof req.body?.businessName === "string" ? req.body.businessName.trim() : "";
    if (!businessName) {
      json(res, { error: "missing_business_name" }, 400);
      return;
    }

    const id = nanoid();
    const now = new Date();
    const source = typeof req.body?.source === "string" && req.body.source.trim() ? req.body.source.trim() : "manual";
    const status = parseWorkflowStatus(req.body?.status) ?? "new";

    await db.insert(leadEngineLeads).values({
      id,
      businessName,
      ownerName: typeof req.body?.ownerName === "string" ? req.body.ownerName : null,
      category: typeof req.body?.category === "string" ? req.body.category : "local_business",
      subcategory: typeof req.body?.subCategory === "string" ? req.body.subCategory : null,
      source,
      targetZip: typeof req.body?.targetZip === "string" ? req.body.targetZip : null,
      radiusMiles: typeof req.body?.radiusMiles === "number" ? Math.round(req.body.radiusMiles) : null,
      outreachStatus: status,
      notesJson: JSON.stringify(Array.isArray(req.body?.notes) ? req.body.notes : []),
      outreachPrep: typeof req.body?.outreachPrep === "string" ? req.body.outreachPrep : null,
      normalizedBusinessName: businessName.toLowerCase().trim(),
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(leadEngineAddresses).values({
      id: nanoid(),
      leadId: id,
      address1: typeof req.body?.address === "string" ? req.body.address : null,
      city: typeof req.body?.city === "string" ? req.body.city : "",
      state: typeof req.body?.state === "string" ? req.body.state : "",
      zip: typeof req.body?.zip === "string" ? req.body.zip : null,
    });

    const contacts = [
      ["phone", req.body?.phone],
      ["email", req.body?.email],
      ["website", req.body?.website],
    ] as const;
    for (const [type, value] of contacts) {
      if (typeof value === "string" && value.trim()) {
        await db.insert(leadEngineContactPoints).values({
          id: nanoid(),
          leadId: id,
          type,
          value: value.trim(),
          isPrimary: 1,
          source,
        });
      }
    }

    await db.insert(leadEngineEnrichment).values({
      id: nanoid(),
      leadId: id,
      websiteStatus: typeof req.body?.website === "string" && req.body.website.trim() ? "has_website" : "no_website",
      hasWebsite: typeof req.body?.website === "string" && req.body.website.trim() ? 1 : 0,
      googleBusinessProfile:
        typeof req.body?.googleBusinessProfile === "string" ? req.body.googleBusinessProfile : null,
      facebook: typeof req.body?.facebook === "string" ? req.body.facebook : null,
      instagram: typeof req.body?.instagram === "string" ? req.body.instagram : null,
      linkedin: typeof req.body?.linkedin === "string" ? req.body.linkedin : null,
      enrichedAt: now,
    });

    const lead = await getLeadDetailApi(id);
    json(res, { ok: true, lead: lead?.lead ?? null });
  });

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
    const verification = typeof req.query.verification === "string" ? req.query.verification : undefined;
    const source = typeof req.query.source === "string" ? req.query.source : undefined;
    const priority = typeof req.query.priority === "string" ? req.query.priority : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const websiteStatus = typeof req.query.websiteStatus === "string" ? req.query.websiteStatus : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    json(res, await listLeadsApi({ q, stage, verification, source, priority, status, websiteStatus, category, city, state }));
  });

  app.get("/api/leads/:id", async (req: Request, res: Response) => {
    const row = await getLeadDetailApi(req.params.id);
    if (!row) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, row);
  });

  app.patch("/api/leads/:id", async (req: Request, res: Response) => {
    const db = await requireLeadEngineDb();
    if (!db) {
      json(res, { error: "database_unavailable" }, 503);
      return;
    }
    const leadId = req.params.id;
    const existing = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
    if (!existing[0]) {
      json(res, { error: "not_found" }, 404);
      return;
    }

    const status = parseWorkflowStatus(req.body?.status);
    const notes = Array.isArray(req.body?.notes) ? req.body.notes.map((n: unknown) => String(n)) : undefined;
    const outreachPrep = typeof req.body?.outreachPrep === "string" ? req.body.outreachPrep : undefined;
    const followUpAt = typeof req.body?.followUpAt === "string" && req.body.followUpAt ? new Date(req.body.followUpAt) : null;

    await db
      .update(leadEngineLeads)
      .set({
        outreachStatus: status ?? existing[0].outreachStatus,
        notesJson: notes ? JSON.stringify(notes) : existing[0].notesJson,
        outreachPrep: outreachPrep ?? existing[0].outreachPrep,
        followUpAt: followUpAt ?? existing[0].followUpAt,
        contactedAt: status === "sent" && !existing[0].contactedAt ? new Date() : existing[0].contactedAt,
        updatedAt: new Date(),
      })
      .where(eq(leadEngineLeads.id, leadId));

    const detail = await getLeadDetailApi(leadId);
    json(res, { ok: true, lead: detail?.lead ?? null });
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
    const ok = await assignAgentQueueStub(
      leadId,
      agent,
      typeof req.body?.reason === "string" ? req.body.reason : undefined
    );
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

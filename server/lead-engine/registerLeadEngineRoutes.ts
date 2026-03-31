import type { Express, Request, Response } from "express";
import type { PipelineStage } from "../../shared/lead-engine-types";
import {
  cancelJob,
  getAnalyticsOverview,
  getDashboardOverview,
  getJob,
  getLead,
  getOutreachQueue,
  listJobs,
  listLeads,
  patchLeadStage,
} from "./mockStore";

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
 * Lead Engine REST API (mock-backed today; swap mockStore for DB later).
 */
export function registerLeadEngineRoutes(app: Express): void {
  app.get("/api/lead-engine/dashboard", (_req: Request, res: Response) => {
    json(res, getDashboardOverview());
  });

  app.get("/api/lead-engine/analytics", (_req: Request, res: Response) => {
    json(res, getAnalyticsOverview());
  });

  app.get("/api/jobs", (_req: Request, res: Response) => {
    json(res, listJobs());
  });

  app.get("/api/jobs/:id", (req: Request, res: Response) => {
    const row = getJob(req.params.id);
    if (!row) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, row);
  });

  app.post("/api/jobs", (req: Request, res: Response) => {
    json(res, { ok: true, message: "Job creation queued (mock — not persisted)", body: req.body ?? {} });
  });

  app.post("/api/jobs/:id/cancel", (req: Request, res: Response) => {
    const job = cancelJob(req.params.id);
    if (!job) {
      json(res, { error: "cannot_cancel" }, 400);
      return;
    }
    json(res, { ok: true, job });
  });

  app.get("/api/leads", (req: Request, res: Response) => {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const stage = parseStage(typeof req.query.stage === "string" ? req.query.stage : undefined);
    const verification =
      typeof req.query.verification === "string" ? req.query.verification : undefined;
    json(res, listLeads({ q, stage, verification }));
  });

  app.get("/api/leads/:id", (req: Request, res: Response) => {
    const row = getLead(req.params.id);
    if (!row) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, row);
  });

  app.patch("/api/leads/:id/stage", (req: Request, res: Response) => {
    const stage = parseStage(req.body?.stage as string | undefined);
    if (!stage) {
      json(res, { error: "invalid_stage" }, 400);
      return;
    }
    const lead = patchLeadStage(req.params.id, stage);
    if (!lead) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, lead });
  });

  app.post("/api/leads/:id/verify-phone", (req: Request, res: Response) => {
    const row = getLead(req.params.id);
    if (!row) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, message: "Phone verification scheduled (mock)", leadId: req.params.id });
  });

  app.post("/api/leads/:id/review-website", (req: Request, res: Response) => {
    const row = getLead(req.params.id);
    if (!row) {
      json(res, { error: "not_found" }, 404);
      return;
    }
    json(res, { ok: true, message: "Website review logged (mock)", leadId: req.params.id });
  });

  app.post("/api/leads/:id/merge", (req: Request, res: Response) => {
    json(res, { ok: true, message: "Merge queued (mock)", target: req.params.id, body: req.body ?? {} });
  });

  app.get("/api/outreach/queue", (_req: Request, res: Response) => {
    json(res, getOutreachQueue());
  });
}

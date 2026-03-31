import type { Express, Request, Response } from "express";
import { z } from "zod";
import type { PipelineStage, VerificationStatus } from "../../shared/lead-engine-types";
import { buildLeadsCsv, leadEngineExportFilename } from "../../shared/lead-engine-csv";
import { filterAndSortLeads, type SavedViewId } from "../../shared/lead-engine-leads-query";
import { assertLeadEngineExportAuth } from "./leadEngineExportAuth";
import { getAllLeadsForExport } from "./mockStore";

const exportBodySchema = z.object({
  q: z.string().optional().default(""),
  stageFilter: z.string().optional().default(""),
  verificationFilter: z.string().optional().default(""),
  savedView: z.enum(["all", "outreach_window", "verify_queue", "high_score"]),
  sortKey: z.enum(["score", "city", "stage", "verification", "lastSeen"]),
  sortDir: z.enum(["asc", "desc"]),
});

const PIPELINE: PipelineStage[] = [
  "new_lead",
  "verified",
  "site_reviewed",
  "outreach_ready",
  "contacted",
  "follow_up",
  "closed_won",
  "closed_lost",
];

const VERIFICATION: VerificationStatus[] = ["unverified", "pending", "verified", "failed"];

function parseStageFilter(s: string): PipelineStage | "" {
  if (!s) return "";
  return PIPELINE.includes(s as PipelineStage) ? (s as PipelineStage) : ("" as const);
}

function parseVerificationFilter(s: string): VerificationStatus | "" {
  if (!s) return "";
  return VERIFICATION.includes(s as VerificationStatus) ? (s as VerificationStatus) : ("" as const);
}

/**
 * POST /api/leads/export — CSV of leads matching table filters (full dataset).
 * Auth only when LEAD_ENGINE_EXPORT_REQUIRE_AUTH=true.
 */
export function registerLeadsExportRoute(app: Express): void {
  app.post("/api/leads/export", async (req: Request, res: Response) => {
    try {
      await assertLeadEngineExportAuth(req);
    } catch {
      res.status(401).json({
        error: "unauthorized",
        message: "Sign in to export leads (LEAD_ENGINE_EXPORT_REQUIRE_AUTH is enabled).",
      });
      return;
    }

    const parsed = exportBodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
      return;
    }

    const b = parsed.data;
    const stageFilter = parseStageFilter(b.stageFilter);
    const verificationFilter = parseVerificationFilter(b.verificationFilter);
    if (b.stageFilter && !stageFilter) {
      res.status(400).json({ error: "invalid_stage" });
      return;
    }
    if (b.verificationFilter && !verificationFilter) {
      res.status(400).json({ error: "invalid_verification" });
      return;
    }

    const params = {
      q: b.q,
      stageFilter,
      verificationFilter,
      savedView: b.savedView as SavedViewId,
      sortKey: b.sortKey,
      sortDir: b.sortDir,
    };

    try {
      const raw = getAllLeadsForExport();
      const rows = filterAndSortLeads(raw, params);
      const csv = buildLeadsCsv(rows);
      const filename = leadEngineExportFilename();

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Export-Row-Count", String(rows.length));
      res.status(200).send(csv);
    } catch (e) {
      console.error("[leads/export]", e);
      res.status(500).json({
        error: "export_failed",
        message: e instanceof Error ? e.message : "Export failed",
      });
    }
  });
}

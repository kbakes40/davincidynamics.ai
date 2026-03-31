import type {
  AnalyticsOverviewResponse,
  DashboardOverviewResponse,
  JobDetailResponse,
  JobsListResponse,
  LeadDetailResponse,
  LeadsListResponse,
  OutreachQueueResponse,
  PipelineStage,
  LeadWorkflowStatus,
} from "@shared/lead-engine-types";
import type { LeadsQueryParams } from "@shared/lead-engine-leads-query";
import { leadEngineExportFilename } from "@shared/lead-engine-csv";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || res.statusText);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function fetchLeadEngineDashboard(): Promise<DashboardOverviewResponse> {
  const res = await fetch("/api/lead-engine/dashboard");
  return parseJson<DashboardOverviewResponse>(res);
}

export async function fetchLeadEngineAnalytics(): Promise<AnalyticsOverviewResponse> {
  const res = await fetch("/api/lead-engine/analytics");
  return parseJson<AnalyticsOverviewResponse>(res);
}

export async function fetchJobs(): Promise<JobsListResponse> {
  const res = await fetch("/api/jobs");
  return parseJson<JobsListResponse>(res);
}

export async function fetchJob(id: string): Promise<JobDetailResponse> {
  const res = await fetch(`/api/jobs/${encodeURIComponent(id)}`);
  return parseJson<JobDetailResponse>(res);
}

export async function cancelJobApi(id: string): Promise<{ ok: boolean; job?: unknown }> {
  const res = await fetch(`/api/jobs/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  return parseJson(res);
}

export async function fetchLeads(params: {
  q?: string;
  stage?: PipelineStage;
  verification?: string;
  source?: string;
  priority?: string;
  status?: string;
  websiteStatus?: string;
  category?: string;
  city?: string;
  state?: string;
}): Promise<LeadsListResponse> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.stage) sp.set("stage", params.stage);
  if (params.verification) sp.set("verification", params.verification);
  if (params.source) sp.set("source", params.source);
  if (params.priority) sp.set("priority", params.priority);
  if (params.status) sp.set("status", params.status);
  if (params.websiteStatus) sp.set("websiteStatus", params.websiteStatus);
  if (params.category) sp.set("category", params.category);
  if (params.city) sp.set("city", params.city);
  if (params.state) sp.set("state", params.state);
  const q = sp.toString();
  const res = await fetch(`/api/leads${q ? `?${q}` : ""}`);
  return parseJson<LeadsListResponse>(res);
}

export async function fetchLead(id: string): Promise<LeadDetailResponse> {
  const res = await fetch(`/api/leads/${encodeURIComponent(id)}`);
  return parseJson<LeadDetailResponse>(res);
}

export async function patchLeadStageApi(
  id: string,
  stage: PipelineStage
): Promise<{ ok: boolean; lead?: unknown }> {
  const res = await fetch(`/api/leads/${encodeURIComponent(id)}/stage`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage }),
  });
  return parseJson(res);
}

export async function patchLeadWorkflowApi(
  id: string,
  payload: {
    status?: LeadWorkflowStatus;
    notes?: string[];
    outreachPrep?: string | null;
    followUpAt?: string | null;
  }
): Promise<{ ok: boolean; lead?: LeadDetailResponse["lead"] }> {
  const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function createManualLeadApi(payload: Record<string, unknown>): Promise<{ ok: boolean; lead?: LeadDetailResponse["lead"] }> {
  const res = await fetch("/api/leads/manual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function importCsvLeadApi(payload: { csvText: string; fileName?: string; source?: string }): Promise<{ ok: boolean; batchId?: string }> {
  const res = await fetch("/api/leads/import/csv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function fetchOutreachQueue(): Promise<OutreachQueueResponse> {
  const res = await fetch("/api/outreach/queue");
  return parseJson<OutreachQueueResponse>(res);
}

/**
 * Server-side CSV export: same filters/sort as the table, full backing dataset, session cookie sent.
 */
export async function postLeadsExportCsv(
  params: LeadsQueryParams
): Promise<{ blob: Blob; filename: string; rowCount: number }> {
  const res = await fetch("/api/leads/export", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/csv, application/json",
    },
    body: JSON.stringify({
      q: params.q,
      stageFilter: params.stageFilter,
      verificationFilter: params.verificationFilter,
      sourceFilter: params.sourceFilter ?? "",
      statusFilter: params.statusFilter ?? "",
      websiteStatusFilter: params.websiteStatusFilter ?? "",
      priorityFilter: params.priorityFilter ?? "",
      categoryFilter: params.categoryFilter ?? "",
      cityFilter: params.cityFilter ?? "",
      stateFilter: params.stateFilter ?? "",
      savedView: params.savedView,
      sortKey: params.sortKey,
      sortDir: params.sortDir,
    }),
  });

  const ct = res.headers.get("Content-Type") ?? "";

  if (!res.ok) {
    let msg = res.statusText;
    if (ct.includes("application/json")) {
      try {
        const j = (await res.json()) as { message?: string; error?: string };
        msg = j.message ?? j.error ?? msg;
      } catch {
        /* ignore */
      }
    } else {
      try {
        const t = await res.text();
        if (t) msg = t.slice(0, 500);
      } catch {
        /* ignore */
      }
    }
    throw new Error(msg || `Export failed (${res.status})`);
  }

  if (!ct.includes("text/csv") && !ct.includes("text/plain")) {
    throw new Error("Unexpected response type from export");
  }

  const cd = res.headers.get("Content-Disposition");
  const m = /filename="([^"]+)"/.exec(cd ?? "");
  const filename = m?.[1] ?? leadEngineExportFilename();
  const rowHeader = res.headers.get("X-Export-Row-Count");
  const rowCount = rowHeader ? Number.parseInt(rowHeader, 10) : Number.NaN;
  const blob = await res.blob();
  return { blob, filename, rowCount: Number.isFinite(rowCount) ? rowCount : 0 };
}

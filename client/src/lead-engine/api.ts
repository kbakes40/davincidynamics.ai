import type {
  AnalyticsOverviewResponse,
  DashboardOverviewResponse,
  JobDetailResponse,
  JobsListResponse,
  LeadDetailResponse,
  LeadsListResponse,
  OutreachQueueResponse,
  PipelineStage,
} from "@shared/lead-engine-types";

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
}): Promise<LeadsListResponse> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.stage) sp.set("stage", params.stage);
  if (params.verification) sp.set("verification", params.verification);
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

export async function fetchOutreachQueue(): Promise<OutreachQueueResponse> {
  const res = await fetch("/api/outreach/queue");
  return parseJson<OutreachQueueResponse>(res);
}

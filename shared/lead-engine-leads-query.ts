import type { Lead, PipelineStage, VerificationStatus } from "./lead-engine-types";

export type SavedViewId = "all" | "outreach_window" | "verify_queue" | "high_score";

export type LeadSortKey = "score" | "city" | "stage" | "verification" | "lastSeen";

export type LeadsQueryParams = {
  q: string;
  stageFilter: PipelineStage | "";
  verificationFilter: VerificationStatus | "";
  savedView: SavedViewId;
  sortKey: LeadSortKey;
  sortDir: "asc" | "desc";
  /** Optional server/export filters (Lead Engine v2). */
  sourceFilter?: string;
  websiteStatusFilter?: string;
  priorityFilter?: string;
  categoryFilter?: string;
  cityFilter?: string;
  stateFilter?: string;
};

export function applySavedView(
  id: SavedViewId
): { stage?: PipelineStage; verification?: VerificationStatus; minScore?: number } {
  if (id === "outreach_window") return { stage: "outreach_ready" };
  if (id === "verify_queue") return { verification: "pending" };
  if (id === "high_score") return { minScore: 80 };
  return {};
}

/**
 * Single source of truth for Lead Engine table filtering + sort (client + server export).
 */
export function filterAndSortLeads(raw: Lead[], p: LeadsQueryParams): Lead[] {
  const viewPrefs = applySavedView(p.savedView);
  let rows = [...raw];
  const qv = p.q.trim().toLowerCase();
  if (qv) {
    rows = rows.filter(
      l =>
        l.businessName.toLowerCase().includes(qv) ||
        l.city.toLowerCase().includes(qv) ||
        l.category.toLowerCase().includes(qv)
    );
  }
  if (p.stageFilter) {
    rows = rows.filter(l => l.pipelineStage === p.stageFilter);
  } else if (viewPrefs.stage) {
    rows = rows.filter(l => l.pipelineStage === viewPrefs.stage);
  }
  if (p.verificationFilter) {
    rows = rows.filter(l => l.verificationStatus === p.verificationFilter);
  } else if (viewPrefs.verification) {
    rows = rows.filter(l => l.verificationStatus === viewPrefs.verification);
  }
  if (viewPrefs.minScore != null) {
    rows = rows.filter(l => l.leadScore >= viewPrefs.minScore!);
  }

  if (p.sourceFilter?.trim()) {
    const s = p.sourceFilter.trim().toLowerCase();
    rows = rows.filter(l => l.source.toLowerCase() === s);
  }
  if (p.websiteStatusFilter?.trim()) {
    const w = p.websiteStatusFilter.trim().toLowerCase();
    rows = rows.filter(l => (l.websiteStatus ?? "").toLowerCase() === w);
  }
  if (p.priorityFilter?.trim()) {
    const pr = p.priorityFilter.trim().toLowerCase();
    rows = rows.filter(l => (l.priority ?? "").toLowerCase() === pr);
  }
  if (p.categoryFilter?.trim()) {
    const c = p.categoryFilter.trim().toLowerCase();
    rows = rows.filter(l => l.category.toLowerCase().includes(c));
  }
  if (p.cityFilter?.trim()) {
    const c = p.cityFilter.trim().toLowerCase();
    rows = rows.filter(l => l.city.toLowerCase().includes(c));
  }
  if (p.stateFilter?.trim()) {
    const s = p.stateFilter.trim().toLowerCase();
    rows = rows.filter(l => l.state.toLowerCase() === s);
  }

  rows.sort((a, b) => {
    let cmp = 0;
    if (p.sortKey === "score") cmp = a.leadScore - b.leadScore;
    else if (p.sortKey === "city") cmp = `${a.city}${a.state}`.localeCompare(`${b.city}${b.state}`);
    else if (p.sortKey === "stage") cmp = a.pipelineStage.localeCompare(b.pipelineStage);
    else if (p.sortKey === "verification") cmp = a.verificationStatus.localeCompare(b.verificationStatus);
    else cmp = new Date(a.lastSeenAt).getTime() - new Date(b.lastSeenAt).getTime();
    return p.sortDir === "desc" ? -cmp : cmp;
  });
  return rows;
}

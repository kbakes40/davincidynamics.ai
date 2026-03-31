import type { Lead, PipelineStage, VerificationStatus } from "@shared/lead-engine-types";
import { applySavedView, type SavedViewId } from "./components/LeadFilters";
import type { LeadSortKey } from "./components/LeadTable";

export type LeadsQueryParams = {
  q: string;
  stageFilter: PipelineStage | "";
  verificationFilter: VerificationStatus | "";
  savedView: SavedViewId;
  sortKey: LeadSortKey;
  sortDir: "asc" | "desc";
};

/**
 * Same filter + sort logic as the Leads table (client-side over the loaded list).
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

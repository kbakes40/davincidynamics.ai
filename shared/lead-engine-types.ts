/**
 * Lead Engine — shared API / domain types (server + client).
 */

export type JobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type VerificationStatus = "unverified" | "pending" | "verified" | "failed";

export type PipelineStage =
  | "new_lead"
  | "verified"
  | "site_reviewed"
  | "outreach_ready"
  | "contacted"
  | "follow_up"
  | "closed_won"
  | "closed_lost";

export interface SearchJob {
  id: string;
  status: JobStatus;
  source: string;
  niche: string;
  locationQuery: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  taskTotal: number;
  taskCompleted: number;
  taskFailed: number;
  linkedLeadIds: string[];
}

export interface SearchTask {
  id: string;
  jobId: string;
  kind: string;
  status: "pending" | "running" | "done" | "failed";
  target: string;
  lastError: string | null;
}

export interface LeadEnrichment {
  summary: string;
  techStack: string[];
  estimatedMonthlyOrders: string | null;
  socialPresence: string;
}

export interface LeadActivityItem {
  id: string;
  leadId: string;
  type: string;
  message: string;
  at: string;
  actor: string;
}

export interface PipelineTransition {
  id: string;
  leadId: string;
  from: PipelineStage | null;
  to: PipelineStage;
  at: string;
  actor: string;
  note: string | null;
}

export interface Lead {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  /** Street / mailing line — optional until wired to enrichment / CRM. */
  address?: string | null;
  zip?: string | null;
  phone: string | null;
  email?: string | null;
  website: string | null;
  verificationStatus: VerificationStatus;
  leadScore: number;
  pipelineStage: PipelineStage;
  source: string;
  sourceJobId: string | null;
  /** First seen / ingest time; falls back to lastSeenAt in exports if absent. */
  createdAt?: string | null;
  lastSeenAt: string;
  assignedOwner: string | null;
  reasonCodes: string[];
  enrichment: LeadEnrichment | null;
  notes: string[];
  tags: string[];
}

export interface OutreachQueueItem {
  leadId: string;
  businessName: string;
  city: string;
  state: string;
  score: number;
  openingAngle: string;
  siteWeaknessSummary: string;
  priority: "low" | "medium" | "high";
  lastReviewAt: string;
  owner: string | null;
  websiteStatus: string;
}

export interface JobsListResponse {
  jobs: SearchJob[];
}

export interface JobDetailResponse {
  job: SearchJob;
  tasks: SearchTask[];
}

export interface LeadsListResponse {
  leads: Lead[];
  total: number;
}

export interface LeadDetailResponse {
  lead: Lead;
  activity: LeadActivityItem[];
  pipelineHistory: PipelineTransition[];
}

export interface OutreachQueueResponse {
  items: OutreachQueueItem[];
}

export interface DashboardOverviewResponse {
  activeJobs: number;
  queuedJobs: number;
  verifiedLeads: number;
  outreachReadyLeads: number;
  highScoreLeads: number;
  recentJobs: SearchJob[];
  recentActivity: LeadActivityItem[];
  topCities: { city: string; count: number }[];
  topNiches: { niche: string; count: number }[];
  conversionByStage: { stage: PipelineStage; count: number; label: string }[];
  /** Synthetic 7-day trend for executive snapshot (replace with GA4 + DB later). */
  trend7d: { day: string; users: number; sessions: number }[];
  marketSnapshot: {
    avgScoreOutreachReady: number;
    verificationRate: number;
    leadsThisWeek: number;
  };
}

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  new_lead: "New lead",
  verified: "Verified",
  site_reviewed: "Site reviewed",
  outreach_ready: "Outreach ready",
  contacted: "Contacted",
  follow_up: "Follow up",
  closed_won: "Closed won",
  closed_lost: "Closed lost",
};

export const PIPELINE_COLUMNS: PipelineStage[] = [
  "new_lead",
  "verified",
  "site_reviewed",
  "outreach_ready",
  "contacted",
  "follow_up",
  "closed_won",
  "closed_lost",
];

export interface AnalyticsOverviewResponse {
  volumeByCity: { city: string; count: number }[];
  volumeByNiche: { niche: string; count: number }[];
  scoreDistribution: { bucket: string; count: number }[];
  verificationFunnel: { step: string; count: number }[];
  outreachReadyRate: number;
  pipelineConversion: { stage: PipelineStage; label: string; count: number; pctOfTotal: number }[];
  topMarkets: { label: string; avgScore: number; leads: number }[];
  sourceQuality: { source: string; avgScore: number; count: number }[];
}

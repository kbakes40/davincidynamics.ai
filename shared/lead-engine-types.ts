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
  googleBusinessProfile?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
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

export type LeadEnginePriorityLevel = "low" | "medium" | "high" | "urgent";

export type LeadWorkflowStatus =
  | "new"
  | "researched"
  | "drafted"
  | "ready_to_send"
  | "sent"
  | "replied"
  | "interested"
  | "not_interested"
  | "follow_up_needed";

export type WebsiteStatus = "no_website" | "weak_website" | "has_website" | "unknown";

export type LeadSearchProvider = "google_places" | "csv";

export type LeadSearchImportStatus = "new" | "already_imported" | "already_in_pipeline" | "imported_not_in_pipeline" | "imported" | "failed";

export type CampaignChannel = "email" | "sms" | "call" | "multi_touch";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignLeadOutreachStatus = "not_started" | "drafted" | "ready_to_send" | "sent" | "opened" | "replied" | "interested" | "not_interested" | "follow_up_needed";

export interface LeadSearchResultRow {
  /** Stable key for selection in the review table (placeId, csv row id, etc.). */
  key: string;
  provider: LeadSearchProvider;
  importStatus: LeadSearchImportStatus;
  alreadyImportedLeadId?: string | null;
  businessName: string;
  ownerName?: string | null;
  category: string;
  subCategory?: string | null;
  address?: string | null;
  city: string;
  state: string;
  zip?: string | null;
  phone: string | null;
  email?: string | null;
  website: string | null;
  websiteStatus: WebsiteStatus;
  googleBusinessProfile?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  notes?: string[];
  leadSource: string;
  priority?: LeadEnginePriorityLevel;
  status?: LeadWorkflowStatus;
  radiusMiles?: number | null;
  targetZip?: string | null;
  /** Provider-specific unique id, if present (Google place id, etc.). */
  sourceRecordId?: string | null;
  pipelineStage?: PipelineStage | null;
  campaignStatus?: "none" | "in_campaign" | "campaign_ready";
}

export type LeadSearchNichePreset =
  | "auto"
  | "restaurants"
  | "smoke_shops"
  | "barber_shops"
  | "salons"
  | "dentists"
  | "roofers"
  | "hvac"
  | "plumbers"
  | "auto_repair"
  | "gyms"
  | "law_firms";

export interface LeadSearchPreviewResponse {
  ok: true;
  provider: LeadSearchProvider;
  results: LeadSearchResultRow[];
  totalFound: number;
  /** Indicates whether a live provider is configured. */
  providerReady: boolean;
  message?: string;
}

export interface LeadSearchImportSelectedResponse {
  ok: true;
  provider: LeadSearchProvider;
  batchId: string;
  inserted: number;
  updated: number;
  duplicates: number;
  failed: number;
  pipelined?: number;
}

export interface LeadCampaign {
  id: string;
  campaignName: string;
  campaignType: string;
  category?: string | null;
  targetAudience?: string | null;
  channel: CampaignChannel;
  objective?: string | null;
  status: CampaignStatus;
  owner?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCampaignLead {
  id: string;
  campaignId: string;
  leadId: string;
  pipelineId?: string | null;
  stage: string;
  outreachStatus: CampaignLeadOutreachStatus;
  assignedTo?: string | null;
  sequenceStep: number;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;
  notes?: string | null;
  businessName?: string | null;
  ownerName?: string | null;
  category?: string | null;
  subCategory?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  websiteStatus?: WebsiteStatus | null;
}

export interface Lead {
  id: string;
  businessName: string;
  ownerName?: string | null;
  category: string;
  subCategory?: string | null;
  city: string;
  state: string;
  /** Street / mailing line — optional until wired to enrichment / CRM. */
  address?: string | null;
  zip?: string | null;
  phone: string | null;
  email?: string | null;
  website: string | null;
  googleBusinessProfile?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  verificationStatus: VerificationStatus;
  leadScore: number;
  pipelineStage: PipelineStage;
  source: string;
  sourceJobId: string | null;
  /** First seen / ingest time; falls back to lastSeenAt in exports if absent. */
  createdAt?: string | null;
  lastSeenAt: string;
  assignedOwner: string | null;
  /** From lead_engine_leads.priority — used for filters and reporting. */
  priority?: LeadEnginePriorityLevel;
  status: LeadWorkflowStatus;
  /** From lead_engine_enrichment.website_status after checks. */
  websiteStatus?: WebsiteStatus;
  googleMapsUrl?: string | null;
  targetZip?: string | null;
  radiusMiles?: number | null;
  contactedAt?: string | null;
  followUpAt?: string | null;
  outreachPrep?: string | null;
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

export interface CampaignListResponse {
  campaigns: LeadCampaign[];
}

export interface CampaignDetailResponse {
  campaign: LeadCampaign;
  leads: LeadCampaignLead[];
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
  /** From `lead_engine_enrichment.website_status` (+ unknown when no row). */
  websiteStatusBreakdown: { status: string; count: number }[];
}

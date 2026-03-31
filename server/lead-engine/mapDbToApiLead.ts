import type {
  Lead,
  LeadActivityItem,
  LeadEnrichment,
  LeadDetailResponse,
  PipelineTransition,
} from "../../shared/lead-engine-types";
import type { LeadEngineLeadRow } from "../../drizzle/leadEngineSchema";

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(x => String(x)) : [];
  } catch {
    return [];
  }
}

function iso(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString();
}

export type LeadJoinData = {
  lead: LeadEngineLeadRow;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string;
  state: string;
  zip: string | null;
  address: string | null;
  enrichment: {
    websiteStatus: string;
    hasWebsite: number;
    summary: string | null;
    techStackJson: string | null;
    socialPresence: string | null;
    estimatedMonthlyOrders: string | null;
  } | null;
};

export function mapJoinToLead(j: LeadJoinData): Lead {
  const techStack = (() => {
    if (!j.enrichment?.techStackJson) return [];
    try {
      const v = JSON.parse(j.enrichment.techStackJson) as unknown;
      return Array.isArray(v) ? v.map(String) : [];
    } catch {
      return [];
    }
  })();

  const enrichment: LeadEnrichment | null = j.enrichment
    ? {
        summary: j.enrichment.summary ?? "",
        techStack,
        estimatedMonthlyOrders: j.enrichment.estimatedMonthlyOrders,
        socialPresence: j.enrichment.socialPresence ?? "",
      }
    : null;

  const websiteStatus = j.enrichment?.websiteStatus ?? "unknown";
  const reasonCodesRaw = parseJsonArray(j.lead.reasonCodesJson);
  const reasonCodes =
    reasonCodesRaw.length === 0 && websiteStatus === "none"
      ? ["No website"]
      : reasonCodesRaw;

  return {
    id: j.lead.id,
    businessName: j.lead.businessName,
    category: j.lead.category,
    city: j.city,
    state: j.state,
    address: j.address,
    zip: j.zip,
    phone: j.phone,
    email: j.email,
    website: j.website,
    verificationStatus: j.lead.verificationStatus,
    leadScore: j.lead.score,
    pipelineStage: j.lead.pipelineStage,
    source: j.lead.source,
    sourceJobId: j.lead.sourceJobId,
    createdAt: iso(j.lead.createdAt),
    lastSeenAt: iso(j.lead.updatedAt) ?? new Date().toISOString(),
    assignedOwner: j.lead.assignedOwner,
    reasonCodes,
    enrichment,
    notes: parseJsonArray(j.lead.notesJson),
    tags: parseJsonArray(j.lead.tagsJson),
  };
}

export function buildLeadDetail(
  j: LeadJoinData,
  activity: LeadActivityItem[],
  pipelineHistory: PipelineTransition[]
): LeadDetailResponse {
  return {
    lead: mapJoinToLead(j),
    activity,
    pipelineHistory,
  };
}

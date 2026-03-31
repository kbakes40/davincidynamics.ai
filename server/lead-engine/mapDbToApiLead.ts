import type {
  Lead,
  LeadActivityItem,
  LeadEnrichment,
  LeadDetailResponse,
  PipelineTransition,
} from "../../shared/lead-engine-types";
import type { LeadEngineLeadRow } from "../../drizzle/leadEnginePgSchema";

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

function normalizeWebsiteStatus(status: string | null | undefined, website: string | null): "no_website" | "weak_website" | "has_website" | "unknown" {
  const s = (status ?? "").trim().toLowerCase();
  if (["no_website", "none", "missing", "invalid_url"].includes(s)) return "no_website";
  if (["weak_website", "broken", "timeout", "redirected"].includes(s)) return "weak_website";
  if (["has_website", "live"].includes(s)) return "has_website";
  if (website) return "has_website";
  return "unknown";
}

export type LeadJoinData = {
  lead: LeadEngineLeadRow;
  phone: string | null;
  email: string | null;
  website: string | null;
  googleBusinessProfile: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
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
        googleBusinessProfile: j.googleBusinessProfile,
        facebook: j.facebook,
        instagram: j.instagram,
        linkedin: j.linkedin,
      }
    : null;

  const websiteStatus = normalizeWebsiteStatus(j.enrichment?.websiteStatus, j.website);
  const reasonCodesRaw = parseJsonArray(j.lead.reasonCodesJson);
  const reasonCodes =
    reasonCodesRaw.length === 0 && websiteStatus === "no_website"
      ? ["No website"]
      : reasonCodesRaw;

  return {
    id: j.lead.id,
    businessName: j.lead.businessName,
    ownerName: j.lead.ownerName ?? null,
    category: j.lead.category,
    subCategory: j.lead.subcategory ?? null,
    city: j.city,
    state: j.state,
    address: j.address,
    zip: j.zip,
    phone: j.phone,
    email: j.email,
    website: j.website,
    googleBusinessProfile: j.googleBusinessProfile,
    facebook: j.facebook,
    instagram: j.instagram,
    linkedin: j.linkedin,
    verificationStatus: j.lead.verificationStatus,
    leadScore: j.lead.score,
    pipelineStage: j.lead.pipelineStage,
    source: j.lead.source,
    sourceJobId: j.lead.sourceJobId,
    priority: j.lead.priority,
    status: j.lead.outreachStatus,
    websiteStatus,
    googleMapsUrl: j.lead.googleMapsUrl ?? null,
    targetZip: j.lead.targetZip ?? null,
    radiusMiles: j.lead.radiusMiles ?? null,
    contactedAt: iso(j.lead.contactedAt),
    followUpAt: iso(j.lead.followUpAt),
    outreachPrep: j.lead.outreachPrep ?? null,
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

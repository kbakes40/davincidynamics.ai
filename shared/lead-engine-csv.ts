import type { Lead } from "./lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "./lead-engine-types";

/** Stable column order for Lead Engine CSV (matches product spec). */
export const LEAD_ENGINE_CSV_HEADERS = [
  "business_name",
  "owner_name",
  "category",
  "sub_category",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "email",
  "website",
  "website_status",
  "google_business_profile",
  "facebook",
  "instagram",
  "linkedin",
  "notes",
  "lead_source",
  "priority",
  "status",
  "radius_miles",
  "target_zip",
  "contacted_at",
  "follow_up_at",
  "created_at",
  "updated_at",
] as const;

function csvCell(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function leadPriorityLabel(l: Lead): string {
  return l.priority ?? (l.leadScore >= 85 ? "high" : l.leadScore >= 70 ? "medium" : "low");
}

function websiteStatus(l: Lead): string {
  return l.websiteStatus ?? (l.website ? "has_website" : "unknown");
}

function socials(l: Lead): string {
  const fromEnrichment = l.enrichment?.socialPresence?.trim();
  if (fromEnrichment) return fromEnrichment;
  if (l.tags.length) return l.tags.join("; ");
  return "";
}

/** ISO-8601 UTC for createdAt column (explicit Z). */
function formatCreatedAtForCsv(l: Lead): string {
  const raw = (l.createdAt && String(l.createdAt).trim()) || l.lastSeenAt;
  const t = Date.parse(raw);
  if (!Number.isFinite(t)) return raw;
  return new Date(t).toISOString();
}

function rowForLead(l: Lead): string[] {
  return [
    l.businessName,
    l.ownerName ?? "",
    l.category,
    l.subCategory ?? "",
    l.address ?? "",
    l.city,
    l.state,
    l.zip ?? "",
    l.phone ?? "",
    l.email ?? "",
    l.website ?? "",
    websiteStatus(l),
    l.googleBusinessProfile ?? "",
    l.facebook ?? "",
    l.instagram ?? "",
    l.linkedin ?? "",
    l.notes.join("; "),
    l.source,
    leadPriorityLabel(l),
    l.status,
    l.radiusMiles == null ? "" : String(l.radiusMiles),
    l.targetZip ?? "",
    l.contactedAt ?? "",
    l.followUpAt ?? "",
    formatCreatedAtForCsv(l),
    l.lastSeenAt,
  ].map(s => csvCell(s));
}

export function buildLeadsCsv(leads: Lead[]): string {
  const lines = [
    LEAD_ENGINE_CSV_HEADERS.join(","),
    ...leads.map(l => rowForLead(l).join(",")),
  ];
  return lines.join("\r\n");
}

/** YYYY-MM-DD in the runtime's default timezone (browser local; on Vercel typically UTC). */
export function localDateYyyyMmDd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function leadEngineExportFilename(d = new Date()): string {
  return `lead-engine-export-${localDateYyyyMmDd(d)}.csv`;
}

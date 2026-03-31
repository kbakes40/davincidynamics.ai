import type { Lead } from "./lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "./lead-engine-types";

/** Stable column order for Lead Engine CSV (matches product spec). */
export const LEAD_ENGINE_CSV_HEADERS = [
  "businessName",
  "owner",
  "category",
  "city",
  "state",
  "zip",
  "address",
  "phone",
  "email",
  "website",
  "websiteStatus",
  "socials",
  "notes",
  "priority",
  "status",
  "createdAt",
] as const;

function csvCell(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function leadPriorityLabel(score: number): string {
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  return "low";
}

function websiteStatus(l: Lead): string {
  return l.website ? "Live" : "None / directory";
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
    l.assignedOwner ?? "",
    l.category,
    l.city,
    l.state,
    l.zip ?? "",
    l.address ?? "",
    l.phone ?? "",
    l.email ?? "",
    l.website ?? "",
    websiteStatus(l),
    socials(l),
    l.notes.join("; "),
    leadPriorityLabel(l.leadScore),
    PIPELINE_STAGE_LABELS[l.pipelineStage],
    formatCreatedAtForCsv(l),
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

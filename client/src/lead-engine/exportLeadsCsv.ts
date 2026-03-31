import type { Lead } from "@shared/lead-engine-types";
import { PIPELINE_STAGE_LABELS } from "@shared/lead-engine-types";

const HEADERS = [
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

function rowForLead(l: Lead): string[] {
  const created = (l.createdAt && String(l.createdAt).trim()) || l.lastSeenAt;
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
    created,
  ].map(s => csvCell(s));
}

export function buildLeadsCsv(leads: Lead[]): string {
  const lines = [HEADERS.join(","), ...leads.map(l => rowForLead(l).join(","))];
  return lines.join("\r\n");
}

export function localDateYyyyMmDd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function downloadTextFile(filename: string, text: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

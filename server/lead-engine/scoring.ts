import type { LeadEngineEnrichmentRow, LeadEngineLeadRow } from "../../drizzle/leadEnginePgSchema";
import type { LeadEnginePriority } from "../../drizzle/leadEngineConstants";

export type ScoreResult = {
  score: number;
  reason: string;
  events: { ruleKey: string; change: number; reason: string }[];
  priority: LeadEnginePriority;
};

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function isTruthyInt(v: number | null | undefined): boolean {
  return v === 1;
}

function parseIcps(): string[] {
  const raw = process.env.LEAD_ENGINE_ICP_CATEGORIES?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

function parseTargetZips(): Set<string> {
  const raw = process.env.LEAD_ENGINE_TARGET_ZIPS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map(z => z.trim())
      .filter(Boolean)
  );
}

function isChainName(name: string): boolean {
  const raw = process.env.LEAD_ENGINE_CHAIN_DENYLIST?.trim();
  if (!raw) return false;
  const terms = raw
    .split(",")
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);
  const n = name.toLowerCase();
  return terms.some(t => n.includes(t));
}

export function computeLeadScore(
  lead: LeadEngineLeadRow,
  enrichment: LeadEngineEnrichmentRow | null,
  ctx: {
    zip: string | null;
    duplicatePenalty?: boolean;
    chainPenalty?: boolean;
    /** +5 when a syntactically valid email is present (verify later). */
    hasFormattedEmail?: boolean;
  }
): ScoreResult {
  const events: ScoreResult["events"] = [];
  let score = 0;

  const hasSite =
    isTruthyInt(enrichment?.hasWebsite) || !!(lead.normalizedWebsite && lead.normalizedWebsite.length > 0);
  const siteStatus = (enrichment?.websiteStatus ?? "unknown").toLowerCase();

  const brokenStatuses = new Set(["broken", "timeout", "dead"]);
  const healthyStatuses = new Set(["live", "redirected"]);

  if (brokenStatuses.has(siteStatus)) {
    events.push({ ruleKey: "broken_website", change: 30, reason: "Website unreachable or error state" });
    score += 30;
  } else {
    const noWeb =
      siteStatus === "missing" ||
      siteStatus === "invalid_url" ||
      siteStatus === "none" ||
      (!hasSite && siteStatus !== "live" && siteStatus !== "redirected");
    const skipNoWebPendingEnrich = siteStatus === "unknown" && hasSite;
    if (noWeb && !skipNoWebPendingEnrich) {
      events.push({ ruleKey: "no_website", change: 35, reason: "No usable website URL" });
      score += 35;
    }
  }

  /** Quality heuristics only when we successfully fetched the site (live or redirect). */
  const siteOkForQuality = hasSite && healthyStatuses.has(siteStatus);

  if (
    siteOkForQuality &&
    enrichment?.mobileFriendly != null &&
    !isTruthyInt(enrichment.mobileFriendly)
  ) {
    events.push({ ruleKey: "poor_mobile", change: 20, reason: "Poor mobile signals" });
    score += 20;
  }

  const hasBooking = isTruthyInt(enrichment?.hasBookingFlow);
  const hasForm = isTruthyInt(enrichment?.hasContactForm);
  if (siteOkForQuality && !hasBooking && !hasForm) {
    events.push({
      ruleKey: "missing_cta",
      change: 15,
      reason: "Missing booking/contact CTA signals",
    });
    score += 15;
  }

  const hasChat = isTruthyInt(enrichment?.hasChatWidget);
  const hasPixel = isTruthyInt(enrichment?.hasMetaPixel);
  if (siteOkForQuality && !hasChat && !hasPixel) {
    events.push({ ruleKey: "no_automation_signals", change: 10, reason: "No chat or Meta Pixel detected" });
    score += 10;
  }

  const zips = parseTargetZips();
  if (zips.size > 0 && ctx.zip && zips.has(ctx.zip)) {
    events.push({ ruleKey: "target_location", change: 10, reason: "Within configured target ZIP list" });
    score += 10;
  }

  const icps = parseIcps();
  if (icps.length > 0) {
    const cat = (lead.category || "").toLowerCase();
    if (icps.some(i => cat.includes(i) || i.includes(cat))) {
      events.push({ ruleKey: "icp_category", change: 15, reason: "Category matches ICP list" });
      score += 15;
    }
  }

  if (lead.ownerName?.trim()) {
    events.push({ ruleKey: "owner_name", change: 5, reason: "Owner name present" });
    score += 5;
  }

  if (lead.verificationStatus === "verified" || ctx.hasFormattedEmail) {
    events.push({ ruleKey: "valid_email_signal", change: 5, reason: "Verified lead or email on file" });
    score += 5;
  }

  if (ctx.duplicatePenalty) {
    events.push({ ruleKey: "duplicate_confidence", change: -50, reason: "High-confidence duplicate match" });
    score -= 50;
  }

  if (ctx.chainPenalty || isChainName(lead.businessName)) {
    events.push({
      ruleKey: "non_target_chain",
      change: -20,
      reason: "Possible chain / enterprise — lower fit",
    });
    score -= 20;
  }

  score = clampScore(score);

  let priority: LeadEnginePriority = "low";
  if (score >= 70) priority = "urgent";
  else if (score >= 50) priority = "high";
  else if (score >= 30) priority = "medium";

  const reason = events.map(e => `${e.ruleKey}:${e.change > 0 ? "+" : ""}${e.change}`).join("; ");
  return { score, reason, events, priority };
}

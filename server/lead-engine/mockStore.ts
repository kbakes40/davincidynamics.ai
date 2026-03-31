import type {
  AnalyticsOverviewResponse,
  DashboardOverviewResponse,
  JobDetailResponse,
  JobsListResponse,
  Lead,
  LeadActivityItem,
  LeadDetailResponse,
  LeadsListResponse,
  OutreachQueueItem,
  OutreachQueueResponse,
  PipelineStage,
  PipelineTransition,
  SearchJob,
  SearchTask,
} from "../../shared/lead-engine-types";
import { PIPELINE_COLUMNS, PIPELINE_STAGE_LABELS } from "../../shared/lead-engine-types";

function iso(d: Date) {
  return d.toISOString();
}

const now = new Date();
const hours = (h: number) => new Date(now.getTime() + h * 3600_000);

const seedJobs: SearchJob[] = [
  {
    id: "job-apex-smoke",
    status: "running",
    source: "Serp + Maps",
    niche: "Smoke shops",
    locationQuery: "Austin, TX +15mi",
    createdAt: iso(hours(-6)),
    startedAt: iso(hours(-5.5)),
    completedAt: null,
    taskTotal: 120,
    taskCompleted: 78,
    taskFailed: 2,
    linkedLeadIds: ["lead-1", "lead-2", "lead-3"],
  },
  {
    id: "job-hookah-dfw",
    status: "completed",
    source: "Directory scrape",
    niche: "Hookah lounges",
    locationQuery: "Dallas–Fort Worth, TX",
    createdAt: iso(hours(-48)),
    startedAt: iso(hours(-47)),
    completedAt: iso(hours(-40)),
    taskTotal: 86,
    taskCompleted: 86,
    taskFailed: 0,
    linkedLeadIds: ["lead-4", "lead-5"],
  },
  {
    id: "job-tobacco-mia",
    status: "queued",
    source: "Manual CSV",
    niche: "Tobacco & cigar",
    locationQuery: "Miami, FL",
    createdAt: iso(hours(-2)),
    startedAt: null,
    completedAt: null,
    taskTotal: 40,
    taskCompleted: 0,
    taskFailed: 0,
    linkedLeadIds: [],
  },
  {
    id: "job-vape-den",
    status: "failed",
    source: "Serp + Maps",
    niche: "Vape shops",
    locationQuery: "Denver, CO",
    createdAt: iso(hours(-72)),
    startedAt: iso(hours(-71)),
    completedAt: iso(hours(-70)),
    taskTotal: 200,
    taskCompleted: 12,
    taskFailed: 188,
    linkedLeadIds: ["lead-8"],
  },
];

const seedTasks: Record<string, SearchTask[]> = {
  "job-apex-smoke": [
    {
      id: "t1",
      jobId: "job-apex-smoke",
      kind: "places.resolve",
      status: "done",
      target: "Cloud City Smoke — Austin",
      lastError: null,
    },
    {
      id: "t2",
      jobId: "job-apex-smoke",
      kind: "website.fetch",
      status: "running",
      target: "https://example-smoke-austin.test",
      lastError: null,
    },
    {
      id: "t3",
      jobId: "job-apex-smoke",
      kind: "enrichment.lookup",
      status: "failed",
      target: "Batch 14",
      lastError: "Timeout contacting enrichment provider",
    },
  ],
  "job-hookah-dfw": [
    {
      id: "t4",
      jobId: "job-hookah-dfw",
      kind: "places.resolve",
      status: "done",
      target: "Oasis Hookah Lounge",
      lastError: null,
    },
  ],
};

const seedLeads: Lead[] = [
  {
    id: "lead-1",
    businessName: "Capital City Smoke & Vape",
    category: "Smoke shop",
    city: "Austin",
    state: "TX",
    address: "1200 Congress Ave Ste 100",
    zip: "78701",
    phone: "+15125550198",
    email: "ops@capitalcitysmoke.example",
    website: "https://capitalcitysmoke.example",
    createdAt: iso(hours(-220)),
    verificationStatus: "verified",
    leadScore: 84,
    pipelineStage: "outreach_ready",
    source: "Serp + Maps",
    sourceJobId: "job-apex-smoke",
    lastSeenAt: iso(hours(-1)),
    assignedOwner: "Vinci",
    reasonCodes: ["Weak checkout", "No mobile optimization"],
    enrichment: {
      summary: "Strong foot traffic location; Shopify theme with friction at cart.",
      techStack: ["Shopify", "Meta Pixel"],
      estimatedMonthlyOrders: "400–600",
      socialPresence: "Instagram 4.2k, Facebook active",
    },
    notes: ["Owner replied once via form — warm."],
    tags: ["high-intent", "atx"],
  },
  {
    id: "lead-2",
    businessName: "Eastside Hookah House",
    category: "Hookah lounge",
    city: "Austin",
    state: "TX",
    address: "4521 E Cesar Chavez St",
    zip: "78702",
    phone: "+15125550277",
    email: null,
    website: null,
    createdAt: iso(hours(-180)),
    verificationStatus: "pending",
    leadScore: 62,
    pipelineStage: "new_lead",
    source: "Serp + Maps",
    sourceJobId: "job-apex-smoke",
    lastSeenAt: iso(hours(-3)),
    assignedOwner: null,
    reasonCodes: ["No website", "Facebook only"],
    enrichment: null,
    notes: [],
    tags: ["directory"],
  },
  {
    id: "lead-3",
    businessName: "Riverside Tobacco Outlet",
    category: "Tobacco shop",
    city: "Austin",
    state: "TX",
    address: "9800 S I-35 Frontage Rd",
    zip: "78748",
    phone: "+15125550301",
    email: "contact@riversidetobacco.example",
    website: "https://riversidetobacco.example",
    createdAt: iso(hours(-300)),
    verificationStatus: "verified",
    leadScore: 71,
    pipelineStage: "site_reviewed",
    source: "Serp + Maps",
    sourceJobId: "job-apex-smoke",
    lastSeenAt: iso(hours(-8)),
    assignedOwner: "Leo",
    reasonCodes: ["Wix site", "No online ordering", "Low review volume"],
    enrichment: {
      summary: "Wix storefront; pickup only, no cart flow.",
      techStack: ["Wix"],
      estimatedMonthlyOrders: "150–250",
      socialPresence: "Facebook only promos",
    },
    notes: [],
    tags: ["wix", "atx"],
  },
  {
    id: "lead-4",
    businessName: "Oasis Hookah Lounge | Frisco",
    category: "Hookah lounge",
    city: "Frisco",
    state: "TX",
    address: "9244 Preston Rd Ste 200",
    zip: "75034",
    phone: "+14695550112",
    email: "hello@oasishookahdfw.example",
    website: "https://oasishookahdfw.example",
    createdAt: iso(hours(-400)),    verificationStatus: "verified",
    leadScore: 88,
    pipelineStage: "outreach_ready",
    source: "Directory scrape",
    sourceJobId: "job-hookah-dfw",
    lastSeenAt: iso(hours(-12)),
    assignedOwner: "Vinci",
    reasonCodes: ["Weak mobile UX"],
    enrichment: {
      summary: "Square Online; mobile PDPs truncate buy CTA.",
      techStack: ["Square"],
      estimatedMonthlyOrders: "800+",
      socialPresence: "TikTok promos, strong local reviews",
    },
    notes: ["Premium fit — prioritize this week."],
    tags: ["dfw", "priority"],
  },
  {
    id: "lead-5",
    businessName: "Blue Mist Tobacco",
    category: "Tobacco shop",
    city: "Plano",
    state: "TX",
    address: "2101 W Spring Creek Pkwy",
    zip: "75023",
    phone: null,
    email: null,
    website: null,
    createdAt: iso(hours(-90)),
    verificationStatus: "unverified",
    leadScore: 41,
    pipelineStage: "new_lead",
    source: "Directory scrape",
    sourceJobId: "job-hookah-dfw",
    lastSeenAt: iso(hours(-20)),
    assignedOwner: null,
    reasonCodes: ["Directory only", "No website"],
    enrichment: null,
    notes: [],
    tags: [],
  },
  {
    id: "lead-6",
    businessName: "South Beach Smoke Co.",
    category: "Smoke shop",
    city: "Miami",
    state: "FL",
    address: "1825 Collins Ave",
    zip: "33139",
    phone: "+13055550144",
    email: "info@southbeachsmoke.example",
    website: "https://southbeachsmoke.example",
    createdAt: iso(hours(-500)),
    verificationStatus: "verified",
    leadScore: 76,
    pipelineStage: "contacted",
    source: "Referral",
    sourceJobId: null,
    lastSeenAt: iso(hours(-5)),
    assignedOwner: "Leo",
    reasonCodes: ["No cart", "Weak checkout"],
    enrichment: {
      summary: "WordPress + Woo; abandoned carts likely.",
      techStack: ["WordPress", "WooCommerce"],
      estimatedMonthlyOrders: "300–450",
      socialPresence: "Instagram heavy",
    },
    notes: ["First touch email sent."],
    tags: ["miami"],
  },
  {
    id: "lead-7",
    businessName: "High Street Cigar Room",
    category: "Cigar lounge",
    city: "Miami",
    state: "FL",
    address: "450 NW 27th Ave",
    zip: "33127",
    phone: "+13055550988",
    email: "reservations@highstreetcigar.example",
    website: "https://highstreetcigar.example",
    createdAt: iso(hours(-600)),
    verificationStatus: "verified",
    leadScore: 92,
    pipelineStage: "follow_up",
    source: "Partner list",
    sourceJobId: null,
    lastSeenAt: iso(hours(-30)),
    assignedOwner: "Vinci",
    reasonCodes: [],
    enrichment: {
      summary: "Custom site; reservations-only, no commerce telemetry.",
      techStack: ["Custom"],
      estimatedMonthlyOrders: null,
      socialPresence: "High Yelp volume",
    },
    notes: ["Decision maker traveling — follow up Friday."],
    tags: ["enterprise-fit"],
  },
  {
    id: "lead-8",
    businessName: "Mile High Clouds",
    category: "Vape shop",
    city: "Denver",
    state: "CO",
    address: "1645 Federal Blvd",
    zip: "80204",
    phone: "+13035550100",
    email: "support@milehighclouds.example",
    website: "https://milehighclouds.example",
    createdAt: iso(hours(-800)),
    verificationStatus: "failed",
    leadScore: 33,
    pipelineStage: "closed_lost",
    source: "Serp + Maps",
    sourceJobId: "job-vape-den",
    lastSeenAt: iso(hours(-200)),
    assignedOwner: null,
    reasonCodes: ["Low review volume", "Weak mobile UX"],
    enrichment: {
      summary: "Stale inventory data; poor CLS on mobile.",
      techStack: ["BigCommerce"],
      estimatedMonthlyOrders: "unknown",
      socialPresence: "Quiet",
    },
    notes: ["Disqualified — competitor lock-in."],
    tags: ["dq"],
  },
];

const seedActivity: LeadActivityItem[] = [
  {
    id: "act-1",
    leadId: "lead-1",
    type: "stage",
    message: "Moved to Outreach ready after site review",
    at: iso(hours(-2)),
    actor: "Vinci",
  },
  {
    id: "act-2",
    leadId: "lead-4",
    type: "note",
    message: "Marked priority — Frisco event season overlap",
    at: iso(hours(-4)),
    actor: "System",
  },
  {
    id: "act-3",
    leadId: "lead-6",
    type: "outreach",
    message: "Email sequence step 1 sent",
    at: iso(hours(-6)),
    actor: "Leo",
  },
  {
    id: "act-4",
    leadId: "lead-3",
    type: "enrichment",
    message: "Enrichment refresh completed",
    at: iso(hours(-8)),
    actor: "System",
  },
  {
    id: "act-5",
    leadId: "lead-2",
    type: "verify",
    message: "Phone verification queued",
    at: iso(hours(-10)),
    actor: "Leo",
  },
];

const seedPipelineHistory: Record<string, PipelineTransition[]> = {
  "lead-1": [
    {
      id: "ph-1",
      leadId: "lead-1",
      from: null,
      to: "new_lead",
      at: iso(hours(-120)),
      actor: "System",
      note: "Ingested",
    },
    {
      id: "ph-2",
      leadId: "lead-1",
      from: "new_lead",
      to: "verified",
      at: iso(hours(-96)),
      actor: "Leo",
      note: null,
    },
    {
      id: "ph-3",
      leadId: "lead-1",
      from: "verified",
      to: "site_reviewed",
      at: iso(hours(-72)),
      actor: "Vinci",
      note: null,
    },
    {
      id: "ph-4",
      leadId: "lead-1",
      from: "site_reviewed",
      to: "outreach_ready",
      at: iso(hours(-2)),
      actor: "Vinci",
      note: "Approved for outreach",
    },
  ],
};

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

let jobs = clone(seedJobs);
let leads = clone(seedLeads);
let activity = clone(seedActivity);
const pipelineHistory = clone(seedPipelineHistory);

export function resetLeadEngineMock() {
  jobs = clone(seedJobs);
  leads = clone(seedLeads);
  activity = clone(seedActivity);
}

export function listJobs(): JobsListResponse {
  return { jobs: clone(jobs).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

export function getJob(id: string): JobDetailResponse | null {
  const job = jobs.find(j => j.id === id);
  if (!job) return null;
  return { job: clone(job), tasks: clone(seedTasks[id] ?? []) };
}

export function cancelJob(id: string): SearchJob | null {
  const job = jobs.find(j => j.id === id);
  if (!job || job.status === "completed" || job.status === "cancelled") return null;
  job.status = "cancelled";
  job.completedAt = iso(new Date());
  return clone(job);
}

export function listLeads(filters: {
  q?: string;
  stage?: PipelineStage;
  verification?: string;
}): LeadsListResponse {
  let out = clone(leads);
  if (filters.q?.trim()) {
    const q = filters.q.toLowerCase();
    out = out.filter(
      l =>
        l.businessName.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }
  if (filters.stage) {
    out = out.filter(l => l.pipelineStage === filters.stage);
  }
  if (filters.verification) {
    out = out.filter(l => l.verificationStatus === filters.verification);
  }
  return { leads: out, total: out.length };
}

export function getLead(id: string): LeadDetailResponse | null {
  const lead = leads.find(l => l.id === id);
  if (!lead) return null;
  const act = activity.filter(x => x.leadId === id).sort((a, b) => b.at.localeCompare(a.at));
  const hist = clone(pipelineHistory[id] ?? []);
  return { lead: clone(lead), activity: act, pipelineHistory: hist };
}

export function patchLeadStage(id: string, stage: PipelineStage): Lead | null {
  const lead = leads.find(l => l.id === id);
  if (!lead) return null;
  const from = lead.pipelineStage;
  lead.pipelineStage = stage;
  lead.lastSeenAt = iso(new Date());
  const tid = `ph-${id}-${Date.now()}`;
  if (!pipelineHistory[id]) pipelineHistory[id] = [];
  pipelineHistory[id].push({
    id: tid,
    leadId: id,
    from,
    to: stage,
    at: iso(new Date()),
    actor: "User",
    note: null,
  });
  activity.unshift({
    id: `act-${Date.now()}`,
    leadId: id,
    type: "stage",
    message: `Stage → ${PIPELINE_STAGE_LABELS[stage]}`,
    at: iso(new Date()),
    actor: "User",
  });
  return clone(lead);
}

export function getOutreachQueue(): OutreachQueueResponse {
  const items: OutreachQueueItem[] = leads
    .filter(l => l.pipelineStage === "outreach_ready")
    .map((l): OutreachQueueItem => {
      const priority: OutreachQueueItem["priority"] =
        l.leadScore >= 85 ? "high" : l.leadScore >= 70 ? "medium" : "low";
      return {
      leadId: l.id,
      businessName: l.businessName,
      city: l.city,
      state: l.state,
      score: l.leadScore,
      openingAngle:
        l.reasonCodes.length > 0
          ? `Lead with ${l.reasonCodes[0].toLowerCase()} — position DaVinci pickup + lower fee stack`
          : "Position conversion systems vs. platform tax",
      siteWeaknessSummary:
        l.enrichment?.summary ??
        (l.reasonCodes.length ? l.reasonCodes.join("; ") : "Needs website review"),
      priority,
      lastReviewAt: l.lastSeenAt,
      owner: l.assignedOwner,
      websiteStatus: l.website ? "Live" : "None / directory",
    };
    })
    .sort((a, b) => b.score - a.score);
  return { items: clone(items) };
}

export function getDashboardOverview(): DashboardOverviewResponse {
  const leadList = clone(leads);
  const jobList = clone(jobs);
  const act = clone(activity).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  const verifiedLeads = leadList.filter(l => l.verificationStatus === "verified").length;
  const outreachReady = leadList.filter(l => l.pipelineStage === "outreach_ready").length;
  const highScore = leadList.filter(l => l.leadScore >= 80).length;
  const cityMap = new Map<string, number>();
  const nicheMap = new Map<string, number>();
  for (const l of leadList) {
    cityMap.set(l.city, (cityMap.get(l.city) ?? 0) + 1);
    nicheMap.set(l.category, (nicheMap.get(l.category) ?? 0) + 1);
  }
  const topCities = Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topNiches = Array.from(nicheMap.entries())
    .map(([niche, count]) => ({ niche, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const outreachScores = leadList.filter(l => l.pipelineStage === "outreach_ready").map(l => l.leadScore);
  const avgOutreach =
    outreachScores.length > 0 ? outreachScores.reduce((a, b) => a + b, 0) / outreachScores.length : 0;
  const verificationRate =
    leadList.length > 0
      ? Math.round((leadList.filter(l => l.verificationStatus === "verified").length / leadList.length) * 100)
      : 0;

  const conversionByStage = PIPELINE_COLUMNS.map(stage => ({
    stage,
    label: PIPELINE_STAGE_LABELS[stage],
    count: leadList.filter(l => l.pipelineStage === stage).length,
  }));

  const trend7d = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const base = 12 + i * 3 + (leadList.length % 5);
    return {
      day: d.toISOString().slice(0, 10),
      users: base + (i % 3) * 2,
      sessions: base + 18 + (i % 4) * 3,
    };
  });

  return {
    activeJobs: jobList.filter(j => j.status === "running").length,
    queuedJobs: jobList.filter(j => j.status === "queued").length,
    verifiedLeads,
    outreachReadyLeads: outreachReady,
    highScoreLeads: highScore,
    recentJobs: jobList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    recentActivity: act,
    topCities,
    topNiches,
    conversionByStage,
    trend7d,
    marketSnapshot: {
      avgScoreOutreachReady: Math.round(avgOutreach),
      verificationRate,
      leadsThisWeek: leadList.length,
    },
  };
}

export function appendNote(id: string, note: string): Lead | null {
  const lead = leads.find(l => l.id === id);
  if (!lead) return null;
  lead.notes.push(note);
  return clone(lead);
}

export function getAnalyticsOverview(): AnalyticsOverviewResponse {
  const leadList = clone(leads);
  const byCity = new Map<string, number>();
  const byNiche = new Map<string, number>();
  const bySource = new Map<string, { sum: number; n: number }>();
  const marketScore = new Map<string, { sum: number; n: number }>();

  for (const l of leadList) {
    byCity.set(l.city, (byCity.get(l.city) ?? 0) + 1);
    byNiche.set(l.category, (byNiche.get(l.category) ?? 0) + 1);
    const sq = bySource.get(l.source) ?? { sum: 0, n: 0 };
    sq.sum += l.leadScore;
    sq.n += 1;
    bySource.set(l.source, sq);
    const mk = `${l.city}, ${l.state}`;
    const m = marketScore.get(mk) ?? { sum: 0, n: 0 };
    m.sum += l.leadScore;
    m.n += 1;
    marketScore.set(mk, m);
  }

  const buckets = [
    { label: "0–39", min: 0, max: 39 },
    { label: "40–59", min: 40, max: 59 },
    { label: "60–79", min: 60, max: 79 },
    { label: "80–100", min: 80, max: 100 },
  ];
  const scoreDistribution = buckets.map(b => ({
    bucket: b.label,
    count: leadList.filter(l => l.leadScore >= b.min && l.leadScore <= b.max).length,
  }));

  const total = leadList.length;
  const verified = leadList.filter(l => l.verificationStatus === "verified").length;
  const siteDone = leadList.filter(
    l => l.pipelineStage !== "new_lead" && l.verificationStatus === "verified"
  ).length;
  const outreach = leadList.filter(l => l.pipelineStage === "outreach_ready").length;

  const verificationFunnel = [
    { step: "Ingested", count: total },
    { step: "Verified", count: verified },
    { step: "Past new lead", count: siteDone },
    { step: "Outreach ready", count: outreach },
  ];

  const outreachReadyRate =
    total > 0 ? Math.round((leadList.filter(l => l.pipelineStage === "outreach_ready").length / total) * 100) : 0;

  const pipelineConversion = PIPELINE_COLUMNS.map(stage => ({
    stage,
    label: PIPELINE_STAGE_LABELS[stage],
    count: leadList.filter(l => l.pipelineStage === stage).length,
    pctOfTotal: total > 0 ? Math.round((leadList.filter(l => l.pipelineStage === stage).length / total) * 100) : 0,
  }));

  const topMarkets = Array.from(marketScore.entries())
    .map(([label, { sum, n }]) => ({ label, avgScore: Math.round(sum / n), leads: n }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6);

  const sourceQuality = Array.from(bySource.entries())
    .map(([source, { sum, n }]) => ({ source, avgScore: Math.round(sum / n), count: n }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return {
    volumeByCity: Array.from(byCity.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count),
    volumeByNiche: Array.from(byNiche.entries())
      .map(([niche, count]) => ({ niche, count }))
      .sort((a, b) => b.count - a.count),
    scoreDistribution,
    verificationFunnel,
    outreachReadyRate,
    pipelineConversion,
    topMarkets,
    sourceQuality,
  };
}

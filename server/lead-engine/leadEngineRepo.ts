import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  leadEngineActivityLog,
  leadEngineAddresses,
  leadEngineAgentQueues,
  leadEngineContactPoints,
  leadEngineEnrichment,
  leadEngineImportBatches,
  leadEngineLeads,
  leadEnginePipelineEvents,
  leadEngineScoringEvents,
  leadEngineSources,
  type LeadEngineLeadRow,
} from "../../drizzle/leadEngineSchema";
import type {
  AnalyticsOverviewResponse,
  DashboardOverviewResponse,
  JobDetailResponse,
  JobsListResponse,
  LeadActivityItem,
  LeadsListResponse,
  OutreachQueueItem,
  OutreachQueueResponse,
  PipelineStage,
  PipelineTransition,
  SearchJob,
  SearchTask,
} from "../../shared/lead-engine-types";
import { PIPELINE_COLUMNS, PIPELINE_STAGE_LABELS } from "../../shared/lead-engine-types";
import {
  getDatabaseConnectivityCode,
  getDb,
  invalidateDbCache,
  isDatabaseConnectivityError,
} from "../db";
import { mapCsvRowToLeadInput } from "./columnMapping";
import { parseCsv } from "./csvParse";
import { buildLeadDetail, mapJoinToLead, type LeadJoinData } from "./mapDbToApiLead";
import { normalizeLeadFields } from "./normalizeLeadFields";
import { batchToSearchJob } from "./leadEngineDashboardHelpers";
import { computeLeadScore } from "./scoring";

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export async function requireLeadEngineDb(): Promise<Db | null> {
  return getDb();
}

/** Avoid crashing the dev server when MySQL is misconfigured or unreachable (ETIMEDOUT, etc.). */
async function withLeadEngineDb<T>(fallback: T, run: (db: Db) => Promise<T>): Promise<T> {
  const db = await requireLeadEngineDb();
  if (!db) return fallback;
  try {
    return await run(db);
  } catch (e) {
    if (isDatabaseConnectivityError(e)) {
      console.warn(
        "[LeadEngine] Database unreachable:",
        getDatabaseConnectivityCode(e) ?? (e instanceof Error ? e.message : "unknown")
      );
      invalidateDbCache();
      return fallback;
    }
    throw e;
  }
}

async function loadJoinMap(db: Db, leadRows: LeadEngineLeadRow[]): Promise<Map<string, LeadJoinData>> {
  const ids = leadRows.map(r => r.id);
  if (ids.length === 0) return new Map();

  const contacts = await db
    .select()
    .from(leadEngineContactPoints)
    .where(inArray(leadEngineContactPoints.leadId, ids));

  const addrs = await db
    .select()
    .from(leadEngineAddresses)
    .where(inArray(leadEngineAddresses.leadId, ids));

  const enrich = await db
    .select()
    .from(leadEngineEnrichment)
    .where(inArray(leadEngineEnrichment.leadId, ids));

  const phoneByLead = new Map<string, string>();
  const emailByLead = new Map<string, string>();
  const siteByLead = new Map<string, string>();
  for (const c of contacts) {
    if (c.type === "phone" && !phoneByLead.has(c.leadId)) phoneByLead.set(c.leadId, c.value);
    if (c.type === "email" && !emailByLead.has(c.leadId)) emailByLead.set(c.leadId, c.value);
    if (c.type === "website" && !siteByLead.has(c.leadId)) siteByLead.set(c.leadId, c.value);
  }

  const addrByLead = new Map(addrs.map(a => [a.leadId, a]));
  const enrichByLead = new Map(enrich.map(e => [e.leadId, e]));

  const out = new Map<string, LeadJoinData>();
  for (const lead of leadRows) {
    const a = addrByLead.get(lead.id);
    const e = enrichByLead.get(lead.id);
    out.set(lead.id, {
      lead,
      phone: phoneByLead.get(lead.id) ?? null,
      email: emailByLead.get(lead.id) ?? null,
      website: siteByLead.get(lead.id) ?? null,
      city: a?.city ?? "",
      state: a?.state ?? "",
      zip: a?.zip ?? null,
      address: a?.address1 ?? null,
      enrichment: e
        ? {
            websiteStatus: e.websiteStatus,
            hasWebsite: e.hasWebsite,
            summary: e.summary,
            techStackJson: e.techStackJson,
            socialPresence: e.socialPresence,
            estimatedMonthlyOrders: e.estimatedMonthlyOrders,
          }
        : null,
    });
  }
  return out;
}

export async function getAllLeadsForExport(): Promise<ReturnType<typeof mapJoinToLead>[]> {
  return withLeadEngineDb([], async db => {
    const leadRows = await db.select().from(leadEngineLeads);
    const jm = await loadJoinMap(db, leadRows);
    return leadRows.map(r => mapJoinToLead(jm.get(r.id)!));
  });
}

export async function listLeadsApi(filters: {
  q?: string;
  stage?: PipelineStage;
  verification?: string;
}): Promise<LeadsListResponse> {
  return withLeadEngineDb({ leads: [], total: 0 }, async db => {
    const conditions = [];
    if (filters.stage) conditions.push(eq(leadEngineLeads.pipelineStage, filters.stage));
    if (filters.verification) {
      conditions.push(
        eq(
          leadEngineLeads.verificationStatus,
          filters.verification as LeadEngineLeadRow["verificationStatus"]
        )
      );
    }

    let leadRows = await db
      .select()
      .from(leadEngineLeads)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(leadEngineLeads.updatedAt));

    const jm = await loadJoinMap(db, leadRows);
    let leads = leadRows.map(r => mapJoinToLead(jm.get(r.id)!));

    if (filters.q?.trim()) {
      const q = filters.q.trim().toLowerCase();
      leads = leads.filter(
        l =>
          l.businessName.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    return { leads, total: leads.length };
  });
}

export async function getLeadDetailApi(id: string) {
  return withLeadEngineDb(null, async db => {
    const row = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, id)).limit(1);
    if (!row[0]) return null;
    const jm = await loadJoinMap(db, [row[0]]);
    const j = jm.get(id)!;

    const acts = await db
      .select()
      .from(leadEngineActivityLog)
      .where(eq(leadEngineActivityLog.leadId, id))
      .orderBy(desc(leadEngineActivityLog.at))
      .limit(50);

    const activity: LeadActivityItem[] = acts.map(a => ({
      id: a.id,
      leadId: a.leadId,
      type: a.type,
      message: a.message,
      at: a.at.toISOString(),
      actor: a.actor,
    }));

    const pipes = await db
      .select()
      .from(leadEnginePipelineEvents)
      .where(eq(leadEnginePipelineEvents.leadId, id))
      .orderBy(leadEnginePipelineEvents.at);

    const pipelineHistory: PipelineTransition[] = pipes.map(p => ({
      id: p.id,
      leadId: p.leadId,
      from: (p.fromStage as PipelineStage | null) ?? null,
      to: p.toStage as PipelineStage,
      at: p.at.toISOString(),
      actor: p.actor,
      note: p.note,
    }));

    return buildLeadDetail(j, activity, pipelineHistory);
  });
}

export async function patchLeadPipelineStageApi(id: string, stage: PipelineStage) {
  return withLeadEngineDb(null, async db => {
    const row = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, id)).limit(1);
    if (!row[0]) return null;
    const from = row[0].pipelineStage;

    await db
      .update(leadEngineLeads)
      .set({ pipelineStage: stage, updatedAt: new Date() })
      .where(eq(leadEngineLeads.id, id));

    const peId = nanoid();
    await db.insert(leadEnginePipelineEvents).values({
      id: peId,
      leadId: id,
      fromStage: from,
      toStage: stage,
      at: new Date(),
      actor: "user",
      note: null,
    });

    const actId = nanoid();
    await db.insert(leadEngineActivityLog).values({
      id: actId,
      leadId: id,
      type: "stage",
      message: `Stage → ${PIPELINE_STAGE_LABELS[stage]}`,
      at: new Date(),
      actor: "User",
    });

    const updated = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, id)).limit(1);
    const jm = await loadJoinMap(db, [updated[0]!]);
    return mapJoinToLead(jm.get(id)!);
  });
}

export async function listJobsApi(): Promise<JobsListResponse> {
  return withLeadEngineDb({ jobs: [] }, async db => {
    const batches = await db
      .select()
      .from(leadEngineImportBatches)
      .orderBy(desc(leadEngineImportBatches.startedAt))
      .limit(100);
    return { jobs: batches.map(batchToSearchJob) };
  });
}

export async function getJobApi(id: string): Promise<JobDetailResponse | null> {
  return withLeadEngineDb(null, async db => {
    const rows = await db
      .select()
      .from(leadEngineImportBatches)
      .where(eq(leadEngineImportBatches.id, id))
      .limit(1);
    if (!rows[0]) return null;
    const tasks: SearchTask[] = parseTasksFromErrorLog(rows[0].errorLog);
    return { job: batchToSearchJob(rows[0]), tasks };
  });
}

function parseTasksFromErrorLog(errorLog: string | null): SearchTask[] {
  if (!errorLog?.trim()) return [];
  try {
    const parsed = JSON.parse(errorLog) as { tasks?: SearchTask[] };
    return Array.isArray(parsed.tasks) ? parsed.tasks : [];
  } catch {
    return [];
  }
}

export async function cancelJobApi(id: string): Promise<SearchJob | null> {
  return withLeadEngineDb(null, async db => {
    const rows = await db
      .select()
      .from(leadEngineImportBatches)
      .where(eq(leadEngineImportBatches.id, id))
      .limit(1);
    const b = rows[0];
    if (!b || b.status === "completed" || b.status === "cancelled") return null;
    await db
      .update(leadEngineImportBatches)
      .set({ status: "cancelled", completedAt: new Date() })
      .where(eq(leadEngineImportBatches.id, id));
    const after = await db
      .select()
      .from(leadEngineImportBatches)
      .where(eq(leadEngineImportBatches.id, id))
      .limit(1);
    return after[0] ? batchToSearchJob(after[0]) : null;
  });
}

export async function listImportBatchesApi() {
  return withLeadEngineDb({ batches: [] }, async db => {
    const batches = await db
      .select()
      .from(leadEngineImportBatches)
      .orderBy(desc(leadEngineImportBatches.startedAt))
      .limit(100);
    return { batches };
  });
}

export async function getOutreachQueueApi(): Promise<OutreachQueueResponse> {
  return withLeadEngineDb({ items: [] }, async db => {
    const leadRows = await db
      .select()
      .from(leadEngineLeads)
      .where(eq(leadEngineLeads.pipelineStage, "outreach_ready"))
      .orderBy(desc(leadEngineLeads.score));
    const jm = await loadJoinMap(db, leadRows);
    const items: OutreachQueueItem[] = leadRows.map(r => {
      const join = jm.get(r.id)!;
      const L = mapJoinToLead(join);
      const priority: OutreachQueueItem["priority"] =
        L.leadScore >= 85 ? "high" : L.leadScore >= 70 ? "medium" : "low";
      const web = join.enrichment?.websiteStatus ?? (L.website ? "unknown" : "none");
      return {
        leadId: L.id,
        businessName: L.businessName,
        city: L.city,
        state: L.state,
        score: L.leadScore,
        openingAngle:
          L.reasonCodes.length > 0
            ? `Lead with ${L.reasonCodes[0]!.toLowerCase()} — position DaVinci pickup + lower fee stack`
            : "Position conversion systems vs. platform tax",
        siteWeaknessSummary:
          L.enrichment?.summary ??
          (L.reasonCodes.length ? L.reasonCodes.join("; ") : "Needs website review"),
        priority,
        lastReviewAt: L.lastSeenAt,
        owner: L.assignedOwner,
        websiteStatus: web === "none" ? "None / directory" : web,
      };
    });
    return { items };
  });
}

export async function findDuplicateLeadId(
  db: Db,
  n: {
    normalizedPhone: string | null;
    normalizedWebsite: string | null;
    normalizedBusinessName: string;
    zip: string | null;
  }
): Promise<string | null> {
  if (n.normalizedPhone) {
    const r = await db
      .select({ id: leadEngineLeads.id })
      .from(leadEngineLeads)
      .where(eq(leadEngineLeads.normalizedPhone, n.normalizedPhone))
      .limit(1);
    if (r[0]) return r[0].id;
  }
  if (n.normalizedWebsite) {
    const r = await db
      .select({ id: leadEngineLeads.id })
      .from(leadEngineLeads)
      .where(eq(leadEngineLeads.normalizedWebsite, n.normalizedWebsite))
      .limit(1);
    if (r[0]) return r[0].id;
  }
  if (n.normalizedBusinessName && n.zip) {
    const r = await db
      .select({ id: leadEngineLeads.id })
      .from(leadEngineLeads)
      .innerJoin(leadEngineAddresses, eq(leadEngineAddresses.leadId, leadEngineLeads.id))
      .where(
        and(eq(leadEngineLeads.normalizedBusinessName, n.normalizedBusinessName), eq(leadEngineAddresses.zip, n.zip))
      )
      .limit(1);
    if (r[0]) return r[0].id;
  }
  return null;
}

async function persistScore(db: Db, leadId: string, leadRow: LeadEngineLeadRow, enrichmentRow: typeof leadEngineEnrichment.$inferSelect | null) {
  const addr = await db
    .select()
    .from(leadEngineAddresses)
    .where(eq(leadEngineAddresses.leadId, leadId))
    .limit(1);
  const zip = addr[0]?.zip ?? null;

  const emails = await db
    .select()
    .from(leadEngineContactPoints)
    .where(
      and(eq(leadEngineContactPoints.leadId, leadId), eq(leadEngineContactPoints.type, "email"))
    );
  const hasFormattedEmail = emails.some(e => /@/.test(e.value));

  const result = computeLeadScore(leadRow, enrichmentRow, {
    zip,
    hasFormattedEmail,
    duplicatePenalty: false,
    chainPenalty: false,
  });

  await db.delete(leadEngineScoringEvents).where(eq(leadEngineScoringEvents.leadId, leadId));

  for (const e of result.events) {
    await db.insert(leadEngineScoringEvents).values({
      id: nanoid(),
      leadId,
      scoreChange: e.change,
      reason: e.reason,
      ruleKey: e.ruleKey,
      createdAt: new Date(),
    });
  }

  await db
    .update(leadEngineLeads)
    .set({
      score: result.score,
      scoreReason: result.reason,
      priority: result.priority,
      updatedAt: new Date(),
    })
    .where(eq(leadEngineLeads.id, leadId));
}

export async function importLeadsFromCsv(
  csvText: string,
  opts: { fileName?: string; sourceLabel?: string }
): Promise<{
  batchId: string;
  insertedRows: number;
  updatedRows: number;
  duplicateRows: number;
  failedRows: number;
  errors: string[];
}> {
  const db = await requireLeadEngineDb();
  if (!db) {
    throw new Error("database_unavailable");
  }

  try {
  const { rows } = parseCsv(csvText);
  const batchId = nanoid();
  const sourceLabel = opts.sourceLabel ?? "csv";

  await db.insert(leadEngineImportBatches).values({
    id: batchId,
    sourceName: sourceLabel,
    fileName: opts.fileName ?? null,
    status: "processing",
    totalRows: rows.length,
    startedAt: new Date(),
  });

  const errors: string[] = [];
  let insertedRows = 0;
  let updatedRows = 0;
  let duplicateRows = 0;
  let failedRows = 0;
  const linkedIds: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    try {
      const mapped = mapCsvRowToLeadInput(row, sourceLabel);
      if (!mapped.businessName) {
        failedRows++;
        errors.push(`Row ${i + 2}: missing business name`);
        continue;
      }

      const norm = normalizeLeadFields({
        businessName: mapped.businessName,
        phone: mapped.phone || null,
        email: mapped.email || null,
        website: mapped.website || null,
      });

      const dupId = await findDuplicateLeadId(db, {
        normalizedPhone: norm.normalizedPhone,
        normalizedWebsite: norm.normalizedWebsite,
        normalizedBusinessName: norm.normalizedBusinessName,
        zip: mapped.zip || null,
      });

      const now = new Date();
      const rawJson = JSON.stringify(row);

      if (dupId) {
        duplicateRows++;
        await db
          .update(leadEngineLeads)
          .set({
            businessName: mapped.businessName || undefined,
            category: mapped.category || undefined,
            ownerName: mapped.ownerName || undefined,
            source: mapped.source,
            sourceJobId: batchId,
            normalizedBusinessName: norm.normalizedBusinessName,
            normalizedPhone: norm.normalizedPhone ?? undefined,
            normalizedWebsite: norm.normalizedWebsite ?? undefined,
            updatedAt: now,
          })
          .where(eq(leadEngineLeads.id, dupId));

        const a = await db
          .select()
          .from(leadEngineAddresses)
          .where(eq(leadEngineAddresses.leadId, dupId))
          .limit(1);
        if (a[0]) {
          await db
            .update(leadEngineAddresses)
            .set({
              address1: mapped.address || a[0].address1,
              city: mapped.city || a[0].city,
              state: mapped.state || a[0].state,
              zip: mapped.zip || a[0].zip,
            })
            .where(eq(leadEngineAddresses.id, a[0].id));
        } else if (mapped.city || mapped.state || mapped.zip) {
          await db.insert(leadEngineAddresses).values({
            id: nanoid(),
            leadId: dupId,
            address1: mapped.address || null,
            city: mapped.city || "",
            state: mapped.state || "",
            zip: mapped.zip || null,
          });
        }

        await upsertContact(db, dupId, "phone", norm.phoneDisplay, true);
        await upsertContact(db, dupId, "email", norm.email, true);
        await upsertContact(db, dupId, "website", norm.websiteDisplay, true);

        await db.insert(leadEngineSources).values({
          id: nanoid(),
          leadId: dupId,
          sourceName: sourceLabel,
          sourceType: "csv",
          importBatchId: batchId,
          rawPayloadJson: rawJson,
        });

        const leadAfter = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, dupId)).limit(1);
        const enr = await db
          .select()
          .from(leadEngineEnrichment)
          .where(eq(leadEngineEnrichment.leadId, dupId))
          .limit(1);
        if (leadAfter[0]) await persistScore(db, dupId, leadAfter[0], enr[0] ?? null);

        updatedRows++;
        if (!linkedIds.includes(dupId)) linkedIds.push(dupId);
        continue;
      }

      const leadId = nanoid();
      await db.insert(leadEngineLeads).values({
        id: leadId,
        businessName: mapped.businessName,
        ownerName: mapped.ownerName || null,
        category: mapped.category,
        source: mapped.source,
        sourceJobId: batchId,
        normalizedBusinessName: norm.normalizedBusinessName,
        normalizedPhone: norm.normalizedPhone,
        normalizedWebsite: norm.normalizedWebsite,
        leadStatus: "new",
        outreachStatus: "not_contacted",
        pipelineStage: "new_lead",
        verificationStatus: "unverified",
        notesJson: JSON.stringify([]),
        reasonCodesJson: JSON.stringify([]),
        tagsJson: JSON.stringify([]),
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(leadEngineAddresses).values({
        id: nanoid(),
        leadId,
        address1: mapped.address || null,
        city: mapped.city || "",
        state: mapped.state || "",
        zip: mapped.zip || null,
      });

      if (norm.phoneDisplay) {
        await db.insert(leadEngineContactPoints).values({
          id: nanoid(),
          leadId,
          type: "phone",
          value: norm.phoneDisplay,
          isPrimary: 1,
          source: "csv",
        });
      }
      if (norm.email) {
        await db.insert(leadEngineContactPoints).values({
          id: nanoid(),
          leadId,
          type: "email",
          value: norm.email,
          isPrimary: 1,
          source: "csv",
        });
      }
      if (norm.websiteDisplay) {
        await db.insert(leadEngineContactPoints).values({
          id: nanoid(),
          leadId,
          type: "website",
          value: norm.websiteDisplay,
          isPrimary: 1,
          source: "csv",
        });
      }

      const hasSite = !!norm.normalizedWebsite;
      await db.insert(leadEngineEnrichment).values({
        id: nanoid(),
        leadId,
        websiteStatus: hasSite ? "unknown" : "none",
        hasWebsite: hasSite ? 1 : 0,
        enrichedAt: now,
      });

      await db.insert(leadEngineSources).values({
        id: nanoid(),
        leadId,
        sourceName: sourceLabel,
        sourceType: "csv",
        importBatchId: batchId,
        rawPayloadJson: rawJson,
      });

      const leadRow = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
      const enrRow = await db
        .select()
        .from(leadEngineEnrichment)
        .where(eq(leadEngineEnrichment.leadId, leadId))
        .limit(1);
      if (leadRow[0]) await persistScore(db, leadId, leadRow[0], enrRow[0] ?? null);

      await db.insert(leadEngineActivityLog).values({
        id: nanoid(),
        leadId,
        type: "import",
        message: `Imported via CSV batch ${batchId}`,
        at: now,
        actor: "system",
      });

      insertedRows++;
      linkedIds.push(leadId);
    } catch (e) {
      failedRows++;
      errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  await db
    .update(leadEngineImportBatches)
    .set({
      status: failedRows === rows.length && insertedRows === 0 && updatedRows === 0 ? "failed" : "completed",
      insertedRows,
      updatedRows,
      duplicateRows,
      failedRows,
      errorLog: errors.length ? JSON.stringify({ messages: errors.slice(0, 200) }) : null,
      linkedLeadIdsJson: JSON.stringify(linkedIds),
      completedAt: new Date(),
    })
    .where(eq(leadEngineImportBatches.id, batchId));

  return { batchId, insertedRows, updatedRows, duplicateRows, failedRows, errors };
  } catch (e) {
    if (isDatabaseConnectivityError(e)) {
      invalidateDbCache();
      throw new Error("database_unavailable");
    }
    throw e;
  }
}

async function upsertContact(
  db: Db,
  leadId: string,
  type: "phone" | "email" | "website",
  value: string | null,
  primary: boolean
) {
  if (!value) return;
  const existing = await db
    .select()
    .from(leadEngineContactPoints)
    .where(and(eq(leadEngineContactPoints.leadId, leadId), eq(leadEngineContactPoints.type, type)))
    .limit(1);
  if (existing[0]) {
    await db
      .update(leadEngineContactPoints)
      .set({ value, isPrimary: primary ? 1 : 0 })
      .where(eq(leadEngineContactPoints.id, existing[0].id));
  } else {
    await db.insert(leadEngineContactPoints).values({
      id: nanoid(),
      leadId,
      type,
      value,
      isPrimary: primary ? 1 : 0,
      source: "csv",
    });
  }
}

export async function enrichLeadStub(leadId: string): Promise<boolean> {
  return withLeadEngineDb(false, async db => {
    const lead = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
    if (!lead[0]) return false;
    const enr = await db
      .select()
      .from(leadEngineEnrichment)
      .where(eq(leadEngineEnrichment.leadId, leadId))
      .limit(1);
    const now = new Date();
    if (enr[0]) {
      await db
        .update(leadEngineEnrichment)
        .set({
          summary: "Enrichment pending — wire Clay / BuiltWith / live checks in phase 2.",
          enrichedAt: now,
        })
        .where(eq(leadEngineEnrichment.id, enr[0].id));
    } else {
      await db.insert(leadEngineEnrichment).values({
        id: nanoid(),
        leadId,
        websiteStatus: "unknown",
        hasWebsite: 0,
        summary: "Enrichment pending — wire external providers in phase 2.",
        enrichedAt: now,
      });
    }
    await db
      .update(leadEngineLeads)
      .set({ leadStatus: "enriched", updatedAt: now })
      .where(eq(leadEngineLeads.id, leadId));

    const row = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
    const er = await db.select().from(leadEngineEnrichment).where(eq(leadEngineEnrichment.leadId, leadId)).limit(1);
    if (row[0]) await persistScore(db, leadId, row[0], er[0] ?? null);
    return true;
  });
}

export async function validateLeadStub(leadId: string): Promise<boolean> {
  return withLeadEngineDb(false, async db => {
    const lead = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
    if (!lead[0]) return false;
    const now = new Date();
    await db
      .update(leadEngineLeads)
      .set({
        verificationStatus: "verified",
        leadStatus: "validated",
        lastVerifiedAt: now,
        updatedAt: now,
      })
      .where(eq(leadEngineLeads.id, leadId));
    const row = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
    const er = await db.select().from(leadEngineEnrichment).where(eq(leadEngineEnrichment.leadId, leadId)).limit(1);
    if (row[0]) await persistScore(db, leadId, row[0], er[0] ?? null);
    return true;
  });
}

export async function assignAgentQueueStub(
  leadId: string,
  agent: "vinci" | "leo",
  reason?: string
): Promise<boolean> {
  return withLeadEngineDb(false, async db => {
    const lead = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
    if (!lead[0]) return false;
    await db.insert(leadEngineAgentQueues).values({
      id: nanoid(),
      leadId,
      assignedAgent: agent,
      queueStatus: "pending",
      reason: reason ?? null,
      scheduledFor: new Date(),
    });
    return true;
  });
}

export type DedupeReportResponse =
  | { ok: true; groups: { key: string; ids: string[] }[] }
  | { ok: false; message: string; groups: { key: string; ids: string[] }[] };

export async function runDedupeReportApi(): Promise<DedupeReportResponse> {
  return withLeadEngineDb<DedupeReportResponse>(
    { ok: false, message: "database_unavailable", groups: [] },
    async db => {
      const phoneDupes = await db
        .select({ phone: leadEngineLeads.normalizedPhone, c: sql<number>`count(*)`.mapWith(Number) })
        .from(leadEngineLeads)
        .where(sql`${leadEngineLeads.normalizedPhone} is not null`)
        .groupBy(leadEngineLeads.normalizedPhone)
        .having(sql`count(*) > 1`);

      const groups: { key: string; ids: string[] }[] = [];
      for (const row of phoneDupes) {
        if (!row.phone) continue;
        const ids = await db
          .select({ id: leadEngineLeads.id })
          .from(leadEngineLeads)
          .where(eq(leadEngineLeads.normalizedPhone, row.phone));
        groups.push({ key: `phone:${row.phone}`, ids: ids.map(x => x.id) });
      }
      return { ok: true, groups };
    }
  );
}

export async function scoreLeadById(leadId: string): Promise<boolean> {
  return withLeadEngineDb(false, async db => {
    const lead = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
    if (!lead[0]) return false;
    const enr = await db.select().from(leadEngineEnrichment).where(eq(leadEngineEnrichment.leadId, leadId)).limit(1);
    await persistScore(db, leadId, lead[0], enr[0] ?? null);
    return true;
  });
}

export async function scoreAllLeads(): Promise<{ updated: number }> {
  return withLeadEngineDb({ updated: 0 }, async db => {
    const rows = await db.select({ id: leadEngineLeads.id }).from(leadEngineLeads);
    for (const r of rows) {
      const lead = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, r.id)).limit(1);
      if (!lead[0]) continue;
      const enr = await db.select().from(leadEngineEnrichment).where(eq(leadEngineEnrichment.leadId, r.id)).limit(1);
      await persistScore(db, r.id, lead[0], enr[0] ?? null);
    }
    return { updated: rows.length };
  });
}

function emptyDashboard(): DashboardOverviewResponse {
  return {
    activeJobs: 0,
    queuedJobs: 0,
    verifiedLeads: 0,
    outreachReadyLeads: 0,
    highScoreLeads: 0,
    recentJobs: [],
    recentActivity: [],
    topCities: [],
    topNiches: [],
    conversionByStage: PIPELINE_COLUMNS.map(stage => ({
      stage,
      label: PIPELINE_STAGE_LABELS[stage],
      count: 0,
    })),
    trend7d: [],
    marketSnapshot: {
      avgScoreOutreachReady: 0,
      verificationRate: 0,
      leadsThisWeek: 0,
    },
  };
}

export async function getDashboardOverviewApi(): Promise<DashboardOverviewResponse> {
  return withLeadEngineDb(emptyDashboard(), async db => {
  const leadList = await db.select().from(leadEngineLeads);
  const jobList = await db
    .select()
    .from(leadEngineImportBatches)
    .orderBy(desc(leadEngineImportBatches.startedAt))
    .limit(100);

  const actRows = await db
    .select()
    .from(leadEngineActivityLog)
    .orderBy(desc(leadEngineActivityLog.at))
    .limit(8);

  const recentActivity: LeadActivityItem[] = actRows.map(a => ({
    id: a.id,
    leadId: a.leadId,
    type: a.type,
    message: a.message,
    at: a.at.toISOString(),
    actor: a.actor,
  }));

  const verifiedLeads = leadList.filter(l => l.verificationStatus === "verified").length;
  const outreachReady = leadList.filter(l => l.pipelineStage === "outreach_ready").length;
  const highScore = leadList.filter(l => l.score >= 80).length;

  const topCityRows = await db
    .select({
      city: leadEngineAddresses.city,
      c: sql<number>`count(*)`.mapWith(Number),
    })
    .from(leadEngineAddresses)
    .groupBy(leadEngineAddresses.city)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const topCities = topCityRows.filter(r => r.city).map(r => ({ city: r.city, count: r.c }));

  const nicheMap = new Map<string, number>();
  for (const l of leadList) {
    nicheMap.set(l.category, (nicheMap.get(l.category) ?? 0) + 1);
  }
  const topNiches = Array.from(nicheMap.entries())
    .map(([niche, count]) => ({ niche, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const outreachScores = leadList.filter(l => l.pipelineStage === "outreach_ready").map(l => l.score);
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

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const leadsThisWeek = leadList.filter(l => l.createdAt >= weekAgo).length;

  const trendStart = new Date();
  trendStart.setDate(trendStart.getDate() - 6);
  trendStart.setHours(0, 0, 0, 0);
  const dayMap = new Map<string, number>();
  for (const l of leadList) {
    if (l.createdAt >= trendStart) {
      const key = l.createdAt.toISOString().slice(0, 10);
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
  }
  const trend7d: DashboardOverviewResponse["trend7d"] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(trendStart);
    d.setDate(trendStart.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const n = dayMap.get(key) ?? 0;
    trend7d.push({ day: key, users: n, sessions: n });
  }

  return {
    activeJobs: jobList.filter(j => j.status === "processing").length,
    queuedJobs: jobList.filter(j => j.status === "pending").length,
    verifiedLeads,
    outreachReadyLeads: outreachReady,
    highScoreLeads: highScore,
    recentJobs: jobList.slice(0, 5).map(batchToSearchJob),
    recentActivity,
    topCities,
    topNiches,
    conversionByStage,
    trend7d,
    marketSnapshot: {
      avgScoreOutreachReady: Math.round(avgOutreach),
      verificationRate,
      leadsThisWeek,
    },
  };
  });
}

function emptyAnalytics(): AnalyticsOverviewResponse {
  return {
    volumeByCity: [],
    volumeByNiche: [],
    scoreDistribution: [
      { bucket: "0–39", count: 0 },
      { bucket: "40–59", count: 0 },
      { bucket: "60–79", count: 0 },
      { bucket: "80–100", count: 0 },
    ],
    verificationFunnel: [
      { step: "Ingested", count: 0 },
      { step: "Verified", count: 0 },
      { step: "Past new lead", count: 0 },
      { step: "Outreach ready", count: 0 },
    ],
    outreachReadyRate: 0,
    pipelineConversion: PIPELINE_COLUMNS.map(stage => ({
      stage,
      label: PIPELINE_STAGE_LABELS[stage],
      count: 0,
      pctOfTotal: 0,
    })),
    topMarkets: [],
    sourceQuality: [],
  };
}

export async function getAnalyticsOverviewApi(): Promise<AnalyticsOverviewResponse> {
  return withLeadEngineDb(emptyAnalytics(), async db => {
  const leadList = await db.select().from(leadEngineLeads);
  const total = leadList.length;
  if (total === 0) return emptyAnalytics();

  const byCity = new Map<string, number>();
  const byNiche = new Map<string, number>();
  const bySource = new Map<string, { sum: number; n: number }>();
  const marketScore = new Map<string, { sum: number; n: number }>();

  const addrRows = await db.select().from(leadEngineAddresses);
  const cityByLead = new Map(addrRows.map(a => [a.leadId, a.city]));
  const stateByLead = new Map(addrRows.map(a => [a.leadId, a.state]));

  for (const l of leadList) {
    const city = cityByLead.get(l.id) ?? "";
    const st = stateByLead.get(l.id) ?? "";
    if (city) byCity.set(city, (byCity.get(city) ?? 0) + 1);
    byNiche.set(l.category, (byNiche.get(l.category) ?? 0) + 1);
    const sq = bySource.get(l.source) ?? { sum: 0, n: 0 };
    sq.sum += l.score;
    sq.n += 1;
    bySource.set(l.source, sq);
    if (city) {
      const mk = `${city}, ${st}`;
      const m = marketScore.get(mk) ?? { sum: 0, n: 0 };
      m.sum += l.score;
      m.n += 1;
      marketScore.set(mk, m);
    }
  }

  const buckets = [
    { label: "0–39", min: 0, max: 39 },
    { label: "40–59", min: 40, max: 59 },
    { label: "60–79", min: 60, max: 79 },
    { label: "80–100", min: 80, max: 100 },
  ];
  const scoreDistribution = buckets.map(b => ({
    bucket: b.label,
    count: leadList.filter(l => l.score >= b.min && l.score <= b.max).length,
  }));

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
    pctOfTotal:
      total > 0
        ? Math.round((leadList.filter(l => l.pipelineStage === stage).length / total) * 100)
        : 0,
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
  });
}

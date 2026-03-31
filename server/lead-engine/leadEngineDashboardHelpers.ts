import type { InferSelectModel } from "drizzle-orm";
import { leadEngineImportBatches } from "../../drizzle/leadEngineSchema";
import type { SearchJob } from "../../shared/lead-engine-types";

export type LeadEngineImportBatchRow = InferSelectModel<typeof leadEngineImportBatches>;

export function batchToSearchJob(b: LeadEngineImportBatchRow): SearchJob {
  const statusMap: Record<string, SearchJob["status"]> = {
    pending: "queued",
    processing: "running",
    completed: "completed",
    failed: "failed",
    cancelled: "cancelled",
  };
  let linkedLeadIds: string[] = [];
  try {
    linkedLeadIds = b.linkedLeadIdsJson ? (JSON.parse(b.linkedLeadIdsJson) as string[]) : [];
  } catch {
    linkedLeadIds = [];
  }
  return {
    id: b.id,
    status: statusMap[b.status] ?? "queued",
    source: b.sourceName,
    niche: b.fileName ?? "CSV import",
    locationQuery: "",
    createdAt: b.startedAt.toISOString(),
    startedAt: b.status !== "pending" ? b.startedAt.toISOString() : null,
    completedAt: b.completedAt?.toISOString() ?? null,
    taskTotal: b.totalRows,
    taskCompleted: b.insertedRows + b.updatedRows,
    taskFailed: b.failedRows,
    linkedLeadIds,
  };
}

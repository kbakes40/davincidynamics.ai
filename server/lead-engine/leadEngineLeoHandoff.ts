import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { requireLeadEngineDb } from "./leadEngineRepo";
import { leadEngineActivityLog, leadEngineLeads } from "../../drizzle/leadEnginePgSchema";

const HANDOFF_TOKEN = process.env.TELEGRAM_HANDOFF_BOT_TOKEN?.trim();
const HANDOFF_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();

function buildLeadHandoffText(lead: typeof leadEngineLeads.$inferSelect) {
  return [
    `Lead Engine handoff → leo`,
    `lead_id: ${lead.id}`,
    `business: ${lead.businessName}`,
    `category: ${lead.category}`,
    `status: ${lead.outreachStatus}`,
    `pipeline_stage: ${lead.pipelineStage}`,
    lead.googleMapsUrl ? `google_maps: ${lead.googleMapsUrl}` : null,
    lead.source ? `source: ${lead.source}` : null,
    lead.targetZip ? `target_zip: ${lead.targetZip}` : null,
    lead.radiusMiles ? `radius_miles: ${lead.radiusMiles}` : null,
    "",
    `Use this lead for Leo follow-up/outreach workflow.`,
  ].filter(Boolean).join("\n");
}

async function sendTelegram(text: string): Promise<boolean> {
  if (!HANDOFF_TOKEN || !HANDOFF_CHAT_ID) return false;
  const response = await fetch(`https://api.telegram.org/bot${HANDOFF_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: HANDOFF_CHAT_ID, text }),
  });
  return response.ok;
}

export async function handoffLeadIdsToLeo(leadIds: string[]): Promise<{ sent: number; failed: number }> {
  const db = await requireLeadEngineDb();
  if (!db) throw new Error("database_unavailable");
  if (!HANDOFF_TOKEN || !HANDOFF_CHAT_ID) throw new Error("leo_handoff_not_configured");

  let sent = 0;
  let failed = 0;
  for (const leadId of leadIds) {
    const row = await db.select().from(leadEngineLeads).where(eq(leadEngineLeads.id, leadId)).limit(1);
    const lead = row[0];
    if (!lead) {
      failed++;
      continue;
    }
    const ok = await sendTelegram(buildLeadHandoffText(lead));
    await db.update(leadEngineLeads).set({ assignedOwner: ok ? "leo" : lead.assignedOwner, updatedAt: new Date() }).where(eq(leadEngineLeads.id, leadId));
    await db.insert(leadEngineActivityLog).values({
      id: nanoid(),
      leadId,
      type: "handoff",
      message: ok ? "Assigned to Leo and sent to handoff bot" : "Leo handoff send failed",
      at: new Date(),
      actor: "system",
    });
    if (ok) sent++;
    else failed++;
  }
  return { sent, failed };
}

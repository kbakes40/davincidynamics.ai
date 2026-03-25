import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Repo root is two levels above this file (`server/_core/loadEnv.ts`).
 * Using this instead of `process.cwd()` so `.env.local` loads even when the
 * process is started from another working directory.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "..");

const envPath = path.resolve(root, ".env");
const localPath = path.resolve(root, ".env.local");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(localPath)) {
  dotenv.config({ path: localPath, override: true });
}

/** Safe startup diagnostic for Leo / OpenClaw — never logs secret values. */
export function logOpenClawEnvDiagnostic(): void {
  const localPresent = fs.existsSync(localPath);
  const basePresent = Boolean(process.env.OPENCLAW_BASE_URL?.trim());
  const gatewayKeyPresent = Boolean(process.env.OPENCLAW_GATEWAY_TOKEN?.trim());
  const aliasTokenPresent = Boolean(process.env.OPENCLAW_TOKEN?.trim());
  const tokenPresent = gatewayKeyPresent || aliasTokenPresent;
  const agentId = process.env.OPENCLAW_AGENT_ID?.trim() || "default";
  const healthRaw = process.env.OPENCLAW_HEALTH_CHECK?.trim();
  const healthEnabled = healthRaw === "true";
  const healthKeyDefined = Object.prototype.hasOwnProperty.call(process.env, "OPENCLAW_HEALTH_CHECK");
  const preferCcRaw = process.env.OPENCLAW_PREFER_CHAT_COMPLETIONS;
  const preferCcDefined = Object.prototype.hasOwnProperty.call(process.env, "OPENCLAW_PREFER_CHAT_COMPLETIONS");
  const preferCc = preferCcRaw?.trim().toLowerCase() === "true";
  console.log("[ENV] .env.local file present:", localPresent);
  console.log("[ENV] OPENCLAW_BASE_URL present:", basePresent);
  console.log("[ENV] OPENCLAW_GATEWAY_TOKEN present:", gatewayKeyPresent);
  console.log("[ENV] OPENCLAW_TOKEN (alias) present:", aliasTokenPresent);
  console.log("[ENV] OpenClaw bearer usable (either key above):", tokenPresent);
  console.log("[ENV] OPENCLAW_AGENT_ID:", agentId);
  console.log("[ENV] OPENCLAW_HEALTH_CHECK key present:", healthKeyDefined);
  console.log(
    "[ENV] OPENCLAW_HEALTH_CHECK value:",
    healthRaw === undefined ? "(unset)" : healthRaw,
    "→ require POST /v1/chat/completions preflight before HTTP chat:",
    healthEnabled
  );
  console.log("[ENV] OPENCLAW_PREFER_CHAT_COMPLETIONS key present:", preferCcDefined);
  console.log("[ENV] OPENCLAW_PREFER_CHAT_COMPLETIONS → use /v1/chat/completions only:", preferCc);
}

logOpenClawEnvDiagnostic();

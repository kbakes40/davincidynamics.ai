/**
 * Environment validation for Vinci + optional BlueBubbles follow-up.
 * Call `validateAppEnvironment()` once at process startup.
 *
 * Modes:
 * - Skip: SKIP_APP_ENV_VALIDATION === "true" → log only, no checks, no status block.
 * - Development: NODE_ENV !== "production" → core vars warn only; BlueBubbles strict if enabled.
 * - Production: NODE_ENV === "production" → core + enabled BlueBubbles required (throw).
 */

/** Absent if missing, "", or whitespace-only; otherwise the trimmed string. */
function getTrimmedEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  const t = raw.trim();
  return t === "" ? undefined : t;
}

function requireEnv(name: string): string {
  const v = getTrimmedEnv(name);
  if (!v) {
    throw new Error(`[ENV] Missing required environment variable: ${name}`);
  }
  return v;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Enabled only when `BLUEBUBBLES_FOLLOWUP_ENABLED` trims to exactly `"true"`.
 * Does not enable on "1", "yes", "on", etc.
 */
export function isBlueBubblesFollowupEnabled(): boolean {
  return getTrimmedEnv("BLUEBUBBLES_FOLLOWUP_ENABLED") === "true";
}

function validateCoreEnv(): void {
  if (isProduction()) {
    requireEnv("TELEGRAM_BOT_TOKEN");
    requireEnv("DATABASE_URL");
    return;
  }

  if (!getTrimmedEnv("TELEGRAM_BOT_TOKEN")) {
    console.warn("[ENV WARNING] TELEGRAM_BOT_TOKEN is missing or empty");
  }
  if (!getTrimmedEnv("DATABASE_URL")) {
    console.warn("[ENV WARNING] DATABASE_URL is missing or empty");
  }
}

/** When BlueBubbles is enabled, required in both development and production. */
function validateBlueBubblesEnv(): void {
  if (!isBlueBubblesFollowupEnabled()) {
    return;
  }
  requireEnv("BLUEBUBBLES_SERVER_URL");
  requireEnv("BLUEBUBBLES_PASSWORD");
  requireEnv("BLUEBUBBLES_FROM_HANDLE");
}

function logSystemStatus(): void {
  const envLabel = isProduction() ? "production" : "development";
  const telegramOn = Boolean(getTrimmedEnv("TELEGRAM_BOT_TOKEN"));
  const databaseOn = Boolean(getTrimmedEnv("DATABASE_URL"));
  const bluebubblesOn = isBlueBubblesFollowupEnabled();

  console.log("=== SYSTEM STATUS ===");
  console.log(`Environment: ${envLabel}`);
  console.log(`Telegram: ${telegramOn ? "ON" : "OFF"}`);
  console.log(`Database: ${databaseOn ? "ON" : "OFF"}`);
  console.log(`BlueBubbles: ${bluebubblesOn ? "ON" : "OFF"}`);
}

/**
 * Validates env. Development: core vars warn only. Production: core vars required.
 * BlueBubbles vars required whenever follow-up is enabled (trimmed === "true"), any environment.
 */
export function validateAppEnvironment(): void {
  if (process.env.SKIP_APP_ENV_VALIDATION === "true") {
    console.log("[ENV] Validation skipped");
    return;
  }

  validateCoreEnv();
  validateBlueBubblesEnv();
  logSystemStatus();
}

/** Delay before Kevin follow-up send (in-process scheduling). Default 5 minutes. */
export function getVinciFollowupDelayMs(): number {
  const raw = process.env.VINCI_FOLLOWUP_DELAY_MINUTES;
  const minutes = raw != null && raw.trim() !== "" ? Number.parseInt(raw, 10) : 5;
  if (!Number.isFinite(minutes) || minutes < 0) {
    return 5 * 60 * 1000;
  }
  return minutes * 60 * 1000;
}

export function getBookingLink(): string | undefined {
  return getTrimmedEnv("BOOKING_LINK");
}

/**
 * Application environment validation for Vinci + optional BlueBubbles follow-up.
 * Call validateAppEnvironment() once at process startup (server / Vercel function cold start).
 */

function requireEnv(name: string, value: string | undefined): string {
  const v = value?.trim();
  if (!v) {
    throw new Error(`[ENV] Missing required environment variable: ${name}`);
  }
  return v;
}

/** BlueBubbles follow-up is enabled only when the flag is the literal string "true" (after trim). */
export function isBlueBubblesFollowupEnabled(): boolean {
  return process.env.BLUEBUBBLES_FOLLOWUP_ENABLED?.trim() === "true";
}

function validateCoreEnv(isProduction: boolean): void {
  const hasTelegram = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());

  if (isProduction) {
    requireEnv("TELEGRAM_BOT_TOKEN", process.env.TELEGRAM_BOT_TOKEN);
    requireEnv("DATABASE_URL", process.env.DATABASE_URL);
  } else {
    if (!hasTelegram) {
      console.warn(
        "[ENV WARNING] TELEGRAM_BOT_TOKEN is missing — Vinci bot will not run"
      );
    }
    if (!hasDatabase) {
      console.warn(
        "[ENV WARNING] DATABASE_URL is missing — leads will not be stored"
      );
    }
  }
}

function validateBlueBubblesEnv(): void {
  if (!isBlueBubblesFollowupEnabled()) {
    return;
  }
  requireEnv("BLUEBUBBLES_SERVER_URL", process.env.BLUEBUBBLES_SERVER_URL);
  requireEnv("BLUEBUBBLES_PASSWORD", process.env.BLUEBUBBLES_PASSWORD);
  requireEnv("BLUEBUBBLES_FROM_HANDLE", process.env.BLUEBUBBLES_FROM_HANDLE);
}

function logSystemStatus(isProduction: boolean): void {
  const telegramOn = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const databaseOn = Boolean(process.env.DATABASE_URL?.trim());
  const bluebubblesOn = isBlueBubblesFollowupEnabled();

  console.log("=== SYSTEM STATUS ===");
  console.log(`Environment: ${isProduction ? "production" : "development"}`);
  console.log(`Telegram: ${telegramOn ? "ON" : "OFF"}`);
  console.log(`Database: ${databaseOn ? "ON" : "OFF"}`);
  console.log(`BlueBubbles: ${bluebubblesOn ? "ON" : "OFF"}`);
}

/**
 * Validates env. Development: missing TELEGRAM_BOT_TOKEN / DATABASE_URL only warns.
 * Production: those are required. BlueBubbles vars required whenever follow-up is enabled ("true").
 */
export function validateAppEnvironment(): void {
  const isProduction = process.env.NODE_ENV === "production";
  const skipValidation = process.env.SKIP_APP_ENV_VALIDATION === "true";

  if (skipValidation) {
    console.log("[ENV] Validation skipped");
    return;
  }

  validateCoreEnv(isProduction);
  validateBlueBubblesEnv();
  logSystemStatus(isProduction);
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
  const u = process.env.BOOKING_LINK?.trim();
  return u || undefined;
}

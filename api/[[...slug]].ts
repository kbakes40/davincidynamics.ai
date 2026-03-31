import "../server/_core/loadEnv";
import { createApp } from "../server/_core/createApp";

try {
  const { validateAppEnvironment } = await import("../config/env");
  validateAppEnvironment();
} catch {
  // Non-critical on Vercel when TELEGRAM_BOT_TOKEN / DATABASE_URL are absent.
}

try {
  const { logDatabaseTargetAtStartup } = await import("../server/db");
  logDatabaseTargetAtStartup();
} catch {
  // DB not configured — lead-engine mock routes still work.
}

const app = createApp();

try {
  const { startTelegramBot } = await import("../server/telegram-bot-handler");
  startTelegramBot(app);
} catch {
  // Telegram bot optional in serverless context.
}

export default app;

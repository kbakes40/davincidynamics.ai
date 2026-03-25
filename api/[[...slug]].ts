import "dotenv/config";
import { validateAppEnvironment } from "../config/env";
import { createApp } from "../server/_core/createApp";
import { logDatabaseTargetAtStartup } from "../server/db";
import { startTelegramBot } from "../server/telegram-bot-handler";

validateAppEnvironment();
logDatabaseTargetAtStartup();

const app = createApp();
startTelegramBot(app);

export default app;

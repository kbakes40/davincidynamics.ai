import "dotenv/config";
import { validateAppEnvironment } from "../config/env";
import { createApp } from "../server/_core/createApp";
import { startTelegramBot } from "../server/telegram-bot-handler";

validateAppEnvironment();

const app = createApp();
startTelegramBot(app);

export default app;

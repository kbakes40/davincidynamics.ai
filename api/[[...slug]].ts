import "dotenv/config";
import { createApp } from "../server/_core/createApp";
import { startTelegramBot } from "../server/telegram-bot-handler";

const app = createApp();
startTelegramBot(app);

export default app;

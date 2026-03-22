import "dotenv/config";
import { createApp } from "../server/_core/createApp";
import { serveStatic } from "../server/_core/vite";
import { startTelegramBot } from "../server/telegram-bot-handler";

const app = createApp();
startTelegramBot(app);
serveStatic(app);

export default app;

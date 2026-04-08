import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) throw new Error("TURSO_URL is required");
if (!authToken) throw new Error("TURSO_AUTH_TOKEN is required");

export default defineConfig({
  schema: "./drizzle/leadEnginePgSchema.ts",
  dialect: "turso",
  dbCredentials: { url, authToken },
});

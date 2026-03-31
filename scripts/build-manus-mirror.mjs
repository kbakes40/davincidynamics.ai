#!/usr/bin/env node
/**
 * Static client build into dist/public (same output as `vercel.json` buildCommand).
 * For local preview: `npx serve -s dist/public`
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist", "public");

if (fs.existsSync(out)) {
  fs.rmSync(out, { recursive: true, force: true });
}

execSync("pnpm run build:client", { cwd: root, stdio: "inherit" });

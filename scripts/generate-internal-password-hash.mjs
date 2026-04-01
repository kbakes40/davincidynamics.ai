import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/generate-internal-password-hash.mjs \"your-password\"");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const result = `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;

console.log(result);


import { jwtVerify, SignJWT } from "jose";
import { parse as parseCookieHeader } from "cookie";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";

const INTERNAL_COOKIE_NAME = "operator_session";
const INTERNAL_SESSION_MS = 1000 * 60 * 60 * 12; // 12 hours

type InternalSessionPayload = {
  email: string;
  role: "operator";
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    throw new Error("COOKIE_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

function normalized(s: string): string {
  return s.trim().toLowerCase();
}

function safeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function verifyPasswordWithHash(password: string, hashSpec: string): boolean {
  // Format: scrypt:<saltBase64>:<hashBase64>
  const [algo, saltB64, hashB64] = hashSpec.split(":");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  if (!salt.length || !expected.length) return false;
  const derived = scryptSync(password, salt, expected.length);
  return timingSafeEqual(derived, expected);
}

function verifyPassword(password: string): boolean {
  const hashSpec = process.env.INTERNAL_PORTAL_PASSWORD_HASH;
  if (hashSpec) return verifyPasswordWithHash(password, hashSpec);

  // Fallback for local setup only.
  const plain = process.env.INTERNAL_PORTAL_PASSWORD;
  if (!plain) return false;
  return safeEq(password, plain);
}

function getCookies(req: Request): Map<string, string> {
  const header = req.headers.cookie;
  if (!header) return new Map();
  return new Map(Object.entries(parseCookieHeader(header)));
}

async function readInternalSession(req: Request): Promise<InternalSessionPayload | null> {
  const token = getCookies(req).get(INTERNAL_COOKIE_NAME);
  if (!token) return null;
  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (payload.role !== "operator" || typeof payload.email !== "string") return null;
    return { email: payload.email, role: "operator" };
  } catch {
    return null;
  }
}

function internalCookieOptions(req: Request) {
  const secure =
    req.protocol === "https" ||
    `${req.headers["x-forwarded-proto"] ?? ""}`.toLowerCase().includes("https");
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure,
    maxAge: INTERNAL_SESSION_MS,
  };
}

async function issueInternalSession(email: string): Promise<string> {
  const secret = getSessionSecret();
  const expiresAt = Math.floor((Date.now() + INTERNAL_SESSION_MS) / 1000);
  return new SignJWT({
    email,
    role: "operator",
    nonce: randomBytes(8).toString("hex"),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secret);
}

export function registerInternalPortalRoutes(app: Express): void {
  app.post("/api/internal/auth/login", async (req: Request, res: Response) => {
    const configuredEmail = process.env.INTERNAL_PORTAL_EMAIL;
    if (!configuredEmail || (!process.env.INTERNAL_PORTAL_PASSWORD_HASH && !process.env.INTERNAL_PORTAL_PASSWORD)) {
      res.status(500).json({ ok: false, message: "Internal portal auth is not configured." });
      return;
    }

    const email = typeof req.body?.email === "string" ? req.body.email : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const emailOk = safeEq(normalized(email), normalized(configuredEmail));
    const passwordOk = verifyPassword(password);

    if (!emailOk || !passwordOk) {
      res.status(401).json({ ok: false, message: "Invalid credentials." });
      return;
    }

    try {
      const token = await issueInternalSession(normalized(email));
      res.cookie(INTERNAL_COOKIE_NAME, token, internalCookieOptions(req));
      res.json({ ok: true });
    } catch (error) {
      console.error("[Internal Auth] Failed to create session:", error);
      res.status(500).json({ ok: false, message: "Unable to create session." });
    }
  });

  app.get("/api/internal/auth/me", async (req: Request, res: Response) => {
    const session = await readInternalSession(req);
    if (!session) {
      res.status(401).json({ ok: false });
      return;
    }
    res.json({ ok: true, user: session });
  });

  app.post("/api/internal/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(INTERNAL_COOKIE_NAME, { ...internalCookieOptions(req), maxAge: -1 });
    res.json({ ok: true });
  });
}


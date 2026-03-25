import { randomUUID } from "node:crypto";
import WebSocket from "ws";

const DEFAULT_BASE = "http://127.0.0.1:18789";
const REQUEST_TIMEOUT_MS = 55_000;
const LOG_BODY_MAX = 1_400;
const OPENCLAW_WS_REQUEST_MS = 30_000;
const OPENCLAW_WS_PROTOCOL_VERSION = 3;

const OPENAI_HTTP_DISABLED_DETAIL = `OpenClaw gateway is reachable but POST /v1/chat/completions is not mounted or returned non-JSON (e.g. Control UI HTML or 404). Enable gateway.http.endpoints.chatCompletions.enabled in your OpenClaw config and restart the gateway. Note: many OpenClaw builds do not implement GET /v1/models (that route may return Control UI HTML even when chat completions work). Docs: https://docs.molt.bot/gateway/openai-http-api`;

function isConnectionRefusedError(e: unknown): boolean {
  const err = e as { cause?: { code?: string }; code?: string; message?: string };
  const code = err.cause?.code ?? err.code;
  const msg = (err.message ?? String(e)).toLowerCase();
  return code === "ECONNREFUSED" || code === "ECONNRESET" || msg.includes("econnrefused");
}

function httpBaseToWsUrl(httpBase: string): string {
  const u = new URL(httpBase);
  const proto = u.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${u.host}`;
}

function formatAgentMessageWithHistory(message: string, history: OpenClawMessage[]): string {
  const blocks: string[] = [];
  for (const h of history) {
    const label = h.role === "user" ? "User" : "Assistant";
    blocks.push(`${label}: ${h.content}`);
  }
  blocks.push(`User: ${message}`);
  return blocks.join("\n\n");
}

function extractReplyFromAgentGatewayResult(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const payloads = (result as { payloads?: unknown }).payloads;
  if (!Array.isArray(payloads)) return null;
  const texts: string[] = [];
  for (const item of payloads) {
    if (!item || typeof item !== "object") continue;
    const t = (item as { text?: unknown }).text;
    if (typeof t === "string" && t.trim()) {
      texts.push(t.trim());
    }
  }
  const joined = texts.join("\n\n").trim();
  return joined.length ? joined : null;
}

/** `session.message` WebSocket event payload (see OpenClaw gateway transcript events). */
function extractAssistantFromSessionMessageEventPayload(
  payload: unknown,
  targetSessionKey: string
): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as { sessionKey?: string; message?: unknown };
  if (typeof p.sessionKey !== "string" || p.sessionKey.trim() !== targetSessionKey.trim()) {
    return null;
  }
  const msg = p.message;
  if (!msg || typeof msg !== "object") return null;
  const m = msg as { role?: string; content?: unknown };
  if (m.role === "user") return null;
  if (m.role !== undefined && m.role !== "assistant") return null;
  const content = m.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const pt = (part as { type?: string; text?: string }).text;
      if (typeof pt === "string" && pt) parts.push(pt);
    }
    const joined = parts.join("").trim();
    return joined.length ? joined : null;
  }
  return null;
}

/** Safe diagnostics for session.message frames (no message body / secrets). */
function logSessionMessageEventDiag(
  payload: unknown,
  targetSessionKey: string,
  extractedAssistantChars: number | null
): void {
  if (!payload || typeof payload !== "object") {
    console.log("[OC-WS] diag: session.message event (empty payload)");
    return;
  }
  const p = payload as { sessionKey?: string; message?: { role?: string } };
  const sk = typeof p.sessionKey === "string" ? p.sessionKey.trim() : "";
  const keyMatch = sk === targetSessionKey.trim();
  const role =
    p.message && typeof p.message === "object" && typeof p.message.role === "string"
      ? p.message.role
      : "(no role)";
  if (!keyMatch) {
    console.log(
      `[OC-WS] diag: session.message event (sessionKey match=false eventKey=${sk || "(empty)"} canonical=${targetSessionKey})`
    );
    return;
  }
  if (role === "user") {
    console.log("[OC-WS] diag: session.message event (matching key, role=user — ignored for assistant text)");
    return;
  }
  if (extractedAssistantChars != null && extractedAssistantChars > 0) {
    console.log(
      `[OC-WS] diag: session.message event (matching key, role=${role}, assistant chars=${extractedAssistantChars})`
    );
  } else {
    console.log(
      `[OC-WS] diag: session.message event (matching key, role=${role}, no assistant text extracted)`
    );
  }
}

function isGatewayWsChallengeEvent(msg: unknown): boolean {
  return (
    typeof msg === "object" &&
    msg !== null &&
    (msg as { type?: unknown }).type === "event" &&
    (msg as { event?: unknown }).event === "connect.challenge"
  );
}

type GatewayWsRes = {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: unknown;
};

function asGatewayWsResForId(msg: unknown, id: string): GatewayWsRes | null {
  if (typeof msg !== "object" || msg === null) return null;
  const m = msg as { type?: unknown; id?: unknown; ok?: unknown };
  if (m.type !== "res" || m.id !== id || typeof m.ok !== "boolean") return null;
  return msg as GatewayWsRes;
}

function gatewayWsErrorLooksLikeAuth(blob: string): boolean {
  const lower = blob.toLowerCase();
  return (
    lower.includes("unauthorized") ||
    lower.includes("invalid token") ||
    lower.includes("token mismatch") ||
    lower.includes("forbidden") ||
    lower.includes("auth")
  );
}

function buildConnectHandshakeParams(
  token: string,
  role: string,
  scopes: string[] | undefined
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    minProtocol: OPENCLAW_WS_PROTOCOL_VERSION,
    maxProtocol: OPENCLAW_WS_PROTOCOL_VERSION,
    client: {
      id: "gateway-client",
      version: "1.0.0",
      platform: "node",
      mode: "backend",
    },
    role,
    caps: [],
    commands: [],
    permissions: {},
    auth: { token },
    locale: "en-US",
    userAgent: "davincidynamics-leo/1.0.0",
  };
  if (scopes !== undefined) {
    params.scopes = scopes;
  }
  return params;
}

export function getOpenClawBaseUrl(): string {
  return (process.env.OPENCLAW_BASE_URL?.trim() || DEFAULT_BASE).replace(/\/$/, "");
}

export function getOpenClawAgentModel(): string {
  const id = process.env.OPENCLAW_AGENT_ID?.trim() || "default";
  return `openclaw/${id}`;
}

/** Bearer for OpenClaw HTTP API — server-only; never sent to the browser. */
export function getOpenClawGatewayToken(): string | undefined {
  const t =
    process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || process.env.OPENCLAW_TOKEN?.trim();
  return t || undefined;
}

/** Derive `openclaw gateway --port …` from `OPENCLAW_BASE_URL` for dev messages (never includes secrets). */
export function formatOpenClawGatewayStartCommand(baseUrl: string = getOpenClawBaseUrl()): string {
  try {
    const u = new URL(baseUrl);
    if (u.port) {
      return `openclaw gateway --port ${u.port}`;
    }
  } catch {
    /* fall through */
  }
  return "openclaw gateway --port 18789";
}

/** API `detail` when the gateway process is not listening (e.g. ECONNREFUSED). */
export function gatewayUnreachableDeveloperDetail(baseUrl: string): string {
  const cmd = formatOpenClawGatewayStartCommand(baseUrl);
  return `The OpenClaw gateway is not running or refused the connection at ${baseUrl}. Start it in another terminal before Leo chat will work, then retry: ${cmd}`;
}

const BOOT_GATEWAY_PROBE_MS = 2_500;
const CHAT_COMPLETIONS_PREFLIGHT_MS = 8_000;

export type GatewayChatCompletionsProbe = {
  ok: boolean;
  status: number;
  raw: string;
  contentType: string;
  hint?:
    | "endpoint_disabled"
    | "auth_required"
    | "connection_refused"
    | "network_error"
    | "non_json_response";
};

/**
 * Cheap check that POST /v1/chat/completions exists: send intentionally invalid `messages: []` and expect
 * a JSON body (typically 400). Avoids GET /v1/models, which many OpenClaw builds do not implement.
 */
export async function gatewayChatCompletionsProbeLightweight(
  baseUrl: string,
  token: string | undefined,
  timeoutMs: number
): Promise<GatewayChatCompletionsProbe> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const bearer = token?.trim();
    if (bearer) {
      headers.Authorization = `Bearer ${bearer}`;
    }
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: "openclaw", messages: [] }),
      signal: controller.signal,
    });
    const raw = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (res.status === 404) {
      return { ok: false, status: 404, raw, contentType, hint: "endpoint_disabled" };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, status: res.status, raw, contentType, hint: "auth_required" };
    }

    const looksLikeControlUiHtml =
      contentType.includes("text/html") || /<!doctype html/i.test(raw.slice(0, 500));
    if (looksLikeControlUiHtml) {
      return { ok: false, status: res.status, raw, contentType, hint: "non_json_response" };
    }

    try {
      JSON.parse(raw.length ? raw : "{}");
    } catch {
      return { ok: false, status: res.status, raw, contentType, hint: "non_json_response" };
    }

    return { ok: true, status: res.status, raw, contentType };
  } catch (e) {
    if (e instanceof Error && (e.name === "AbortError" || e.message.includes("abort"))) {
      return {
        ok: false,
        status: 0,
        raw: "(probe timeout or abort)",
        contentType: "",
        hint: "network_error",
      };
    }
    const refused = isConnectionRefusedError(e);
    return {
      ok: false,
      status: 0,
      raw: refused ? "(connection refused — gateway not listening)" : "(fetch error)",
      contentType: "",
      hint: refused ? "connection_refused" : "network_error",
    };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Non-blocking: lightweight POST /v1/chat/completions (invalid empty `messages`) to verify the OpenAI HTTP
 * surface without running a full agent turn. GET /v1/models is not used — it often returns Control UI HTML.
 */
export async function warnOpenClawGatewayAtBoot(): Promise<void> {
  const baseUrl = getOpenClawBaseUrl();
  const token = getOpenClawGatewayToken();
  const cmd = formatOpenClawGatewayStartCommand(baseUrl);
  try {
    const probe = await gatewayChatCompletionsProbeLightweight(baseUrl, token, BOOT_GATEWAY_PROBE_MS);
    if (probe.ok) {
      console.log(`✅  OpenClaw gateway reachable at ${baseUrl} — POST /v1/chat/completions looks usable for Leo`);
      return;
    }
    if (probe.hint === "connection_refused") {
      console.warn(`⚠️  OpenClaw gateway unreachable at ${baseUrl} — run: ${cmd}`);
      return;
    }
    if (probe.hint === "endpoint_disabled" || probe.hint === "non_json_response") {
      console.warn(
        `⚠️  OpenClaw POST /v1/chat/completions does not look enabled at ${baseUrl} — enable gateway.http.endpoints.chatCompletions and restart. Run: ${cmd}`
      );
      return;
    }
    if (probe.hint === "network_error" && probe.raw.includes("abort")) {
      console.warn(
        `⚠️  OpenClaw gateway did not respond to HTTP preflight at ${baseUrl} — Leo chat may fail. Run: ${cmd}`
      );
      return;
    }
    console.warn(
      `⚠️  OpenClaw gateway HTTP check inconclusive at ${baseUrl} — Leo chat may fail (${probe.hint ?? "unknown"}). Run: ${cmd}`
    );
  } catch (e) {
    const note = e instanceof Error ? e.message : String(e);
    console.warn(
      `⚠️  OpenClaw gateway boot probe errored at ${baseUrl} — Leo chat may fail. Run: ${cmd} (${note})`
    );
  }
}

function truncateForLog(raw: string, max = LOG_BODY_MAX): string {
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max)}…(+${raw.length - max} chars)`;
}

function parseModelIdsFromModelsPayload(data: unknown): string[] {
  if (!data || typeof data !== "object") return [];
  const d = data as { data?: unknown };
  if (!Array.isArray(d.data)) return [];
  const ids: string[] = [];
  for (const item of d.data) {
    if (item && typeof item === "object" && "id" in item && typeof (item as { id: unknown }).id === "string") {
      ids.push((item as { id: string }).id);
    }
  }
  return ids;
}

export type GatewayModelsProbe = {
  ok: boolean;
  status: number;
  raw: string;
  modelIds: string[];
  contentType: string;
  hint?:
    | "models_catalog_unavailable"
    | "invalid_models_payload"
    | "auth_required"
    | "connection_refused"
    | "network_error";
};

/**
 * GET /v1/models — optional catalog probe for model discovery and diagnostics only.
 * Many OpenClaw builds return Control UI HTML here; that must not imply chat completions are disabled.
 */
export async function gatewayModelsProbe(baseUrl: string, token: string): Promise<GatewayModelsProbe> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(`${baseUrl}/v1/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    const raw = await res.text();
    const contentType = res.headers.get("content-type") || "";

    const looksLikeControlUiHtml =
      contentType.includes("text/html") || /<!doctype html/i.test(raw.slice(0, 500));
    if (res.ok && looksLikeControlUiHtml) {
      return {
        ok: false,
        status: res.status,
        raw,
        modelIds: [],
        contentType,
        hint: "models_catalog_unavailable",
      };
    }

    if (!res.ok) {
      const hint =
        res.status === 401 || res.status === 403 ? ("auth_required" as const) : undefined;
      return { ok: false, status: res.status, raw, modelIds: [], contentType, hint };
    }

    let data: unknown;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      return {
        ok: false,
        status: res.status,
        raw,
        modelIds: [],
        contentType,
        hint: "invalid_models_payload",
      };
    }
    const modelIds = parseModelIdsFromModelsPayload(data);
    if (modelIds.length === 0) {
      return {
        ok: false,
        status: res.status,
        raw,
        modelIds: [],
        contentType,
        hint: "invalid_models_payload",
      };
    }

    return { ok: true, status: res.status, raw, modelIds, contentType };
  } catch (e) {
    const refused = isConnectionRefusedError(e);
    return {
      ok: false,
      status: 0,
      raw: refused ? "(connection refused — gateway not listening)" : "(fetch error or abort)",
      modelIds: [],
      contentType: "",
      hint: refused ? "connection_refused" : "network_error",
    };
  } finally {
    clearTimeout(t);
  }
}

export async function gatewayModelsHealth(baseUrl: string, token: string): Promise<boolean> {
  const p = await gatewayChatCompletionsProbeLightweight(baseUrl, token, CHAT_COMPLETIONS_PREFLIGHT_MS);
  return p.ok;
}

/** Pick a model id present on the gateway; prefer env agent, then openclaw/default, then any openclaw/*. */
export function resolveOpenClawModelFromIds(
  preferredFull: string,
  modelIds: string[]
): { model: string; resolution: string } {
  if (!modelIds.length) {
    return {
      model: "openclaw/default",
      resolution: "no_agent_list_from_models_use_openclaw_default",
    };
  }

  if (modelIds.includes(preferredFull)) {
    return { model: preferredFull, resolution: "listed_preferred" };
  }

  const defaultFull = "openclaw/default";
  if (modelIds.includes(defaultFull)) {
    return {
      model: defaultFull,
      resolution: modelIds.length
        ? `fallback_${defaultFull}_preferred_not_listed`
        : "fallback_default_no_list",
    };
  }

  const openclawIds = modelIds.filter(id => id.startsWith("openclaw/")).sort();
  if (openclawIds.length === 1) {
    return { model: openclawIds[0], resolution: "fallback_sole_openclaw_in_list" };
  }
  if (openclawIds.length > 0) {
    return {
      model: openclawIds[0],
      resolution: `fallback_first_openclaw_lex(${openclawIds.slice(0, 5).join(",")}${openclawIds.length > 5 ? ",…" : ""})`,
    };
  }

  return { model: preferredFull, resolution: "use_preferred_no_gateway_models_parsed" };
}

type OpenClawMessage = { role: "user" | "assistant"; content: string };

function extractFromResponses(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (typeof d.reply === "string" && d.reply.trim()) {
    return d.reply.trim();
  }

  if (typeof d.output_text === "string" && d.output_text.trim()) {
    return d.output_text.trim();
  }

  const output = d.output;
  if (!Array.isArray(output)) return null;

  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;

    if (o.type === "message") {
      if (typeof o.content === "string" && o.content.trim()) {
        chunks.push(o.content.trim());
        continue;
      }
      if (Array.isArray(o.content)) {
        for (const part of o.content) {
          if (!part || typeof part !== "object") continue;
          const p = part as Record<string, unknown>;
          if (p.type === "output_text" && typeof p.text === "string") {
            chunks.push(p.text);
          }
          if (typeof p.text === "string" && !p.type) {
            chunks.push(p.text);
          }
        }
      }
    }
    if (typeof o.text === "string") chunks.push(o.text);
  }
  const joined = chunks.join("").trim();
  return joined || null;
}

function extractFromChatCompletion(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { choices?: Array<{ message?: { content?: string | null } }> };
  const text = d.choices?.[0]?.message?.content?.trim();
  return text || null;
}

function shouldTryChatCompletions(status: number, bodySnippet: string): boolean {
  if (status === 401 || status === 403 || status === 429) return false;
  if (
    status === 404 ||
    status === 405 ||
    status === 400 ||
    status === 422 ||
    status === 415 ||
    status === 501
  ) {
    return true;
  }
  if (status >= 502) return true;
  const s = bodySnippet.toLowerCase();
  return (
    s.includes("not enabled") ||
    s.includes("unknown endpoint") ||
    (s.includes("responses") && s.includes("disabled")) ||
    s.includes("no such route") ||
    (s.includes("model") && (s.includes("not found") || s.includes("invalid") || s.includes("unknown")))
  );
}

function looksLikeAuthFailure(status: number, bodySnippet: string): boolean {
  if (status === 401 || status === 403) return true;
  const s = bodySnippet.toLowerCase();
  return (
    s.includes("unauthorized") ||
    s.includes("invalid token") ||
    s.includes("invalid api key") ||
    s.includes("forbidden")
  );
}

function looksLikeModelNotFound(status: number, bodySnippet: string): boolean {
  const s = bodySnippet.toLowerCase();
  if (status === 404 && s.includes("model")) return true;
  return (
    (s.includes("model") && (s.includes("not found") || s.includes("does not exist"))) ||
    s.includes("unknown model")
  );
}

function looksLikeResponsesDisabled(bodySnippet: string): boolean {
  const s = bodySnippet.toLowerCase();
  return (
    (s.includes("responses") && s.includes("disabled")) ||
    s.includes("not enabled") ||
    s.includes("unknown endpoint") && s.includes("responses")
  );
}

async function fetchJsonWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<{ ok: boolean; status: number; raw: string; data: unknown }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const raw = await res.text();
    let data: unknown = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }
    return { ok: res.ok, status: res.status, raw, data };
  } finally {
    clearTimeout(t);
  }
}

async function postChatCompletions(
  baseUrl: string,
  headers: Record<string, string>,
  model: string,
  instructions: string,
  message: string,
  history: OpenClawMessage[],
  sessionUserKey: string
): Promise<{ reply: string } | { error: string; responsesStatus?: number; completionsStatus: number; bodySnippet: string }> {
  const messages = [
    { role: "system" as const, content: instructions },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: "user" as const, content: message },
  ];

  let second: { ok: boolean; status: number; raw: string; data: unknown };
  try {
    second = await fetchJsonWithTimeout(
      `${baseUrl}/v1/chat/completions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages,
          user: sessionUserKey,
          max_tokens: 2048,
        }),
      },
      REQUEST_TIMEOUT_MS
    );
  } catch (e) {
    if (isConnectionRefusedError(e)) {
      return {
        error: "gateway_unreachable",
        completionsStatus: 0,
        bodySnippet: gatewayUnreachableDeveloperDetail(baseUrl),
      };
    }
    throw e;
  }

  console.log(
    `[openclaw] POST /v1/chat/completions → ${second.status}${second.ok ? " ok" : ""} body=${truncateForLog(second.raw)}`
  );

  if (second.ok) {
    const reply = extractFromChatCompletion(second.data);
    if (reply) return { reply };
    console.warn("[openclaw] /v1/chat/completions OK but empty extract");
    return {
      error: "parse_failure",
      completionsStatus: second.status,
      bodySnippet: truncateForLog(second.raw),
    };
  }

  return {
    error: looksLikeAuthFailure(second.status, second.raw) ? "auth" : "upstream",
    completionsStatus: second.status,
    bodySnippet: truncateForLog(second.raw),
  };
}

export type OpenClawChatParams = {
  baseUrl: string;
  token: string;
  model: string;
  instructions: string;
  message: string;
  history: OpenClawMessage[];
  sessionUserKey: string;
  /**
   * When true (OPENCLAW_HEALTH_CHECK=true), require POST /v1/chat/completions preflight to succeed
   * before attempting HTTP chat. GET /v1/models is never used as a gate.
   */
  requireChatCompletionsPreflight?: boolean;
};

export type OpenClawLeoResult =
  | { ok: true; reply: string }
  | {
      ok: false;
      error:
        | "auth"
        | "model_not_found"
        | "responses_disabled"
        | "gateway_unreachable"
        | "openai_http_disabled"
        | "parse_failure"
        | "upstream"
        | "timeout";
      detail?: string;
    };

function isOpenClawWsConnectionRefusedFailure(result: OpenClawLeoResult): boolean {
  if (result.ok || result.error !== "gateway_unreachable") return false;
  const d = (result.detail ?? "").toLowerCase();
  return (
    d.includes("econnrefused") ||
    d.includes("not running or refused") ||
    d.includes("refused the connection")
  );
}

function isOpenClawWsHandshakeVariantRetryable(result: OpenClawLeoResult): boolean {
  if (result.ok) return false;
  if (result.error === "timeout") return false;
  if (result.error === "parse_failure") return false;
  if (isOpenClawWsConnectionRefusedFailure(result)) return false;
  return true;
}

/** Try operator.read-only first, then omit scopes, then role client — see OpenClaw gateway handshake behavior. */
const OPENCLAW_WS_HANDSHAKE_VARIANTS: ReadonlyArray<{ role: string; scopes: string[] | undefined }> = [
  { role: "operator", scopes: ["operator.read"] },
  { role: "operator", scopes: undefined },
  { role: "client", scopes: ["operator.read"] },
  { role: "client", scopes: undefined },
];

/**
 * Leo → OpenClaw via gateway WebSocket: connect, `sessions.subscribe` / `sessions.create` / `sessions.send`,
 * then `session.message` events for the reply; if `sessions.send` fails, falls back to `agent` RPC.
 */
export async function callOpenClawLeoViaWebSocket(
  message: string,
  agentId: string,
  baseUrl: string,
  token: string,
  context?: { instructions?: string; history?: OpenClawMessage[]; sessionUserKey?: string }
): Promise<OpenClawLeoResult> {
  const instructions = context?.instructions ?? "";
  const history = context?.history ?? [];
  const sessionUserKey = context?.sessionUserKey?.trim() || randomUUID();

  const wsUrl = httpBaseToWsUrl(baseUrl);
  const sessionKey = `agent:${agentId}:${sessionUserKey}`;
  const composedMessage = formatAgentMessageWithHistory(message, history).trim();
  if (!composedMessage) {
    return { ok: false, error: "parse_failure", detail: "empty_message" };
  }

  console.log(`[openclaw] WebSocket agent url=${wsUrl} agentId=${agentId} sessionKey=${sessionKey}`);
  console.log(`[OC-WS] diag: session key requested: ${sessionKey}`);

  let lastOutcome: OpenClawLeoResult = {
    ok: false,
    error: "upstream",
    detail: "OpenClaw WebSocket: no handshake variant attempted",
  };

  for (let vi = 0; vi < OPENCLAW_WS_HANDSHAKE_VARIANTS.length; vi++) {
    const { role: connectRole, scopes: connectScopes } = OPENCLAW_WS_HANDSHAKE_VARIANTS[vi];
    console.log(
      `[OC-WS] handshake variant ${vi + 1}/${OPENCLAW_WS_HANDSHAKE_VARIANTS.length}: role=${connectRole} scopes=${connectScopes === undefined ? "(omitted)" : JSON.stringify(connectScopes)}`
    );

    const attempt = await new Promise<OpenClawLeoResult>(resolve => {
      let settled = false;
      console.log(`[OC-WS] connecting to ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      const finish = (result: OpenClawLeoResult) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        if (!result.ok && result.error !== "timeout") {
          console.log(
            `[OC-WS] error: ${result.error}${result.detail ? ` — ${result.detail}` : ""}`
          );
        }
        try {
          ws.removeAllListeners();
        } catch {
          /* ignore */
        }
        try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close(1000);
          }
        } catch {
          /* ignore */
        }
        resolve(result);
      };

      const timer = setTimeout(() => {
        console.log(
          `[OC-WS] timeout after 30s (phase=${phaseForTimeout}, waited_ms=${OPENCLAW_WS_REQUEST_MS})`
        );
        finish({
          ok: false,
          error: "timeout",
          detail: `OpenClaw WebSocket timed out after ${OPENCLAW_WS_REQUEST_MS}ms at phase ${phaseForTimeout}`,
        });
      }, OPENCLAW_WS_REQUEST_MS);

      let phase:
        | "await_challenge"
        | "await_connect"
        | "await_sessions_subscribe"
        | "await_sessions_create"
        | "await_sessions_send"
        | "await_session_message"
        | "await_agent" = "await_challenge";
      let phaseForTimeout: string = phase;
      const setPhase = (next: typeof phase) => {
        phase = next;
        phaseForTimeout = next;
      };
      let connectReqId: string | null = null;
      let canonicalSessionKey = sessionKey;
      let sessionsSubReqId: string | null = null;
      let sessionsCreateReqId: string | null = null;
      let sessionsSendReqId: string | null = null;
      let agentReqId: string | null = null;

      const outboundSessionSendMessage =
        instructions.trim() === ""
          ? composedMessage
          : `${instructions.trim()}\n\n${composedMessage}`;

      const sendAgentRpc = () => {
        console.log("[OC-WS] diag: fallback to agent RPC — invoking agent method");
        setPhase("await_agent");
        agentReqId = randomUUID();
        const idempotencyKey = randomUUID();
        console.log("[OC-WS] sending agent message");
        const agentParams: Record<string, unknown> = {
          message: composedMessage,
          agentId,
          sessionKey: canonicalSessionKey,
          idempotencyKey,
          timeout: 30,
        };
        const sys = instructions.trim();
        if (sys) {
          agentParams.extraSystemPrompt = sys;
        }
        ws.send(
          JSON.stringify({
            type: "req",
            id: agentReqId,
            method: "agent",
            params: agentParams,
          })
        );
      };

      ws.on("error", err => {
        const e = err as { code?: string; message?: string };
        const msg = (e.message ?? String(err)).toLowerCase();
        if (e.code === "ECONNREFUSED" || msg.includes("econnrefused")) {
          finish({
            ok: false,
            error: "gateway_unreachable",
            detail: gatewayUnreachableDeveloperDetail(baseUrl),
          });
          return;
        }
        finish({
          ok: false,
          error: "gateway_unreachable",
          detail: e.message ?? String(err),
        });
      });

      ws.on("close", (_code, _reason) => {
        if (!settled) {
          finish({
            ok: false,
            error: "gateway_unreachable",
            detail: "WebSocket closed before OpenClaw agent completed",
          });
        }
      });

      ws.on("message", rawData => {
        const raw = typeof rawData === "string" ? rawData : rawData.toString();
        console.log(`[OC-WS] received: ${truncateForLog(raw, 2_000)}`);
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          finish({ ok: false, error: "parse_failure", detail: "invalid_json_frame" });
          return;
        }

        if (phase === "await_challenge") {
          if (!isGatewayWsChallengeEvent(parsed)) {
            finish({
              ok: false,
              error: "parse_failure",
              detail: `expected connect.challenge, got ${truncateForLog(raw, 240)}`,
            });
            return;
          }
          console.log("[OC-WS] connect.challenge received");
          setPhase("await_connect");
          connectReqId = randomUUID();
          console.log("[OC-WS] sending connect handshake");
          ws.send(
            JSON.stringify({
              type: "req",
              id: connectReqId,
              method: "connect",
              params: buildConnectHandshakeParams(token, connectRole, connectScopes),
            })
          );
          return;
        }

        if (phase === "await_connect" && connectReqId) {
          const res = asGatewayWsResForId(parsed, connectReqId);
          if (!res) {
            return;
          }
          if (!res.ok) {
            const errBlob = JSON.stringify(res.error ?? {});
            finish({
              ok: false,
              error: gatewayWsErrorLooksLikeAuth(errBlob) ? "auth" : "upstream",
              detail: truncateForLog(errBlob, 800),
            });
            return;
          }
          canonicalSessionKey = sessionKey;
          setPhase("await_sessions_subscribe");
          sessionsSubReqId = randomUUID();
          console.log("[OC-WS] sending sessions.subscribe");
          ws.send(
            JSON.stringify({
              type: "req",
              id: sessionsSubReqId,
              method: "sessions.subscribe",
              params: {},
            })
          );
          return;
        }

        if (phase === "await_sessions_subscribe" && sessionsSubReqId) {
          const res = asGatewayWsResForId(parsed, sessionsSubReqId);
          if (!res) {
            return;
          }
          if (!res.ok) {
            const errBlob = JSON.stringify(res.error ?? {});
            console.log("[OC-WS] diag: sessions.subscribe result ok=false");
            finish({
              ok: false,
              error: gatewayWsErrorLooksLikeAuth(errBlob) ? "auth" : "upstream",
              detail: truncateForLog(errBlob, 800),
            });
            return;
          }
          const subPl = res.payload as { subscribed?: boolean; key?: string } | undefined;
          console.log(
            `[OC-WS] diag: sessions.subscribe result ok=true subscribed=${subPl?.subscribed ?? "?"} key=${subPl?.key ?? "(none)"}`
          );
          setPhase("await_sessions_create");
          sessionsCreateReqId = randomUUID();
          console.log("[OC-WS] sending sessions.create");
          ws.send(
            JSON.stringify({
              type: "req",
              id: sessionsCreateReqId,
              method: "sessions.create",
              params: { key: sessionKey, agentId },
            })
          );
          return;
        }

        if (phase === "await_sessions_create" && sessionsCreateReqId) {
          const res = asGatewayWsResForId(parsed, sessionsCreateReqId);
          if (!res) {
            return;
          }
          if (!res.ok) {
            const errBlob = JSON.stringify(res.error ?? {});
            console.log("[OC-WS] diag: sessions.create result ok=false");
            finish({
              ok: false,
              error: gatewayWsErrorLooksLikeAuth(errBlob) ? "auth" : "upstream",
              detail: truncateForLog(errBlob, 800),
            });
            return;
          }
          const pl = res.payload as { key?: string; sessionId?: string; ok?: boolean } | undefined;

          if (typeof pl?.key === "string" && pl.key.trim()) {
            canonicalSessionKey = pl.key.trim();
          }
          console.log(
            `[OC-WS] diag: sessions.create result ok=true canonicalSessionKey=${canonicalSessionKey} sessionId=${typeof pl?.sessionId === "string" ? pl.sessionId : "(none)"}`
          );
          setPhase("await_sessions_send");
          sessionsSendReqId = randomUUID();
          console.log("[OC-WS] sending sessions.send");
          ws.send(
            JSON.stringify({
              type: "req",
              id: sessionsSendReqId,
              method: "sessions.send",
              params: {
                key: canonicalSessionKey,
                message: outboundSessionSendMessage,
                idempotencyKey: randomUUID(),
              },
            })
          );
          return;
        }

        if (phase === "await_sessions_send" && sessionsSendReqId) {
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            (parsed as { type?: unknown }).type === "event" &&
            (parsed as { event?: unknown }).event === "session.message"
          ) {
            const pay = (parsed as { payload?: unknown }).payload;
            const text = extractAssistantFromSessionMessageEventPayload(pay, canonicalSessionKey);
            logSessionMessageEventDiag(pay, canonicalSessionKey, text ? text.length : null);
            if (text) {
              console.log("[OC-WS] diag: WebSocket session flow succeeded via session.message");
              finish({ ok: true, reply: text });
              return;
            }
          }
          const res = asGatewayWsResForId(parsed, sessionsSendReqId);
          if (!res) {
            return;
          }
          if (!res.ok) {
            console.log("[OC-WS] diag: sessions.send result ok=false — fallback to agent RPC");
            console.log("[OC-WS] sessions.send failed; falling back to agent RPC");
            sendAgentRpc();
            return;
          }
          const sendPl = res.payload as { runId?: string } | undefined;
          console.log(
            `[OC-WS] diag: sessions.send result ok=true runId=${typeof sendPl?.runId === "string" ? sendPl.runId : "(none)"}`
          );
          setPhase("await_session_message");
          return;
        }


        if (phase === "await_session_message") {
          if (
            typeof parsed === "object" &&
            parsed !== null &&
            (parsed as { type?: unknown }).type === "event" &&
            (parsed as { event?: unknown }).event === "session.message"
          ) {
            const pay = (parsed as { payload?: unknown }).payload;
            const text = extractAssistantFromSessionMessageEventPayload(pay, canonicalSessionKey);
            logSessionMessageEventDiag(pay, canonicalSessionKey, text ? text.length : null);
            if (text) {
              console.log("[OC-WS] diag: WebSocket session flow succeeded via session.message");
              finish({ ok: true, reply: text });
              return;
            }
          }
          return;
        }

        if (phase === "await_agent" && agentReqId) {

          const res = asGatewayWsResForId(parsed, agentReqId);
          if (!res) {
            return;
          }
          if (!res.ok) {
            const errBlob = JSON.stringify(res.error ?? {});
            finish({
              ok: false,
              error: gatewayWsErrorLooksLikeAuth(errBlob) ? "auth" : "upstream",
              detail: truncateForLog(errBlob, 800),
            });
            return;
          }
          const payload = res.payload;
          if (!payload || typeof payload !== "object") {
            finish({ ok: false, error: "parse_failure", detail: "agent_res_missing_payload" });
            return;
          }
          const p = payload as { status?: unknown; result?: unknown };
          if (p.status === "accepted") {
            return;
          }
          if (p.status === "error") {
            finish({
              ok: false,
              error: "upstream",
              detail: truncateForLog(JSON.stringify(payload), 800),
            });
            return;
          }
          if (p.status === "ok") {
            const reply = extractReplyFromAgentGatewayResult(p.result);
            if (reply) {
              console.log(
                `[OC-WS] diag: WebSocket path completed via agent RPC fallback replyChars=${reply.length}`
              );
              finish({ ok: true, reply });
              return;
            }
            finish({
              ok: false,
              error: "parse_failure",
              detail: truncateForLog(JSON.stringify(p.result ?? payload), 800),
            });
            return;
          }
        }
      });
    });

    lastOutcome = attempt;
    if (attempt.ok) {
      return attempt;
    }
    if (!isOpenClawWsHandshakeVariantRetryable(attempt)) {
      return attempt;
    }
  }

  return lastOutcome;
}

function preferChatCompletionsOnly(): boolean {
  return process.env.OPENCLAW_PREFER_CHAT_COMPLETIONS?.trim().toLowerCase() === "true";
}

/**
 * Prefer POST /v1/responses; fall back to POST /v1/chat/completions when the responses surface is unavailable
 * or returns an OK body we cannot parse. Bearer auth is server-side only (callers must not forward to browser).
 */
export async function callOpenClawLeo(params: OpenClawChatParams): Promise<OpenClawLeoResult> {
  const {
    baseUrl,
    token,
    model: preferredModel,
    instructions,
    message,
    history,
    sessionUserKey,
    requireChatCompletionsPreflight,
  } = params;

  const bearerPresent = Boolean(token?.length);
  console.log(
    `[openclaw] effective OPENCLAW_BASE_URL=${baseUrl} Authorization=${bearerPresent ? `Bearer present (len=${token.length})` : "missing"}`
  );

  const agentIdForWs = (() => {
    const p = preferredModel.trim();
    if (p.startsWith("openclaw/")) {
      return p.slice("openclaw/".length).trim() || "default";
    }
    return p || "default";
  })();

  const wsAttempt = await callOpenClawLeoViaWebSocket(message, agentIdForWs, baseUrl, token, {
    instructions,
    history,
    sessionUserKey,
  });
  if (wsAttempt.ok) {
    console.log(
      "[openclaw] active path: gateway_websocket (sessions + session.message, or agent RPC fallback — see [OC-WS] diag)"
    );
    return wsAttempt;
  }
  console.log(
    `[OC-WS] falling back to HTTP: ${wsAttempt.error}${wsAttempt.detail ? ` — ${wsAttempt.detail}` : ""}`
  );
  console.warn(
    `[openclaw] gateway WebSocket agent failed (${wsAttempt.error}) — falling back to HTTP API. ${wsAttempt.detail ?? ""}`.trim()
  );

  const OPENAI_HTTP_DOC = "https://docs.molt.bot/gateway/openai-http-api";

  const strictPreflight = requireChatCompletionsPreflight === true;
  if (strictPreflight) {
    const pre = await gatewayChatCompletionsProbeLightweight(baseUrl, token, CHAT_COMPLETIONS_PREFLIGHT_MS);
    console.log(
      `[openclaw] POST /v1/chat/completions preflight → ${pre.status} ok=${pre.ok} ct=${pre.contentType ? pre.contentType.split(";")[0] : "(none)"} hint=${pre.hint ?? "none"} body=${truncateForLog(pre.raw)}`
    );
    if (!pre.ok) {
      if (pre.hint === "auth_required" || pre.status === 401 || pre.status === 403) {
        return {
          ok: false,
          error: "auth",
          detail: `POST /v1/chat/completions preflight → ${pre.status} ${truncateForLog(pre.raw)}`,
        };
      }
      if (pre.hint === "endpoint_disabled" || pre.hint === "non_json_response") {
        console.error(
          `[openclaw] POST /v1/chat/completions not usable at ${baseUrl}. Enable gateway.http.endpoints.chatCompletions.enabled in OpenClaw. See ${OPENAI_HTTP_DOC}`
        );
        return {
          ok: false,
          error: "openai_http_disabled",
          detail: OPENAI_HTTP_DISABLED_DETAIL,
        };
      }
      const cmd = formatOpenClawGatewayStartCommand(baseUrl);
      const detail =
        pre.hint === "connection_refused"
          ? gatewayUnreachableDeveloperDetail(baseUrl)
          : pre.hint === "network_error"
            ? `Could not reach OpenClaw at ${baseUrl} (preflight timeout or network error). Ensure the gateway is running, then retry: ${cmd}`
            : `POST /v1/chat/completions preflight → ${pre.status} hint=${pre.hint ?? ""} ${truncateForLog(pre.raw, 400)}`;
      return { ok: false, error: "gateway_unreachable", detail };
    }
  }

  const probe = await gatewayModelsProbe(baseUrl, token);
  console.log(
    `[openclaw] GET /v1/models (optional catalog) → ${probe.status} apiOk=${probe.ok} ct=${probe.contentType ? probe.contentType.split(";")[0] : "(none)"} hint=${probe.hint ?? "none"} body=${truncateForLog(probe.raw)}`
  );
  if (probe.modelIds.length) {
    console.log(`[openclaw] /v1/models ids (first 20): ${probe.modelIds.slice(0, 20).join(", ")}${probe.modelIds.length > 20 ? "…" : ""}`);
  } else if (probe.hint === "models_catalog_unavailable") {
    console.log(
      `[openclaw] GET /v1/models is not a JSON model list in this OpenClaw build — using configured model id (see ${OPENAI_HTTP_DOC})`
    );
  }

  if (probe.hint === "auth_required" || probe.status === 401 || probe.status === 403) {
    return {
      ok: false,
      error: "auth",
      detail: `GET /v1/models → ${probe.status} ${truncateForLog(probe.raw)}`,
    };
  }

  const { model, resolution } = resolveOpenClawModelFromIds(
    preferredModel,
    probe.ok ? probe.modelIds : []
  );
  console.log(`[openclaw] using model=${model} (${resolution}); env preferred was ${preferredModel}`);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const inputItems = [
    ...history.map(h => ({
      type: "message" as const,
      role: h.role,
      content: h.content,
    })),
    { type: "message" as const, role: "user" as const, content: message },
  ];

  const completionsFirst = preferChatCompletionsOnly();
  if (completionsFirst) {
    console.log("[openclaw] active path: chat_completions_only (OPENCLAW_PREFER_CHAT_COMPLETIONS=true)");
    const c = await postChatCompletions(
      baseUrl,
      headers,
      model,
      instructions,
      message,
      history,
      sessionUserKey
    );
    if ("reply" in c && c.reply) return { ok: true, reply: c.reply };
    const ce = c as { error: string; completionsStatus?: number; bodySnippet?: string };
    if (ce.error === "gateway_unreachable") {
      return {
        ok: false,
        error: "gateway_unreachable",
        detail: ce.bodySnippet || gatewayUnreachableDeveloperDetail(baseUrl),
      };
    }
    if (ce.completionsStatus === 404) {
      return { ok: false, error: "openai_http_disabled", detail: OPENAI_HTTP_DISABLED_DETAIL };
    }
    return {
      ok: false,
      error: ce.error === "auth" ? "auth" : ce.error === "parse_failure" ? "parse_failure" : "upstream",
      detail: `${ce.error} completions=${ce.completionsStatus ?? "?"} ${ce.bodySnippet ?? ""}`,
    };
  }

  try {
    const responsesBody = {
      model,
      instructions,
      input: inputItems,
      user: sessionUserKey,
      max_output_tokens: 2048,
    };

    const first = await fetchJsonWithTimeout(
      `${baseUrl}/v1/responses`,
      { method: "POST", headers, body: JSON.stringify(responsesBody) },
      REQUEST_TIMEOUT_MS
    );

    console.log(
      `[openclaw] POST /v1/responses → ${first.status}${first.ok ? " ok" : ""} body=${truncateForLog(first.raw)}`
    );

    if (first.ok) {
      const reply = extractFromResponses(first.data);
      if (reply) {
        console.log("[openclaw] active path: responses (parsed reply)");
        return { ok: true, reply };
      }
      console.warn("[openclaw] POST /v1/responses OK but unparseable body; trying /v1/chat/completions");
      const c = await postChatCompletions(
        baseUrl,
        headers,
        model,
        instructions,
        message,
        history,
        sessionUserKey
      );
      if ("reply" in c && c.reply) {
        console.log("[openclaw] active path: chat_completions (after responses parse_failure)");
        return { ok: true, reply: c.reply };
      }
      const ce = c as { error: string; completionsStatus?: number; bodySnippet?: string };
      if (ce.error === "gateway_unreachable") {
        return {
          ok: false,
          error: "gateway_unreachable",
          detail: ce.bodySnippet || gatewayUnreachableDeveloperDetail(baseUrl),
        };
      }
      if (ce.completionsStatus === 404) {
        return { ok: false, error: "openai_http_disabled", detail: OPENAI_HTTP_DISABLED_DETAIL };
      }
      return {
        ok: false,
        error: "parse_failure",
        detail: `responses unparseable; completions ${ce.completionsStatus}: ${ce.bodySnippet ?? ce.error}`,
      };
    }

    if (looksLikeAuthFailure(first.status, first.raw)) {
      return {
        ok: false,
        error: "auth",
        detail: `POST /v1/responses → ${first.status} ${truncateForLog(first.raw)}`,
      };
    }

    const tryCc = shouldTryChatCompletions(first.status, first.raw);
    if (!tryCc) {
      let failError: Extract<OpenClawLeoResult, { ok: false }>["error"] = "upstream";
      if (looksLikeModelNotFound(first.status, first.raw)) failError = "model_not_found";
      else if (looksLikeResponsesDisabled(first.raw)) failError = "responses_disabled";
      return {
        ok: false,
        error: failError,
        detail: `POST /v1/responses → ${first.status} ${truncateForLog(first.raw)}`,
      };
    }

    console.warn(
      `[openclaw] /v1/responses not usable (${first.status}); trying /v1/chat/completions (${truncateForLog(first.raw, 400)})`
    );
    const c = await postChatCompletions(
      baseUrl,
      headers,
      model,
      instructions,
      message,
      history,
      sessionUserKey
    );
    if ("reply" in c && c.reply) {
      console.log("[openclaw] active path: chat_completions (responses failed or disabled)");
      return { ok: true, reply: c.reply };
    }
    const ce = c as { error: string; completionsStatus?: number; bodySnippet?: string };
    const combinedDetail = `responses=${first.status} ${truncateForLog(first.raw, 500)} | completions=${ce.completionsStatus} ${ce.bodySnippet ?? ""}`;
    if (ce.error === "gateway_unreachable") {
      return {
        ok: false,
        error: "gateway_unreachable",
        detail: ce.bodySnippet || gatewayUnreachableDeveloperDetail(baseUrl),
      };
    }
    if (first.status === 404 && ce.completionsStatus === 404) {
      return { ok: false, error: "openai_http_disabled", detail: OPENAI_HTTP_DISABLED_DETAIL };
    }
    if (ce.completionsStatus === 404) {
      return { ok: false, error: "openai_http_disabled", detail: OPENAI_HTTP_DISABLED_DETAIL };
    }
    if (looksLikeModelNotFound(first.status, first.raw) || looksLikeModelNotFound(ce.completionsStatus ?? 0, ce.bodySnippet ?? "")) {
      return { ok: false, error: "model_not_found", detail: combinedDetail };
    }
    return {
      ok: false,
      error: ce.error === "auth" ? "auth" : "upstream",
      detail: combinedDetail,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[openclaw] request failed", msg);
    if (msg.includes("abort") || msg.includes("Abort")) {
      return { ok: false, error: "timeout", detail: msg };
    }
    if (isConnectionRefusedError(e)) {
      return {
        ok: false,
        error: "gateway_unreachable",
        detail: gatewayUnreachableDeveloperDetail(baseUrl),
      };
    }
    return { ok: false, error: "gateway_unreachable", detail: msg };
  }
}

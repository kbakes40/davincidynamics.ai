/**
 * Optional email verification via ZeroBounce or NeverBounce (server-side keys only).
 */

export type EmailValidationOutcome =
  | { available: false; reason: string }
  | {
      available: true;
      provider: "zerobounce" | "neverbounce";
      result: "valid" | "invalid" | "catch_all" | "unknown" | "error";
      subStatus?: string;
      raw?: string;
    };

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function validateEmailWithProvider(email: string): Promise<EmailValidationOutcome> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { available: false, reason: "invalid_email_format" };
  }

  const zb = process.env.ZEROBOUNCE_API_KEY?.trim();
  if (zb) {
    try {
      const u = new URL("https://api.zerobounce.net/v2/validate");
      u.searchParams.set("api_key", zb);
      u.searchParams.set("email", trimmed);
      u.searchParams.set("ip_address", "");
      const res = await fetchWithTimeout(u.toString(), { method: "GET" }, 12_000);
      const text = await res.text();
      if (!res.ok) {
        return {
          available: true,
          provider: "zerobounce",
          result: "error",
          raw: text.slice(0, 300),
        };
      }
      let j: { status?: string; sub_status?: string };
      try {
        j = JSON.parse(text) as { status?: string; sub_status?: string };
      } catch {
        return {
          available: true,
          provider: "zerobounce",
          result: "error",
          raw: text.slice(0, 300),
        };
      }
      const st = (j.status ?? "").toLowerCase();
      if (st === "valid") {
        return { available: true, provider: "zerobounce", result: "valid", subStatus: j.sub_status };
      }
      if (st === "invalid" || st === "spamtrap" || st === "abuse" || st === "do_not_mail") {
        return { available: true, provider: "zerobounce", result: "invalid", subStatus: j.sub_status };
      }
      if (st === "catch-all") {
        return { available: true, provider: "zerobounce", result: "catch_all", subStatus: j.sub_status };
      }
      return {
        available: true,
        provider: "zerobounce",
        result: "unknown",
        subStatus: j.sub_status ?? st,
      };
    } catch {
      return { available: true, provider: "zerobounce", result: "error" };
    }
  }

  const nb = process.env.NEVERBOUNCE_API_KEY?.trim();
  if (nb) {
    try {
      const res = await fetchWithTimeout(
        "https://api.neverbounce.com/v4/single/check",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: nb,
            email: trimmed,
            credits_info: 0,
          }),
        },
        12_000
      );
      const text = await res.text();
      if (!res.ok) {
        return {
          available: true,
          provider: "neverbounce",
          result: "error",
          raw: text.slice(0, 300),
        };
      }
      let j: { result?: number; result_details?: { verdict?: string } };
      try {
        j = JSON.parse(text) as { result?: number; result_details?: { verdict?: string } };
      } catch {
        return {
          available: true,
          provider: "neverbounce",
          result: "error",
          raw: text.slice(0, 300),
        };
      }
      const verdict = (j.result_details?.verdict ?? "").toLowerCase();
      if (j.result === 0 && verdict === "valid") {
        return { available: true, provider: "neverbounce", result: "valid" };
      }
      if (j.result === 2 || verdict === "invalid") {
        return { available: true, provider: "neverbounce", result: "invalid" };
      }
      if (j.result === 3 || verdict === "catchall" || verdict === "catch_all") {
        return { available: true, provider: "neverbounce", result: "catch_all" };
      }
      if (j.result === 4) {
        return { available: true, provider: "neverbounce", result: "unknown" };
      }
      return { available: true, provider: "neverbounce", result: "unknown", subStatus: String(j.result) };
    } catch {
      return { available: true, provider: "neverbounce", result: "error" };
    }
  }

  return {
    available: false,
    reason: "No ZEROBOUNCE_API_KEY or NEVERBOUNCE_API_KEY configured",
  };
}

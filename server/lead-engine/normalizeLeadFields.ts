export type NormalizedLeadFields = {
  businessName: string;
  normalizedBusinessName: string;
  phoneDisplay: string | null;
  normalizedPhone: string | null;
  email: string | null;
  websiteDisplay: string | null;
  normalizedWebsite: string | null;
};

const CONTROL_CHARS = /[\u0000-\u001f]/g;

export function stripControlChars(s: string): string {
  return s.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim();
}

export function normalizeBusinessNameForDedupe(raw: string): string {
  const s = stripControlChars(raw).toLowerCase();
  return s.replace(/[^a-z0-9]+/g, "").slice(0, 500);
}

export function normalizePhoneDigits(raw: string | null | undefined): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const d = String(raw).replace(/\D/g, "");
  if (d.length < 10) return d.length ? d : null;
  if (d.length === 10) return d;
  if (d.length === 11 && d.startsWith("1")) return d.slice(1);
  return d;
}

export function normalizeWebsiteUrl(raw: string | null | undefined): {
  display: string | null;
  normalized: string | null;
} {
  if (raw == null || !String(raw).trim()) return { display: null, normalized: null };
  let s = stripControlChars(String(raw));
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return { display: null, normalized: null };
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/+$/, "");
    const normalized = `${host}${path}`;
    return { display: s, normalized };
  } catch {
    return { display: s, normalized: null };
  }
}

export function normalizeEmail(raw: string | null | undefined): string | null {
  if (raw == null || !String(raw).trim()) return null;
  const e = stripControlChars(String(raw)).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return e || null;
  return e;
}

export function normalizeLeadFields(input: {
  businessName: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}): NormalizedLeadFields {
  const businessName = stripControlChars(input.businessName);
  const normalizedBusinessName = normalizeBusinessNameForDedupe(businessName);
  const normalizedPhone = normalizePhoneDigits(input.phone);
  const phoneDisplay =
    normalizedPhone && normalizedPhone.length === 10
      ? `+1${normalizedPhone}`
      : input.phone?.trim()
        ? stripControlChars(input.phone!)
        : normalizedPhone;
  const { display: websiteDisplay, normalized: normalizedWebsite } = normalizeWebsiteUrl(input.website);
  return {
    businessName,
    normalizedBusinessName,
    phoneDisplay: phoneDisplay || null,
    normalizedPhone,
    email: normalizeEmail(input.email),
    websiteDisplay,
    normalizedWebsite,
  };
}

import { normalizeWebsiteUrl } from "./normalizeLeadFields";

const MAX_BODY_BYTES = 600_000;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 8;

export type WebsiteCheckStatus =
  | "live"
  | "redirected"
  | "broken"
  | "timeout"
  | "invalid_url"
  | "missing";

export type WebsiteCheckResult = {
  status: WebsiteCheckStatus;
  requestedUrl: string | null;
  finalUrl: string | null;
  httpStatus: number | null;
  sslEnabled: boolean | null;
  mobileFriendly: boolean | null;
  hasContactForm: boolean | null;
  hasBookingFlow: boolean | null;
  hasChatWidget: boolean | null;
  hasMetaPixel: boolean | null;
  hasGoogleAnalytics: boolean | null;
  ecommercePlatform: string | null;
  crmDetected: string | null;
  techStack: string[];
  summary: string;
};

function blockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|0\.)/.test(h) ||
    h === "[::1]"
  ) {
    return true;
  }
  return false;
}

function normalizeCheckUrl(raw: string | null | undefined): URL | null {
  if (raw == null || !String(raw).trim()) return null;
  const { display } = normalizeWebsiteUrl(raw);
  if (!display) return null;
  try {
    const u = new URL(display);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (blockedHost(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

function lowerHtml(html: string): string {
  return html.toLowerCase();
}

function detectSignals(html: string, finalUrl: string, initialUrl: string): Omit<WebsiteCheckResult, "status" | "requestedUrl"> {
  const lower = lowerHtml(html);
  const tech: string[] = [];

  const mobileFriendly = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);

  const hasContactForm =
    /<form[^>]*>/i.test(html) &&
    /(contact|email|reach|message|inquiry|get in touch|support)/i.test(html.slice(0, 200_000));

  const hasBookingFlow =
    /(calendly\.com|appointments|book now|schedule (a |an |your )?call|resy\.com|opentable|book\.|booking\.|\/book|\/reserve|tidycal|square\.site\/appointments)/i.test(
      lower
    );

  const hasChatWidget =
    /(intercom\.io|widget\.intercom|crisp\.chat|drift\.com|tidio\.co|hubspot\.com\/conversations|hs-scripts\.com|zendesk\.com\/widget|livechatinc\.com|olark\.com)/i.test(
      lower
    );

  const hasMetaPixel =
    /connect\.facebook\.net\/.*fbevents\.js|fbq\s*\(|facebook\.com\/tr\?/i.test(lower);

  const hasGoogleAnalytics =
    /googletagmanager\.com|google-analytics\.com|gtag\s*\(|analytics\.js|ga\(/.test(lower);

  let ecommercePlatform: string | null = null;
  if (/cdn\.shopify\.com|shopify\.com\/s\/|myshopify\.com/i.test(lower)) {
    ecommercePlatform = "Shopify";
    tech.push("Shopify");
  } else if (/woocommerce|wp-content\/plugins\/woocommerce/i.test(lower)) {
    ecommercePlatform = "WooCommerce";
    tech.push("WooCommerce");
  } else if (/bigcommerce\.com|cdn\d*\.bigcommerce\.com/i.test(lower)) {
    ecommercePlatform = "BigCommerce";
    tech.push("BigCommerce");
  } else if (/square\.site|squareup\.com\/online-store/i.test(lower)) {
    ecommercePlatform = "Square Online";
    tech.push("Square");
  } else if (/wix\.com\/static|wixstatic\.com|wixstores/i.test(lower)) {
    ecommercePlatform = "Wix";
    tech.push("Wix");
  } else if (/magentocommerce|magento\./i.test(lower)) {
    ecommercePlatform = "Magento";
    tech.push("Magento");
  }

  let crmDetected: string | null = null;
  if (/hubspot\.com|hs-scripts\.com|hscta\.net/i.test(lower)) {
    crmDetected = "HubSpot";
    tech.push("HubSpot");
  } else if (/salesforce\.com|force\.com|pardot\.com/i.test(lower)) {
    crmDetected = "Salesforce";
    tech.push("Salesforce");
  } else if (/marketo\.com|mkt\d*\.net/i.test(lower)) {
    crmDetected = "Marketo";
    tech.push("Marketo");
  } else if (/typeform\.com|jotform\.com|wufoo\.com/i.test(lower)) {
    crmDetected = "Form builder";
    tech.push("Forms");
  }

  const sslEnabled = finalUrl.startsWith("https:");

  const parts: string[] = [];
  if (hasMetaPixel) parts.push("Meta Pixel");
  if (hasGoogleAnalytics) parts.push("Analytics");
  if (hasChatWidget) parts.push("chat widget");
  const summary =
    parts.length > 0
      ? `Detected: ${parts.join(", ")}.${ecommercePlatform ? ` Platform: ${ecommercePlatform}.` : ""}`
      : ecommercePlatform
        ? `E-commerce: ${ecommercePlatform}.`
        : mobileFriendly
          ? "Site loads; viewport meta present."
          : "Site loads; limited marketing signals in HTML sample.";

  return {
    finalUrl,
    httpStatus: 200,
    sslEnabled,
    mobileFriendly,
    hasContactForm,
    hasBookingFlow,
    hasChatWidget,
    hasMetaPixel,
    hasGoogleAnalytics,
    ecommercePlatform,
    crmDetected,
    techStack: tech,
    summary,
  };
}

async function fetchHtmlFollowRedirects(startUrl: URL): Promise<{
  finalUrl: string;
  status: number;
  html: string;
  error?: "timeout" | "too_many_redirects";
}> {
  let current = startUrl.href;
  let redirectCount = 0;

  for (;;) {
    if (redirectCount++ > MAX_REDIRECTS) {
      return { finalUrl: current, status: 0, html: "", error: "too_many_redirects" };
    }

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: ac.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          "User-Agent":
            "Mozilla/5.0 (compatible; DaVinciLeadEngine/1.0; +https://davincidynamics.ai)",
        },
      });
    } catch (e) {
      clearTimeout(timer);
      if (e instanceof Error && e.name === "AbortError") {
        return { finalUrl: current, status: 0, html: "", error: "timeout" };
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) {
        return { finalUrl: current, status: res.status, html: "" };
      }
      current = new URL(loc, current).href;
      try {
        const u = new URL(current);
        if (blockedHost(u.hostname)) {
          return { finalUrl: current, status: res.status, html: "" };
        }
      } catch {
        return { finalUrl: current, status: res.status, html: "" };
      }
      continue;
    }

    if (!res.ok) {
      const buf = await res.arrayBuffer().catch(() => null);
      const html =
        buf && buf.byteLength > 0
          ? new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 20_000))
          : "";
      return { finalUrl: res.url || current, status: res.status, html };
    }

    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_BODY_BYTES ? buf.slice(0, MAX_BODY_BYTES) : buf;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);
    return { finalUrl: res.url || current, status: res.status, html };
  }
}

export async function checkWebsite(url: string | null | undefined): Promise<WebsiteCheckResult> {
  const initial = normalizeCheckUrl(url);
  if (!initial) {
    if (url != null && String(url).trim() !== "") {
      return {
        status: "invalid_url",
        requestedUrl: String(url).trim(),
        finalUrl: null,
        httpStatus: null,
        sslEnabled: null,
        mobileFriendly: null,
        hasContactForm: null,
        hasBookingFlow: null,
        hasChatWidget: null,
        hasMetaPixel: null,
        hasGoogleAnalytics: null,
        ecommercePlatform: null,
        crmDetected: null,
        techStack: [],
        summary: "URL could not be normalized or uses a blocked host.",
      };
    }
    return {
      status: "missing",
      requestedUrl: null,
      finalUrl: null,
      httpStatus: null,
      sslEnabled: null,
      mobileFriendly: null,
      hasContactForm: null,
      hasBookingFlow: null,
      hasChatWidget: null,
      hasMetaPixel: null,
      hasGoogleAnalytics: null,
      ecommercePlatform: null,
      crmDetected: null,
      techStack: [],
      summary: "No website URL on record.",
    };
  }

  const requestedUrl = initial.href;
  let fetched: { finalUrl: string; status: number; html: string; error?: string };
  try {
    fetched = await fetchHtmlFollowRedirects(initial);
  } catch {
    return {
      status: "broken",
      requestedUrl,
      finalUrl: null,
      httpStatus: null,
      sslEnabled: null,
      mobileFriendly: null,
      hasContactForm: null,
      hasBookingFlow: null,
      hasChatWidget: null,
      hasMetaPixel: null,
      hasGoogleAnalytics: null,
      ecommercePlatform: null,
      crmDetected: null,
      techStack: [],
      summary: "Fetch failed (network or TLS error).",
    };
  }

  if (fetched.error === "timeout") {
    return {
      status: "timeout",
      requestedUrl,
      finalUrl: fetched.finalUrl,
      httpStatus: null,
      sslEnabled: null,
      mobileFriendly: null,
      hasContactForm: null,
      hasBookingFlow: null,
      hasChatWidget: null,
      hasMetaPixel: null,
      hasGoogleAnalytics: null,
      ecommercePlatform: null,
      crmDetected: null,
      techStack: [],
      summary: "Request timed out.",
    };
  }

  if (fetched.error === "too_many_redirects" || fetched.status >= 400) {
    return {
      status: "broken",
      requestedUrl,
      finalUrl: fetched.finalUrl,
      httpStatus: fetched.status || null,
      sslEnabled: fetched.finalUrl.startsWith("https:"),
      mobileFriendly: null,
      hasContactForm: null,
      hasBookingFlow: null,
      hasChatWidget: null,
      hasMetaPixel: null,
      hasGoogleAnalytics: null,
      ecommercePlatform: null,
      crmDetected: null,
      techStack: [],
      summary:
        fetched.status >= 400
          ? `HTTP ${fetched.status} from server.`
          : "Too many redirects.",
    };
  }

  const redirected =
    normalizeUrlKey(requestedUrl) !== normalizeUrlKey(fetched.finalUrl);

  const signals = detectSignals(fetched.html, fetched.finalUrl, requestedUrl);

  return {
    status: redirected ? "redirected" : "live",
    requestedUrl,
    ...signals,
  };
}

function normalizeUrlKey(u: string): string {
  try {
    const x = new URL(u);
    return `${x.hostname.replace(/^www\./, "")}${x.pathname.replace(/\/$/, "")}`;
  } catch {
    return u;
  }
}

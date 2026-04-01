import { BetaAnalyticsDataClient } from "@google-analytics/data";

let cached: BetaAnalyticsDataClient | null = null;

const REQUIRED = ["GA4_PROPERTY_ID", "GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY"] as const;

export function getMissingGa4Env(): string[] {
  return REQUIRED.filter(k => !process.env[k]?.trim());
}

export function getGa4PropertyResourceName(): string | null {
  const id = process.env.GA4_PROPERTY_ID?.trim();
  if (!id) return null;
  return `properties/${id}`;
}

export function getAnalyticsDataClient(): BetaAnalyticsDataClient | null {
  if (getMissingGa4Env().length > 0) return null;
  if (cached) return cached;

  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  if (!privateKey || !clientEmail) return null;

  cached = new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
  return cached;
}

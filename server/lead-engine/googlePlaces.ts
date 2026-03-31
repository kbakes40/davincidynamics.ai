/**
 * Google Places API (New) — server-side only. Uses GOOGLE_PLACES_API_KEY.
 * @see https://developers.google.com/maps/documentation/places/web-service/op-search-text
 */

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_DETAIL_URL = "https://places.googleapis.com/v1/places";

const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.types",
].join(",");

const DETAIL_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "location",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "types",
].join(",");

export type GooglePlaceRecord = {
  placeId: string;
  businessName: string;
  category: string;
  formattedAddress: string | null;
  addressLine: string | null;
  city: string;
  state: string;
  zip: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  rawPlace: Record<string, unknown>;
};

type AddressParts = {
  line: string | null;
  city: string;
  state: string;
  zip: string | null;
  country: string;
};

function parseAddressComponents(
  components: unknown,
  formattedAddress: string | null
): AddressParts {
  const out: AddressParts = {
    line: null,
    city: "",
    state: "",
    zip: null,
    country: "US",
  };
  if (!Array.isArray(components)) {
    return out;
  }
  const streetNumber = components.find(
    (c: { types?: string[] }) => c.types?.includes("street_number")
  ) as { longText?: string } | undefined;
  const route = components.find((c: { types?: string[] }) => c.types?.includes("route")) as
    | { longText?: string }
    | undefined;
  const locality = components.find((c: { types?: string[] }) => c.types?.includes("locality")) as
    | { longText?: string }
    | undefined;
  const admin = components.find((c: { types?: string[] }) =>
    c.types?.includes("administrative_area_level_1")
  ) as { shortText?: string; longText?: string } | undefined;
  const postal = components.find((c: { types?: string[] }) => c.types?.includes("postal_code")) as
    | { longText?: string }
    | undefined;
  const country = components.find((c: { types?: string[] }) => c.types?.includes("country")) as
    | { shortText?: string }
    | undefined;

  if (streetNumber?.longText && route?.longText) {
    out.line = `${streetNumber.longText} ${route.longText}`;
  } else if (route?.longText) {
    out.line = route.longText;
  }
  out.city = locality?.longText ?? "";
  out.state = admin?.shortText ?? admin?.longText ?? "";
  out.zip = postal?.longText ?? null;
  out.country = country?.shortText ?? "US";

  if (!out.city && !out.line && formattedAddress) {
    out.line = formattedAddress;
  }
  return out;
}

function placeResourceId(place: Record<string, unknown>): string {
  const name = place.name as string | undefined;
  const id = place.id as string | undefined;
  return String(name ?? id ?? "");
}

export function placeIdForDetailPath(resourceId: string): string {
  return resourceId.startsWith("places/") ? resourceId.slice("places/".length) : resourceId;
}

function mapPlaceToRecord(place: Record<string, unknown>): GooglePlaceRecord {
  const displayName = place.displayName as { text?: string } | undefined;
  const types = (place.types as string[] | undefined) ?? [];
  const loc = place.location as { latitude?: number; longitude?: number } | undefined;
  const addr = parseAddressComponents(
    place.addressComponents,
    (place.formattedAddress as string | undefined) ?? null
  );

  return {
    placeId: placeResourceId(place),
    businessName: displayName?.text?.trim() ?? "Unknown",
    category: types[0]?.replace(/_/g, " ") ?? "establishment",
    formattedAddress: (place.formattedAddress as string) ?? null,
    addressLine: addr.line,
    city: addr.city,
    state: addr.state,
    zip: addr.zip,
    country: addr.country,
    latitude: loc?.latitude ?? null,
    longitude: loc?.longitude ?? null,
    phone:
      (place.nationalPhoneNumber as string | undefined) ??
      (place.internationalPhoneNumber as string | undefined) ??
      null,
    website: (place.websiteUri as string | undefined) ?? null,
    googleMapsUrl: (place.googleMapsUri as string | undefined) ?? null,
    rawPlace: place,
  };
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ac.signal });
  } finally {
    clearTimeout(t);
  }
}

export type GooglePlacesSearchInput = {
  searchTerm?: string;
  category?: string;
  zip?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  /** Ignored when lat/lng omitted. */
  radiusMiles?: number;
  maxResults: number;
};

export async function searchGooglePlaces(input: GooglePlacesSearchInput): Promise<GooglePlaceRecord[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  const parts = [
    input.searchTerm,
    input.category,
    input.city,
    input.state,
    input.zip,
  ].filter(p => p && String(p).trim() !== "");

  const textQuery = parts.length > 0 ? parts.join(" ") : input.category?.trim() || "local businesses";

  const want = Math.min(200, Math.max(1, input.maxResults));
  const radiusMiles = input.radiusMiles ?? 10;
  const locationBias =
    input.latitude != null &&
    input.longitude != null &&
    Number.isFinite(input.latitude) &&
    Number.isFinite(input.longitude)
      ? {
          circle: {
            center: { latitude: input.latitude, longitude: input.longitude },
            radius: Math.min(50000, Math.max(100, radiusMiles * 1609.34)),
          },
        }
      : undefined;

  const baseBody: Record<string, unknown> = {
    textQuery,
    pageSize: 20,
    ...(locationBias ? { locationBias } : {}),
  };

  const collected: GooglePlaceRecord[] = [];
  const seen = new Set<string>();
  let pageToken: string | undefined;

  for (;;) {
    const body: Record<string, unknown> = {
      ...baseBody,
      ...(pageToken ? { pageToken } : {}),
    };

    const res = await fetchWithTimeout(
      PLACES_SEARCH_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": SEARCH_FIELD_MASK,
        },
        body: JSON.stringify(body),
      },
      25_000
    );

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Google Places search failed (${res.status}): ${t.slice(0, 500)}`);
    }

    const json = (await res.json()) as {
      places?: Record<string, unknown>[];
      nextPageToken?: string;
    };
    const places = json.places ?? [];
    for (const p of places) {
      const rec = mapPlaceToRecord(p);
      if (!rec.placeId || seen.has(rec.placeId)) continue;
      seen.add(rec.placeId);
      collected.push(rec);
      if (collected.length >= want) break;
    }
    if (collected.length >= want) break;
    const next = json.nextPageToken?.trim();
    if (!next) break;
    pageToken = next;
    await new Promise(r => setTimeout(r, 1500));
  }

  const records = collected.slice(0, want);

  /** Optional: fetch Place Details when website/phone missing (extra billable call). */
  const needDetails = records.filter(r => (!r.website || !r.phone) && r.placeId);
  const enriched = new Map<string, GooglePlaceRecord>();
  for (const r of records) enriched.set(r.placeId, r);

  for (const r of needDetails) {
    const idEnc = encodeURIComponent(placeIdForDetailPath(r.placeId));
    const dRes = await fetchWithTimeout(`${PLACES_DETAIL_URL}/${idEnc}`, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": DETAIL_FIELD_MASK,
      },
    }, 15_000).catch(() => null);

    if (!dRes?.ok) continue;
    try {
      const detail = (await dRes.json()) as Record<string, unknown>;
      const merged = mapPlaceToRecord(detail);
      enriched.set(r.placeId, {
        ...r,
        phone: merged.phone ?? r.phone,
        website: merged.website ?? r.website,
        googleMapsUrl: merged.googleMapsUrl ?? r.googleMapsUrl,
        formattedAddress: merged.formattedAddress ?? r.formattedAddress,
        rawPlace: { ...r.rawPlace, detail },
      });
    } catch {
      /* ignore */
    }
  }

  return Array.from(enriched.values()).slice(0, want);
}

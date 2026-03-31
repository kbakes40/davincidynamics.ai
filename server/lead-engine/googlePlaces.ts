/**
 * Google Places API (New) — server-side only. Uses GOOGLE_PLACES_API_KEY.
 * @see https://developers.google.com/maps/documentation/places/web-service/op-search-text
 */

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_DETAIL_URL = "https://places.googleapis.com/v1/places";
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

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

const NOISE_TERMS = new Set([
  "zip",
  "postal",
  "code",
  "near",
  "around",
  "in",
  "the",
  "a",
  "an",
]);

const CHAIN_NAME_PATTERNS = [
  /\bsubway\b/i,
  /\bmcdonald'?s\b/i,
  /\bburger king\b/i,
  /\btaco bell\b/i,
  /\bkfc\b/i,
  /\bwalmart\b/i,
  /\btarget\b/i,
  /\bcostco\b/i,
  /\bwalgreens\b/i,
  /\bcvs\b/i,
  /\b7-eleven\b/i,
  /\bplanet fitness\b/i,
  /\bdomino'?s\b/i,
  /\bpizza hut\b/i,
  /\bstarbucks\b/i,
];

const NICHE_PRESETS = {
  auto: { label: "Auto", categories: [], keywords: [], includeTypes: [], excludeTypes: [] },
  restaurants: {
    label: "Restaurants",
    categories: ["restaurant"],
    keywords: ["restaurant", "cafe", "eatery"],
    includeTypes: ["restaurant", "cafe", "meal_takeaway", "food"],
    excludeTypes: ["school", "university", "academic_department", "consultant", "lodging"],
  },
  smoke_shops: {
    label: "Smoke shops",
    categories: ["smoke shop", "tobacco shop", "vape shop"],
    keywords: ["smoke shop", "vape shop", "tobacco shop", "hookah shop"],
    includeTypes: ["store", "shopping_store"],
    excludeTypes: ["gas_station", "supermarket", "convenience_store"],
  },
  barber_shops: {
    label: "Barber shops",
    categories: ["barber shop"],
    keywords: ["barber shop", "barbershop"],
    includeTypes: ["hair_care", "barber_shop"],
    excludeTypes: ["school"],
  },
  salons: {
    label: "Salons",
    categories: ["hair salon", "beauty salon"],
    keywords: ["hair salon", "beauty salon"],
    includeTypes: ["hair_care", "beauty_salon"],
    excludeTypes: ["school"],
  },
  dentists: {
    label: "Dentists",
    categories: ["dentist", "dental clinic"],
    keywords: ["dentist", "dental clinic"],
    includeTypes: ["dentist", "doctor", "health"],
    excludeTypes: ["school", "hospital"],
  },
  roofers: {
    label: "Roofers",
    categories: ["roofing contractor"],
    keywords: ["roofing contractor", "roofer"],
    includeTypes: ["roofing_contractor", "contractor"],
    excludeTypes: ["hardware_store"],
  },
  hvac: {
    label: "HVAC",
    categories: ["hvac contractor", "air conditioning contractor"],
    keywords: ["hvac contractor", "air conditioning contractor"],
    includeTypes: ["contractor", "general_contractor"],
    excludeTypes: ["hardware_store"],
  },
  plumbers: {
    label: "Plumbers",
    categories: ["plumber", "plumbing contractor"],
    keywords: ["plumber", "plumbing contractor"],
    includeTypes: ["plumber", "contractor"],
    excludeTypes: ["hardware_store"],
  },
  auto_repair: {
    label: "Auto repair",
    categories: ["auto repair shop"],
    keywords: ["auto repair shop", "mechanic"],
    includeTypes: ["car_repair", "auto_repair_shop"],
    excludeTypes: ["car_dealer", "gas_station"],
  },
  gyms: {
    label: "Gyms",
    categories: ["gym", "fitness center"],
    keywords: ["gym", "fitness center"],
    includeTypes: ["gym", "health"],
    excludeTypes: ["school"],
  },
  law_firms: {
    label: "Law firms",
    categories: ["law firm", "attorney"],
    keywords: ["law firm", "attorney"],
    includeTypes: ["lawyer"],
    excludeTypes: ["courthouse", "local_government_office"],
  },
} as const;

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

function normalizeSearchFragment(v: string | undefined): string | null {
  const s = (v ?? "").trim().replace(/\s+/g, " ");
  return s ? s : null;
}

function buildTextQueries(input: GooglePlacesSearchInput): string[] {
  const preset = NICHE_PRESETS[input.nichePreset ?? "auto"] ?? NICHE_PRESETS.auto;
  const keyword = normalizeSearchFragment(input.searchTerm) ?? preset.keywords[0] ?? null;
  const category = normalizeSearchFragment(input.category) ?? preset.categories[0] ?? null;
  const city = normalizeSearchFragment(input.city);
  const state = normalizeSearchFragment(input.state);
  const zip = normalizeSearchFragment(input.zip);
  const locationLabel = [city, state].filter(Boolean).join(", ") || zip || state || "";

  const baseBusinessTerm = keyword || category || "local businesses";
  const queryVariants = [
    [keyword, category, city, state].filter(Boolean).join(" "),
    [category, "business", city, state].filter(Boolean).join(" "),
    [keyword, "business", city, state].filter(Boolean).join(" "),
    [baseBusinessTerm, locationLabel].filter(Boolean).join(" in "),
    [baseBusinessTerm, city, state].filter(Boolean).join(" "),
  ];

  if (!category && keyword) {
    queryVariants.push([keyword, "small business", city, state].filter(Boolean).join(" "));
  }
  if (category && !keyword) {
    queryVariants.push([category, "near", city || zip, state].filter(Boolean).join(" "));
  }

  const clean = new Set<string>();
  for (const q of queryVariants) {
    const value = q.trim().replace(/\s+/g, " ");
    if (!value) continue;
    if (value.length <= 2) continue;
    clean.add(value);
  }

  return Array.from(clean);
}

function matchesNichePreset(rec: GooglePlaceRecord, presetKey?: keyof typeof NICHE_PRESETS): boolean {
  const preset = NICHE_PRESETS[presetKey ?? "auto"] ?? NICHE_PRESETS.auto;
  if (preset === NICHE_PRESETS.auto) return true;
  const types = ((rec.rawPlace.types as string[] | undefined) ?? []).map(t => t.toLowerCase());
  const hay = `${rec.businessName} ${rec.category} ${types.join(" ")}`.toLowerCase();
  if (preset.excludeTypes.some(t => types.includes(t) || hay.includes(t.replace(/_/g, " ")))) return false;
  if (preset.includeTypes.length === 0) return true;
  return preset.includeTypes.some(t => types.includes(t) || hay.includes(t.replace(/_/g, " ")));
}

function looksLikeChain(rec: GooglePlaceRecord): boolean {
  return CHAIN_NAME_PATTERNS.some(rx => rx.test(rec.businessName));
}

function looksLikeNonBusiness(rec: GooglePlaceRecord, requestedState?: string, requestedZip?: string): boolean {
  const name = rec.businessName.trim().toLowerCase();
  if (!name || name === "unknown") return true;
  if (/^\d{5}(?:-\d{4})?$/.test(name)) return true;
  if (NOISE_TERMS.has(name)) return true;
  if (name === (requestedZip ?? "").trim().toLowerCase()) return true;
  if (requestedState && name === requestedState.trim().toLowerCase()) return true;
  if (/^(detroit|michigan|mi)$/i.test(rec.businessName.trim())) return true;
  if (!rec.city && !rec.formattedAddress) return true;
  if (looksLikeChain(rec)) return true;
  return false;
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

export async function geocodeZipToLatLng(zip: string): Promise<{ latitude: number; longitude: number } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const z = zip.trim();
  if (!apiKey || !z) return null;
  const u = new URL(GEOCODE_URL);
  u.searchParams.set("address", z);
  u.searchParams.set("key", apiKey);
  const res = await fetchWithTimeout(u.toString(), { method: "GET" }, 12_000).catch(() => null);
  if (!res?.ok) return null;
  const json = (await res.json()) as {
    status?: string;
    results?: { geometry?: { location?: { lat?: number; lng?: number } } }[];
  };
  const loc = json.results?.[0]?.geometry?.location;
  const lat = loc?.lat;
  const lng = loc?.lng;
  if (typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng };
  }
  return null;
}

export async function getGooglePlaceDetails(placeId: string): Promise<GooglePlaceRecord | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }
  const idEnc = encodeURIComponent(placeIdForDetailPath(placeId));
  const res = await fetchWithTimeout(
    `${PLACES_DETAIL_URL}/${idEnc}`,
    {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": DETAIL_FIELD_MASK,
      },
    },
    15_000
  );
  if (!res.ok) return null;
  const json = (await res.json()) as Record<string, unknown>;
  return mapPlaceToRecord(json);
}

export type GooglePlacesSearchInput = {
  nichePreset?: keyof typeof NICHE_PRESETS;
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

  const queries = buildTextQueries(input);
  if (queries.length === 0) {
    throw new Error("Google Places search requires category or keyword context");
  }

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

  const collected: GooglePlaceRecord[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    let pageToken: string | undefined;
    for (;;) {
      const body: Record<string, unknown> = {
        textQuery: query,
        pageSize: 20,
        ...(locationBias ? { locationBias } : {}),
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
        if (looksLikeNonBusiness(rec, input.state, input.zip)) continue;
        if (!matchesNichePreset(rec, input.nichePreset)) continue;
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
    if (collected.length >= want) break;
  }

  const records = collected.slice(0, want);

  /** Optional: fetch Place Details when website/phone missing (extra billable call). */
  const needDetails = records.filter(r => (!r.website || !r.phone) && r.placeId);
  const enriched = new Map<string, GooglePlaceRecord>();
  for (const r of records) enriched.set(r.placeId, r);

  for (const r of needDetails) {
    const idEnc = encodeURIComponent(placeIdForDetailPath(r.placeId));
    const dRes = await fetchWithTimeout(
      `${PLACES_DETAIL_URL}/${idEnc}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": DETAIL_FIELD_MASK,
        },
      },
      15_000
    ).catch(() => null);

    if (!dRes?.ok) continue;
    try {
      const detail = (await dRes.json()) as Record<string, unknown>;
      const merged = mapPlaceToRecord(detail);
      if (looksLikeNonBusiness(merged, input.state, input.zip)) continue;
      if (!matchesNichePreset(merged, input.nichePreset)) continue;
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

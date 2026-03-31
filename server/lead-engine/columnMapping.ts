import { stripControlChars } from "./normalizeLeadFields";

const BUSINESS_KEYS = [
  "business_name",
  "business name",
  "business",
  "company",
  "name",
  "title",
  "store name",
  "establishment",
];
const PHONE_KEYS = ["phone", "phone number", "telephone", "tel", "mobile", "cell"];
const EMAIL_KEYS = ["email", "e-mail", "email address"];
const WEBSITE_KEYS = ["website", "url", "web", "domain", "site", "homepage"];
const CATEGORY_KEYS = ["category", "niche", "type", "industry", "vertical"];
const OWNER_KEYS = ["owner_name", "owner name", "owner", "decision maker"];
const CITY_KEYS = ["city", "town"];
const STATE_KEYS = ["state", "province", "region"];
const ZIP_KEYS = ["zip", "zip code", "postal", "postal code"];
const ADDRESS_KEYS = ["address", "address_1", "address 1", "street", "location"];
const SOURCE_KEYS = ["source", "lead source", "origin"];

export type CsvMappedLead = {
  businessName: string;
  phone: string;
  email: string;
  website: string;
  category: string;
  ownerName: string;
  city: string;
  state: string;
  zip: string;
  address: string;
  source: string;
};

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "") return stripControlChars(String(v));
  }
  return "";
}

export function mapCsvRowToLeadInput(row: Record<string, string>, defaultSource: string): CsvMappedLead {
  const businessName = pick(row, BUSINESS_KEYS);
  return {
    businessName,
    phone: pick(row, PHONE_KEYS),
    email: pick(row, EMAIL_KEYS),
    website: pick(row, WEBSITE_KEYS),
    category: pick(row, CATEGORY_KEYS) || "Unknown",
    ownerName: pick(row, OWNER_KEYS),
    city: pick(row, CITY_KEYS),
    state: pick(row, STATE_KEYS),
    zip: pick(row, ZIP_KEYS),
    address: pick(row, ADDRESS_KEYS),
    source: pick(row, SOURCE_KEYS) || defaultSource,
  };
}

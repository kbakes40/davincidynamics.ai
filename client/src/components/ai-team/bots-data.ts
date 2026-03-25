export const BOT_IDS = [
  "nova",
  "vinci",
  "leo",
  "atlas",
  "aegis",
  "forge",
  "vector",
  "kernel",
  "patch",
  "relay",
  "orbit",
] as const;

export type BotId = (typeof BOT_IDS)[number];

/** Card / modal accent: Growth=violet·blue, Revenue=cyan|mint (Leo), Ops=emerald·teal, Engineering=orange|indigo */
export type VisualAccent = "violet" | "cyan" | "mint" | "emerald" | "orange" | "indigo";

export const BOT_VISUAL_ACCENTS: Record<BotId, VisualAccent> = {
  nova: "violet",
  vinci: "cyan",
  leo: "mint",
  atlas: "emerald",
  aegis: "emerald",
  forge: "orange",
  vector: "orange",
  kernel: "indigo",
  patch: "orange",
  relay: "indigo",
  orbit: "indigo",
};

export type FilterId = "all" | "growth" | "customer-facing" | "operations" | "engineering";

export interface Bot {
  id: BotId;
  name: string;
  role: string;
  personality: string;
  statusLabel: string;
  filterCategory: Exclude<FilterId, "all">;
  shortDescription: string;
  systemFunction: string;
  connectedWith: BotId[];
  modalCta?: { label: string; href: string };
  /** Public URL under client/public, or a Vite-resolved ?url import (content-hashed in production). */
  mascotSrc?: string;
}

export const BOTS: Bot[] = [
  {
    id: "nova",
    name: "Nova",
    role: "Growth & Marketing Intelligence",
    personality: "Predictive, strategic, and built to turn attention into revenue.",
    statusLabel: "Optimizing",
    filterCategory: "growth",
    shortDescription:
      "Shapes positioning, demand, and narrative so the funnel starts warmer and sharper.",
    systemFunction:
      "Generates demand, sharpens offers, and improves the quality of leads entering the system.",
    connectedWith: ["vinci"],
    mascotSrc: "/ai-team/nova-icon.png?v=11",
  },
  {
    id: "vinci",
    name: "Vinci",
    role: "Lead Capture Specialist (@VinciDynamicsBot)",
    personality: "Smooth, sharp, and always moving the conversation forward.",
    statusLabel: "Routing",
    filterCategory: "customer-facing",
    shortDescription: "First live touchpoint for inbound traffic—structured, fast, and human-grade.",
    systemFunction: "Captures, qualifies, and prepares incoming leads for the next step.",
    connectedWith: ["atlas", "leo"],
    modalCta: { label: "Open Vinci", href: "https://t.me/VinciDynamicsBot?start=home" },
    mascotSrc: "/ai-team/vinci-icon.png?v=2",
  },
  {
    id: "leo",
    name: "Leo",
    role: "Follow-Up Coordinator (@Leo_Handoff_Bot)",
    personality: "Reliable, precise, and always following through.",
    statusLabel: "FOLLOW UP",
    filterCategory: "customer-facing",
    shortDescription:
      "Direct, professional, and focused on closing the loop. Owns handoff context—making follow-up decisive instead of improvised.",
    systemFunction: "Receives lead context and supports personal follow-up and closing.",
    connectedWith: ["vinci", "atlas"],
    modalCta: { label: "Open Leo", href: "https://t.me/Leo_Handoff_Bot" },
    mascotSrc: "/ai-team/leo-icon.png?v=8",
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Operations Assistant",
    personality: "Organized, efficient, and always one step ahead.",
    statusLabel: "Monitoring",
    filterCategory: "operations",
    shortDescription: "Keeps pipeline truth visible so nothing slips between systems or people.",
    systemFunction: "Tracks internal movement across leads, tasks, and workflow status.",
    connectedWith: ["vinci", "leo", "forge", "relay"],
    mascotSrc: "/ai-team/atlas-icon.png?v=2",
  },
  {
    id: "aegis",
    name: "Aegis",
    role: "Security & Compliance",
    personality: "Quiet, vigilant, and built to protect everything.",
    statusLabel: "Secured",
    filterCategory: "operations",
    shortDescription: "The governance layer—validation, integrity, and guardrails at the edge.",
    systemFunction:
      "Validates inputs, protects infrastructure, and enforces system integrity.",
    connectedWith: ["forge", "kernel", "orbit"],
    mascotSrc: "/ai-team/aegis-icon.png?v=4",
  },
  {
    id: "forge",
    name: "Forge",
    role: "Full Stack Engineer",
    personality: "Builds fast, thinks in systems, and executes clean.",
    statusLabel: "Building",
    filterCategory: "engineering",
    shortDescription: "Turns requirements into durable software paths the business can rely on.",
    systemFunction: "Builds tools, systems, and automation infrastructure.",
    connectedWith: ["atlas", "relay", "kernel", "vector", "patch"],
    mascotSrc: "/ai-team/forge-icon.png?v=10",
  },
  {
    id: "vector",
    name: "Vector",
    role: "Frontend Engineer",
    personality: "Polished, precise, and obsessed with clean design.",
    statusLabel: "Polishing",
    filterCategory: "engineering",
    shortDescription:
      "Crafts interfaces that feel inevitable—precise motion, spacing, and hierarchy.",
    systemFunction: "Designs polished frontend experiences and interface systems.",
    connectedWith: ["forge", "patch"],
    mascotSrc: "/ai-team/vector-icon.png?v=2",
  },
  {
    id: "kernel",
    name: "Kernel",
    role: "Backend Engineer",
    personality: "Logical, stable, and handles the core infrastructure.",
    statusLabel: "Processing",
    filterCategory: "engineering",
    shortDescription: "Holds the truth for state, data contracts, and core services.",
    systemFunction: "Handles core logic, APIs, state, and database infrastructure.",
    connectedWith: ["forge", "relay", "orbit", "aegis"],
    mascotSrc: "/ai-team/kernel-icon.png?v=2",
  },
  {
    id: "patch",
    name: "Patch",
    role: "QA & Debug Specialist",
    personality: "Finds problems fast and fixes them faster.",
    statusLabel: "Debugging",
    filterCategory: "engineering",
    shortDescription: "Stress-tests reality paths before customers ever feel the edge cases.",
    systemFunction: "Tests flows, catches issues, and keeps the experience stable.",
    connectedWith: ["forge", "vector"],
    mascotSrc: "/ai-team/patch-icon.png?v=2",
  },
  {
    id: "relay",
    name: "Relay",
    role: "Integrations Engineer",
    personality: "Connects everything seamlessly behind the scenes.",
    statusLabel: "Syncing",
    filterCategory: "engineering",
    shortDescription: "The connective tissue between bots, APIs, and external systems.",
    systemFunction: "Connects bots, APIs, webhooks, and outside systems.",
    connectedWith: ["nova", "vinci", "atlas", "forge", "kernel", "orbit", "leo"],
    mascotSrc: "/ai-team/relay-icon.png?v=2",
  },
  {
    id: "orbit",
    name: "Orbit",
    role: "DevOps & Deployment",
    personality: "Keeps systems running, scaling, and always online.",
    statusLabel: "Deploying",
    filterCategory: "engineering",
    shortDescription: "Production posture—uptime, releases, and operational readiness.",
    systemFunction: "Manages deployment, uptime, and production readiness.",
    connectedWith: ["relay", "kernel", "aegis"],
    mascotSrc: "/ai-team/orbit-icon.png?v=2",
  },
];

export const BOT_BY_ID: Record<BotId, Bot> = BOTS.reduce(
  (acc, b) => {
    acc[b.id] = b;
    return acc;
  },
  {} as Record<BotId, Bot>
);

/** Primary pipeline shown in the flow section */
export const FLOW_STEP_IDS: BotId[] = ["nova", "vinci", "atlas", "forge", "relay", "leo"];

export const FLOW_STEP_COPY: Partial<Record<BotId, string>> = {
  nova: "Attracts and sharpens demand before it reaches the funnel.",
  vinci: "Captures and qualifies incoming leads.",
  atlas: "Keeps internal movement organized and visible.",
  forge: "Builds the systems and tools that power delivery.",
  relay: "Connects the moving pieces into one working machine.",
  leo: "Prepares the final context for real follow-up.",
};

export interface SystemLayer {
  id: string;
  title: string;
  explanation: string;
  botIds: BotId[];
}

export const SYSTEM_LAYERS: SystemLayer[] = [
  {
    id: "growth",
    title: "Growth Layer",
    explanation:
      "Sharpens messaging, offers, and demand before leads ever enter the system.",
    botIds: ["nova"],
  },
  {
    id: "revenue",
    title: "Revenue Layer",
    explanation: "Captures, qualifies, and moves conversations toward real outcomes.",
    botIds: ["vinci", "leo"],
  },
  {
    id: "operations",
    title: "Operations Layer",
    explanation: "Keeps workflows organized, protected, and moving cleanly.",
    botIds: ["atlas", "aegis"],
  },
  {
    id: "engineering",
    title: "Engineering Layer",
    explanation:
      "Builds, connects, tests, and deploys the infrastructure behind the system.",
    botIds: ["forge", "vector", "kernel", "patch", "relay", "orbit"],
  },
];

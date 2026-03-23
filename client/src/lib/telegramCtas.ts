/** Vinci (@VinciDynamicsBot) deep links — must match server/vinci-start.ts ALLOWED tokens. */
import type { MouseEvent } from "react";

export const TG = {
  home: "https://t.me/VinciDynamicsBot?start=home",
  pricing: "https://t.me/VinciDynamicsBot?start=pricing",
  demo: "https://t.me/VinciDynamicsBot?start=demo",
  solutions: "https://t.me/VinciDynamicsBot?start=solutions",
  about: "https://t.me/VinciDynamicsBot?start=about",
  contact: "https://t.me/VinciDynamicsBot?start=contact",
  audit: "https://t.me/VinciDynamicsBot?start=audit",
  ads: "https://t.me/VinciDynamicsBot?start=ads",
} as const;

export type TelegramStartParam = keyof typeof TG;

const OPEN_DEBOUNCE_MS = 750;
let lastOpenUrl: string | null = null;
let lastOpenAt = 0;

/**
 * Opens Vinci in a new tab. Debounces identical URLs to avoid double windows
 * (double-clicks, rare duplicate synthetic events).
 */
export function openVinciBot(start: TelegramStartParam) {
  const url = TG[start];
  const now = Date.now();
  if (lastOpenUrl === url && now - lastOpenAt < OPEN_DEBOUNCE_MS) {
    return;
  }
  lastOpenUrl = url;
  lastOpenAt = now;
  window.open(url, "_blank", "noopener,noreferrer");
}

const clickHandlerCache = new Map<
  TelegramStartParam,
  (e: MouseEvent<HTMLElement>) => void
>();

/**
 * Single navigation path per click: preventDefault/stopPropagation + one debounced open.
 * Use as the sole handler on Button (type="button"); do not also set href on the same control.
 */
export function onTelegramCta(start: TelegramStartParam) {
  let handler = clickHandlerCache.get(start);
  if (!handler) {
    handler = (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      openVinciBot(start);
    };
    clickHandlerCache.set(start, handler);
  }
  return handler;
}

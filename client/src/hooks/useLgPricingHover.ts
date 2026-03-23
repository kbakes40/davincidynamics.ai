import { useState } from "react";

/** Tracks Growth-card hover for side-card dimming; only active at lg+ (pricing row layout). */
export function useLgPricingHover() {
  const [growthHovered, setGrowthHovered] = useState(false);
  const lgQuery = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;
  return {
    growthHovered,
    onGrowthEnter: () => {
      if (lgQuery()) setGrowthHovered(true);
    },
    onGrowthLeave: () => setGrowthHovered(false),
  };
}

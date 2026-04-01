import type { Express, Request, Response } from "express";
import { getTrafficData } from "./getTrafficData";
import type { TrafficDateRange } from "./types";

const VALID_RANGES: TrafficDateRange[] = ["last7", "last30", "last90", "ytd"];

function parseRange(raw: unknown): TrafficDateRange {
  if (typeof raw === "string" && VALID_RANGES.includes(raw as TrafficDateRange)) {
    return raw as TrafficDateRange;
  }
  return "last30";
}

export function registerTrafficRoutes(app: Express): void {
  app.get("/api/backend/traffic", async (req: Request, res: Response) => {
    const range = parseRange(req.query?.range);
    const result = await getTrafficData(range);
    res.json(result);
  });
}

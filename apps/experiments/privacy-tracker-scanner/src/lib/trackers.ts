import { TRACKERS } from "../constants/trackers";
import type { TrackerDefinition, TrackerInfo } from "../types/scan";

/** Most specific (longest) matching tracker suffix wins, e.g. connect.facebook.net over facebook.net. */
export function classifyHost(
  host: string,
  trackers: TrackerDefinition[] = TRACKERS
): TrackerInfo | null {
  const normalized = host.toLowerCase();
  let best: TrackerDefinition | null = null;
  for (const tracker of trackers) {
    const matches = normalized === tracker.domain || normalized.endsWith(`.${tracker.domain}`);
    if (matches && (!best || tracker.domain.length > best.domain.length)) best = tracker;
  }
  return best ? { name: best.name, category: best.category } : null;
}

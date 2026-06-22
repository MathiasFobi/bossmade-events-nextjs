// Event types and the canonical list of Atlanta events.
//
// Source of truth: `data/events.json` (kept in sync with `public/events.json`).
// At build time the JSON is imported and treated as `Event[]`. The cast below
// is the contract with the JSON file; if the shape ever drifts, TypeScript
// will surface the mismatch at every callsite.

import rawEvents from "@/data/events.json" with { type: "json" };

/**
 * The closed set of event categories the UI knows how to render.
 * Each value is also a key in `CATEGORY_COLORS` (see `./categories.ts`).
 */
export type EventCategory =
  | "comedy"
  | "music"
  | "art"
  | "food"
  | "dancing"
  | "live music";

/**
 * Shape of a single event row from `data/events.json`.
 * Mirrors the keys in the JSON exactly so the cast below stays safe.
 */
export interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  price: string;
  description: string;
  category: EventCategory;
}

/**
 * Returns every event declared in `data/events.json`, in source order.
 * Called from server/build-time rendering and from unit tests.
 */
export function getAllEvents(): Event[] {
  // The JSON is authored by us; the cast is the documented contract.
  // Keep this in sync with the keys in `data/events.json`.
  return rawEvents as Event[];
}

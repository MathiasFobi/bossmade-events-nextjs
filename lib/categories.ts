// Per-category neon styling for the glassmorphic UI.
//
// Each entry in `CATEGORY_COLORS` carries:
//   - `hex`:    the raw CSS color (used for inline styles / SVG / CSS vars)
//   - `twText`: Tailwind text-color class
//   - `twBg`:   Tailwind background-color class (with alpha)
//   - `twBorder`: Tailwind border-color class (with alpha)
//   - `label`:  human-friendly capitalized label for the UI
//
// The Tailwind class strings use the built-in v4 palette (cyan, pink, purple,
// amber for "gold", emerald, slate). v4 picks these up automatically; no
// `tailwind.config.*` needed.

import type { EventCategory } from "./events";

export interface CategoryColor {
  /** Raw CSS color (e.g. "#06b6d4") */
  hex: string;
  /** Tailwind text-color class */
  twText: string;
  /** Tailwind background-color class (with alpha) */
  twBg: string;
  /** Tailwind border-color class (with alpha) */
  twBorder: string;
  /** Human-friendly label */
  label: string;
}

/**
 * The full lookup of category → neon styling. Values are chosen to mirror the
 * reference glassmorphic HTML: comedy is cyan, music is pink, art is purple,
 * food is gold/amber, dancing is emerald, and "live music" shares music's
 * pink slot (the design treats them as the same neon family).
 */
export const CATEGORY_COLORS: Record<EventCategory, CategoryColor> = {
  comedy: {
    hex: "#06b6d4",
    twText: "text-cyan-300",
    twBg: "bg-cyan-500/20",
    twBorder: "border-cyan-500/20",
    label: "Comedy",
  },
  music: {
    hex: "#ec4899",
    twText: "text-pink-300",
    twBg: "bg-pink-500/20",
    twBorder: "border-pink-500/20",
    label: "Music",
  },
  "live music": {
    // "live music" is a category alias for music in the design — same pink slot.
    hex: "#ec4899",
    twText: "text-pink-300",
    twBg: "bg-pink-500/20",
    twBorder: "border-pink-500/20",
    label: "Live Music",
  },
  art: {
    hex: "#a855f7",
    twText: "text-purple-300",
    twBg: "bg-purple-500/20",
    twBorder: "border-purple-500/20",
    label: "Art",
  },
  food: {
    // "gold" in the design = Tailwind's amber-500.
    hex: "#f59e0b",
    twText: "text-amber-300",
    twBg: "bg-amber-500/20",
    twBorder: "border-amber-500/20",
    label: "Food",
  },
  dancing: {
    hex: "#10b981",
    twText: "text-emerald-300",
    twBg: "bg-emerald-500/20",
    twBorder: "border-emerald-500/20",
    label: "Dancing",
  },
};

/** Safe fallback for unknown / malformed categories. */
const DEFAULT_CATEGORY_COLOR: CategoryColor = {
  hex: "#94a3b8", // slate-400
  twText: "text-slate-300",
  twBg: "bg-slate-500/20",
  twBorder: "border-slate-500/20",
  label: "Event",
};

/**
 * Returns the neon styling for a category. Falls back to a slate default if
 * the category isn't in the lookup, so component code never has to special-case
 * bad data.
 */
export function categoryColor(c: EventCategory): CategoryColor {
  return CATEGORY_COLORS[c] ?? DEFAULT_CATEGORY_COLOR;
}

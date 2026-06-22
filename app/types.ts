export type EventCategory =
  | "live music"
  | "comedy"
  | "art"
  | "dancing"
  | "vegetarian"
  | "festival"
  | "date idea";

export type BossEvent = {
  title: string;
  date: string; // ISO date (YYYY-MM-DD) or human-friendly string
  time?: string;
  location: string;
  price?: string;
  description: string;
  category: EventCategory;
};

/** Map a category to its accent color and label used throughout the UI. */
export const CATEGORY_STYLES: Record<
  EventCategory,
  {
    /** Pill + chip border color (Tailwind class) */
    accent: string;
    /** Soft pill background (Tailwind class) */
    softBg: string;
    /** Soft text color (Tailwind class) */
    text: string;
    /** Hero glow / hover ring (CSS variable name) */
    glow: string;
    /** Emoji fallback */
    emoji: string;
  }
> = {
  "live music": {
    accent: "border-neon-pink/40",
    softBg: "bg-neon-pink/10",
    text: "text-neon-pink",
    glow: "rgba(236, 72, 153, 0.35)",
    emoji: "🎵",
  },
  comedy: {
    accent: "border-neon-cyan/40",
    softBg: "bg-neon-cyan/10",
    text: "text-neon-cyan",
    glow: "rgba(6, 182, 212, 0.35)",
    emoji: "😂",
  },
  art: {
    accent: "border-neon-purple/40",
    softBg: "bg-neon-purple/10",
    text: "text-neon-purple",
    glow: "rgba(168, 85, 247, 0.35)",
    emoji: "🎨",
  },
  dancing: {
    accent: "border-neon-rose/40",
    softBg: "bg-neon-rose/10",
    text: "text-neon-rose",
    glow: "rgba(251, 113, 133, 0.35)",
    emoji: "💃",
  },
  vegetarian: {
    accent: "border-neon-emerald/40",
    softBg: "bg-neon-emerald/10",
    text: "text-neon-emerald",
    glow: "rgba(16, 185, 129, 0.35)",
    emoji: "🌱",
  },
  festival: {
    accent: "border-neon-gold/40",
    softBg: "bg-neon-gold/10",
    text: "text-neon-gold",
    glow: "rgba(251, 191, 36, 0.35)",
    emoji: "🎪",
  },
  "date idea": {
    accent: "border-neon-cyan/40",
    softBg: "bg-neon-cyan/10",
    text: "text-neon-cyan",
    glow: "rgba(6, 182, 212, 0.35)",
    emoji: "✨",
  },
};

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  "live music": "Live Music",
  comedy: "Comedy",
  art: "Art",
  dancing: "Dancing",
  vegetarian: "Veg / Food",
  festival: "Festival",
  "date idea": "Date Idea",
};

export const CATEGORY_ORDER: EventCategory[] = [
  "live music",
  "comedy",
  "art",
  "dancing",
  "vegetarian",
  "festival",
  "date idea",
];

export type EventCategoryCount = {
  category: EventCategory;
  count: number;
};

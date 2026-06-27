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
  /** Optional external link for tickets, info, or RSVP */
  url?: string;
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
    glow: "rgba(219, 39, 119, 0.28)",
    emoji: "🎵",
  },
  comedy: {
    accent: "border-neon-cyan/40",
    softBg: "bg-neon-cyan/10",
    text: "text-neon-cyan",
    glow: "rgba(8, 145, 178, 0.28)",
    emoji: "😂",
  },
  art: {
    accent: "border-neon-purple/40",
    softBg: "bg-neon-purple/10",
    text: "text-neon-purple",
    glow: "rgba(147, 51, 234, 0.28)",
    emoji: "🎨",
  },
  dancing: {
    accent: "border-neon-rose/40",
    softBg: "bg-neon-rose/10",
    text: "text-neon-rose",
    glow: "rgba(225, 29, 72, 0.28)",
    emoji: "💃",
  },
  vegetarian: {
    accent: "border-neon-emerald/40",
    softBg: "bg-neon-emerald/10",
    text: "text-neon-emerald",
    glow: "rgba(5, 150, 105, 0.28)",
    emoji: "🌱",
  },
  festival: {
    accent: "border-neon-gold/40",
    softBg: "bg-neon-gold/10",
    text: "text-neon-gold",
    glow: "rgba(217, 119, 6, 0.28)",
    emoji: "🎪",
  },
  "date idea": {
    accent: "border-neon-cyan/40",
    softBg: "bg-neon-cyan/10",
    text: "text-neon-cyan",
    glow: "rgba(8, 145, 178, 0.28)",
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

// =============================================================
// Stock Briefs (consolidated daily brief: markets + news + options)
// =============================================================

export type MarketTicker = {
  symbol: string; // "S&P 500", "BTC", "10Y", etc.
  label?: string; // optional short tag like "Futures"
  value: string; // "5,432.10"
  change: string; // "+0.42%" or "-12 bps"
  direction: "up" | "down" | "flat";
};

export type NewsItem = {
  headline: string;
  context: string; // one-line "why it matters"
  url?: string;
  tag?: string; // "Fed", "Earnings", "Macro", etc.
};

export type OptionsPick = {
  symbol: string; // QQQ, SPY, TSLA, NVDA…
  thesis: string; // 1–2 sentences
  signal: string; // "Unusual call activity", "IV crush setup", etc.
};

export type SentimentTone = "bullish" | "bearish" | "neutral" | "mixed";

export type EquityMover = {
  symbol: string; // "AAPL", "NVDA"
  change: string; // "-6.20%"
  direction: "up" | "down";
  reason: string; // one-line catalyst
};

export type SectorTick = {
  /** SPDR sector ETF ticker: XLK, XLF, XLE, XLV, XLY, XLP, XLI, XLU, XLB, XLRE, XLC */
  symbol: string;
  /** Human label, e.g. "Tech", "Energy" */
  label: string;
  /** Formatted % change: "+0.82%" or "-1.15%" */
  change: string;
  direction: "up" | "down" | "flat";
};

export type StockBrief = {
  /** ISO date (YYYY-MM-DD) for the trading day this brief covers */
  date: string;
  /** Pre-market or close summary, e.g. "Pre-market — Tue, Jun 24" */
  asOf: string;
  /** Overall market tone in one line */
  headline: string;
  /** One-word tape tone — drives the big chip at the top */
  sentiment: {
    tone: SentimentTone;
    /** Optional score from -1 (max bearish) to +1 (max bullish), 2 decimals */
    score?: number;
    /** Optional one-line reason for the tone */
    reason?: string;
  };
  /** Market snapshot section */
  market: MarketTicker[];
  /** News flow section */
  news: NewsItem[];
  /** Options watch section */
  options: OptionsPick[];
  /** Top 3 single-name equity movers that day (the actionable bit) */
  movers: EquityMover[];
  /** 11 SPDR sectors with % change — scannable heat row */
  sectorHeat: SectorTick[];
  /** Optional bottom-line takeaway */
  takeaway?: string;
  /** Generated timestamp (ISO) for cache busting */
  generatedAt: string;
};

/** Visual accent for brief sections */
export const SECTION_STYLES = {
  market: {
    accent: "border-neon-cyan/40",
    softBg: "bg-neon-cyan/10",
    text: "text-neon-cyan",
    emoji: "🌍",
  },
  news: {
    accent: "border-neon-purple/40",
    softBg: "bg-neon-purple/10",
    text: "text-neon-purple",
    emoji: "📰",
  },
  options: {
    accent: "border-neon-gold/40",
    softBg: "bg-neon-gold/10",
    text: "text-neon-gold",
    emoji: "🎯",
  },
  movers: {
    accent: "border-neon-pink/40",
    softBg: "bg-neon-pink/10",
    text: "text-neon-pink",
    emoji: "🚀",
  },
  sectors: {
    accent: "border-neon-emerald/40",
    softBg: "bg-neon-emerald/10",
    text: "text-neon-emerald",
    emoji: "🔥",
  },
} as const;

export type BriefSection = keyof typeof SECTION_STYLES;

/** Sentiment chip styling */
export const SENTIMENT_STYLES: Record<
  SentimentTone,
  { label: string; emoji: string; chip: string; ring: string }
> = {
  bullish: {
    label: "Bullish",
    emoji: "🐂",
    chip: "bg-neon-emerald/15 text-neon-emerald border-neon-emerald/40",
    ring: "ring-neon-emerald/30",
  },
  bearish: {
    label: "Bearish",
    emoji: "🐻",
    chip: "bg-neon-rose/15 text-neon-rose border-neon-rose/40",
    ring: "ring-neon-rose/30",
  },
  neutral: {
    label: "Neutral",
    emoji: "⚖️",
    chip: "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40",
    ring: "ring-neon-cyan/30",
  },
  mixed: {
    label: "Mixed",
    emoji: "🔀",
    chip: "bg-neon-gold/15 text-neon-gold border-neon-gold/40",
    ring: "ring-neon-gold/30",
  },
};

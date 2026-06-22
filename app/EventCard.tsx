"use client";

import { BossEvent, CATEGORY_LABEL, CATEGORY_STYLES } from "./types";

type Props = {
  event: BossEvent;
  onSelect: (event: BossEvent) => void;
  /** Animation delay in ms (for staggered entrance) */
  delay?: number;
};

export default function EventCard({ event, onSelect, delay = 0 }: Props) {
  const style = CATEGORY_STYLES[event.category] ?? CATEGORY_STYLES["date idea"];

  // Format date for display (works for both YYYY-MM-DD and human strings)
  let dateLabel = event.date;
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
      const d = new Date(event.date + "T00:00:00");
      if (!isNaN(d.getTime())) {
        dateLabel = d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }
    }
  } catch {
    /* keep original */
  }

  return (
    <article
      onClick={() => onSelect(event)}
      className="glass-card p-6 sm:p-7 relative overflow-hidden cursor-pointer group animate-fade-up"
      style={{
        animationDelay: `${delay}ms`,
        // Per-category glow on hover
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--tw-shadow" as any]: `0 0 60px -10px ${style.glow}`,
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(event);
        }
      }}
    >
      {/* Per-category accent sweep on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${style.glow.replace("0.35", "0.06")} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${style.accent} ${style.softBg} ${style.text}`}
          >
            {style.emoji} {CATEGORY_LABEL[event.category]}
          </span>
          {event.price && (
            <span className="text-[11px] text-text-muted font-mono">
              {event.price}
            </span>
          )}
        </div>

        <h3 className="font-display font-bold text-xl sm:text-2xl text-text-primary leading-tight group-hover:text-text-primary transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1 text-sm text-text-tertiary">
          {dateLabel && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">📅</span>
              <span>
                {dateLabel}
                {event.time ? ` · ${event.time}` : ""}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-start gap-1.5">
              <span className="text-base mt-0.5">📍</span>
              <span className="line-clamp-2">{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed mt-1">
            {event.description}
          </p>
        )}

        <div className="mt-2 flex items-center justify-end">
          <span
            className={`text-xs font-semibold ${style.text} opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            View details →
          </span>
        </div>
      </div>
    </article>
  );
}

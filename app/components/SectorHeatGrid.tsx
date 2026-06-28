// Reusable sector heat grid for the briefs page and the events homepage strip.
// Reads SectorTick[] and renders a configurable column count.

import type { SectorTick } from "../types";

export function SectorHeatGrid({
  sectors,
  cols = "grid-cols-3 sm:grid-cols-4",
  compact = false,
}: {
  sectors: SectorTick[];
  cols?: string;
  compact?: boolean;
}) {
  return (
    <div className={`grid ${cols} ${compact ? "gap-1" : "gap-1.5"}`}>
      {sectors.map((s) => (
        <div
          key={s.symbol}
          className={`flex flex-col items-center justify-center rounded-lg border text-center ${
            compact ? "px-1.5 py-1.5" : "px-2 py-2"
          } ${
            s.direction === "up"
              ? "border-neon-emerald/30 bg-neon-emerald/8"
              : s.direction === "down"
                ? "border-neon-rose/30 bg-neon-rose/8"
                : "border-border-glass bg-bg-glass"
          }`}
        >
          <span className="text-[9px] uppercase tracking-wider text-text-muted font-mono leading-none">
            {s.symbol}
          </span>
          {!compact && (
            <span className="text-[10px] text-text-secondary font-medium mt-0.5 truncate max-w-full">
              {s.label}
            </span>
          )}
          <span
            className={`font-mono font-bold tabular-nums mt-1 ${
              compact ? "text-[10px]" : "text-[11px]"
            } ${
              s.direction === "up"
                ? "text-neon-emerald"
                : s.direction === "down"
                  ? "text-neon-rose"
                  : "text-text-muted"
            }`}
          >
            {s.direction === "up" ? "▲" : s.direction === "down" ? "▼" : "—"}{" "}
            {s.change}
          </span>
        </div>
      ))}
    </div>
  );
}
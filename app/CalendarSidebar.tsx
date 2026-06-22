"use client";

import { useMemo } from "react";
import { BossEvent } from "./types";

type Props = {
  events: BossEvent[];
  /** Currently selected date filter (YYYY-MM-DD) or null = no filter */
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
};

/** Mini calendar for the current month, with event markers on relevant days. */
export default function CalendarSidebar({ events, selectedDate, onSelectDate }: Props) {
  // Use the first event's month as the anchor (or current month)
  const today = new Date();
  const anchor = useMemo(() => {
    if (events[0] && /^\d{4}-\d{2}-\d{2}$/.test(events[0].date)) {
      const d = new Date(events[0].date + "T00:00:00");
      if (!isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  }, [events, today]);

  // Build a set of "YYYY-MM-DD" strings from events
  const eventDates = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(e.date)) set.add(e.date);
    }
    return set;
  }, [events]);

  // Build the month grid
  const monthLabel = new Date(anchor.year, anchor.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstWeekday = new Date(anchor.year, anchor.month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(anchor.year, anchor.month + 1, 0).getDate();

  const todayStr = today.toISOString().slice(0, 10);

  const cells: Array<{ key: string; day?: number }> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ key: `pad-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: `d-${d}`, day: d });
  }

  const dayToDate = (d: number) =>
    `${anchor.year}-${String(anchor.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <aside className="glass-panel p-5 sm:p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-text-primary text-base">{monthLabel}</h2>
        <button
          type="button"
          onClick={() => onSelectDate(null)}
          className={`pill px-3 py-1.5 text-[11px] font-semibold ${
            selectedDate === null ? "pill-active" : "text-text-secondary"
          }`}
        >
          All
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] uppercase tracking-wider text-text-muted font-mono py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell) => {
          if (cell.day === undefined) {
            return <div key={cell.key} className="calendar-day opacity-0 pointer-events-none" />;
          }
          const dateStr = dayToDate(cell.day);
          const hasEvent = eventDates.has(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              type="button"
              key={cell.key}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              aria-label={dateStr}
              className={`calendar-day ${
                isToday ? "calendar-day-today" : ""
              } ${hasEvent ? "calendar-day-has-event" : ""} ${
                isSelected ? "!ring-2 ring-neon-cyan !bg-neon-cyan/20" : ""
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-border-glass">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Showing</span>
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="text-xs text-neon-cyan hover:underline"
            >
              Clear filter
            </button>
          </div>
          <div className="text-sm text-text-primary mt-1 font-medium">{selectedDate}</div>
        </div>
      )}
    </aside>
  );
}

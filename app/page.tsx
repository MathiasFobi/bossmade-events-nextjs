"use client";

import { useMemo, useState } from "react";
import events from "@/data/events.json";
import type { BossEvent, EventCategory } from "./types";
import { CATEGORY_LABEL, CATEGORY_ORDER, CATEGORY_STYLES } from "./types";
import EventCard from "./EventCard";
import EventModal from "./EventModal";
import CalendarSidebar from "./CalendarSidebar";

// Cast imported JSON to our typed array
const allEvents = events as unknown as BossEvent[];

const TODAY = new Date().toISOString().slice(0, 10);

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set()
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openEvent, setOpenEvent] = useState<BossEvent | null>(null);

  // Compute category counts (over the full set, not filtered)
  const categoryCounts = useMemo(() => {
    const counts = new Map<EventCategory, number>();
    for (const e of allEvents) {
      counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    }
    return CATEGORY_ORDER.map((c) => ({
      category: c,
      count: counts.get(c) ?? 0,
    })).filter((c) => c.count > 0);
  }, []);

  // Toggle a category on/off
  const toggleCategory = (c: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEvents.filter((e) => {
      // Category filter (multi-select)
      if (activeCategories.size > 0 && !activeCategories.has(e.category)) return false;
      // Date filter
      if (selectedDate && e.date !== selectedDate) return false;
      // Text search
      if (q) {
        const hay = `${e.title} ${e.description} ${e.category} ${e.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, activeCategories, selectedDate]);

  // Sort events chronologically when possible
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const ad = /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : "9999-99-99";
      const bd = /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : "9999-99-99";
      return ad.localeCompare(bd);
    });
  }, [filteredEvents]);

  const hasFilters =
    query.trim().length > 0 || activeCategories.size > 0 || selectedDate !== null;

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-12 max-w-7xl mx-auto w-full">
      {/* ───────────────────────── Header ───────────────────────── */}
      <header className="mb-8 sm:mb-10 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl sm:text-4xl">⚡️</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            <span className="shimmer-text">Boss Made</span>
          </h1>
        </div>
        <p className="text-text-secondary text-base sm:text-lg max-w-2xl">
          Atlanta's Gen-Z couples date-night digest. Live music, comedy, art,
          dancing, and plant-based food — curated every week, fresh in your
          pocket.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-text-muted">
          <span className="px-2.5 py-1 rounded-md border border-border-glass bg-bg-glass">
            {allEvents.length} curated picks
          </span>
          <span className="px-2.5 py-1 rounded-md border border-border-glass bg-bg-glass">
            Updated weekly
          </span>
          <span className="px-2.5 py-1 rounded-md border border-border-glass bg-bg-glass">
            {TODAY}
          </span>
        </div>
      </header>

      {/* ───────────────────────── Search ───────────────────────── */}
      <section
        className="mb-6 animate-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, vibes, or locations..."
            className="glass-input w-full pl-14 pr-5 py-4 rounded-2xl text-sm placeholder:text-text-muted text-text-primary font-medium"
            aria-label="Search events"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-4 flex items-center text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* ──────────────────── Category pills ──────────────────── */}
      <section
        className="mb-8 animate-fade-up"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveCategories(new Set())}
            className={`pill px-5 py-2.5 text-xs font-semibold ${
              activeCategories.size === 0
                ? "pill-active"
                : "text-text-secondary"
            }`}
          >
            All <span className="ml-1 text-[10px] text-text-muted font-black">{allEvents.length}</span>
          </button>
          {categoryCounts.map(({ category, count }) => {
            const isActive = activeCategories.has(category);
            const style = CATEGORY_STYLES[category];
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`pill px-5 py-2.5 text-xs font-semibold ${
                  isActive ? "pill-active" : "text-text-secondary"
                }`}
              >
                <span className="mr-1">{style.emoji}</span>
                {CATEGORY_LABEL[category]}{" "}
                <span className="ml-1 text-[10px] text-text-muted font-black">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ──────────────────── Main grid ──────────────────── */}
      <div
        className="grid lg:grid-cols-12 gap-6 animate-fade-up"
        style={{ animationDelay: "180ms" }}
      >
        {/* Calendar sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <CalendarSidebar
            events={allEvents}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Feed */}
        <section className="lg:col-span-8 xl:col-span-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary">
              {sortedEvents.length === allEvents.length
                ? "This week's picks"
                : `${sortedEvents.length} of ${allEvents.length} picks`}
            </h2>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategories(new Set());
                  setSelectedDate(null);
                }}
                className="text-xs text-neon-cyan hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {sortedEvents.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-text-secondary font-medium">
                No events match your filters yet.
              </p>
              <p className="text-text-muted text-sm mt-1">
                Try clearing a category or simplifying your search.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {sortedEvents.map((event, idx) => (
                <EventCard
                  key={`${event.title}-${event.date}-${idx}`}
                  event={event}
                  onSelect={setOpenEvent}
                  delay={Math.min(idx * 60, 600)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-border-glass text-center text-text-muted text-xs">
        <p>
          ⚡️ Boss Made · Curated Atlanta date nights · Built with{" "}
          <span className="text-neon-cyan">Next.js</span>,{" "}
          <span className="text-neon-purple">Tailwind</span>, and a lot of
          late-night scrolling.
        </p>
        <p className="mt-2 font-mono text-[10px] opacity-70">
          v1.0 · Glassmorphic Edition
        </p>
      </footer>

      {/* Modal */}
      <EventModal event={openEvent} onClose={() => setOpenEvent(null)} />
    </main>
  );
}

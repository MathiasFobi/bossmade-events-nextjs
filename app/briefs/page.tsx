"use client";

import { useMemo, useState } from "react";
import briefs from "@/data/briefs.json";
import type { BriefSection, StockBrief } from "../types";
import { SECTION_STYLES } from "../types";

const allBriefs = briefs as unknown as StockBrief[];

const TODAY = new Date().toISOString().slice(0, 10);

export default function BriefsPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    allBriefs[0]?.date ?? null
  );

  // Sort briefs newest first
  const sortedBriefs = useMemo(
    () => [...allBriefs].sort((a, b) => b.date.localeCompare(a.date)),
    []
  );

  const activeBrief =
    sortedBriefs.find((b) => b.date === selectedDate) ?? sortedBriefs[0];

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 sm:py-12 max-w-7xl mx-auto w-full">
      {/* ───────────────────────── Header ───────────────────────── */}
      <header className="mb-8 sm:mb-10 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl sm:text-4xl">📈</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            <span className="shimmer-text">Stock Briefs</span>
          </h1>
        </div>
        <p className="text-text-secondary text-base sm:text-lg max-w-2xl">
          Daily morning brief — market snapshot, news flow, and options watch.
          One consolidated read, no Telegram scroll required.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-text-muted">
          <span className="px-2.5 py-1 rounded-md border border-border-glass bg-bg-glass">
            {allBriefs.length} briefs on file
          </span>
          <span className="px-2.5 py-1 rounded-md border border-border-glass bg-bg-glass">
            Updated daily · 9am ET
          </span>
          <span className="px-2.5 py-1 rounded-md border border-border-glass bg-bg-glass">
            {TODAY}
          </span>
          <a
            href="/"
            className="px-2.5 py-1 rounded-md border border-border-glass bg-bg-glass hover:bg-bg-glass-hover transition"
          >
            ← Back to Events
          </a>
        </div>
      </header>

      {/* ──────────────────── Date rail ──────────────────── */}
      <section
        className="mb-8 animate-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className={`pill px-5 py-2.5 text-xs font-semibold ${
              selectedDate === null ? "pill-active" : "text-text-secondary"
            }`}
          >
            Latest
          </button>
          {sortedBriefs.map((b) => {
            const isActive = b.date === activeBrief?.date;
            return (
              <button
                key={b.date}
                type="button"
                onClick={() => setSelectedDate(b.date)}
                className={`pill px-5 py-2.5 text-xs font-semibold ${
                  isActive ? "pill-active" : "text-text-secondary"
                }`}
              >
                {b.date}
              </button>
            );
          })}
        </div>
      </section>

      {activeBrief ? (
        <BriefView brief={activeBrief} />
      ) : (
        <div className="glass-card p-10 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-text-secondary font-medium">No briefs yet.</p>
          <p className="text-text-muted text-sm mt-1">
            The first brief will land after tomorrow's 9am cron runs.
          </p>
        </div>
      )}
    </main>
  );
}

function BriefView({ brief }: { brief: StockBrief }) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
      {/* Brief meta */}
      <div className="glass-panel p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary">
              {brief.headline}
            </h2>
            <p className="text-text-muted text-xs font-mono mt-1">
              {brief.asOf} · generated{" "}
              {new Date(brief.generatedAt).toLocaleString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <BriefSectionCard section="market" brief={brief} />
        <BriefSectionCard section="news" brief={brief} />
        <BriefSectionCard section="options" brief={brief} />
      </div>

      {brief.takeaway && (
        <div
          className="glass-panel p-5 sm:p-6 mt-6 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡️</span>
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-text-muted mb-1">
                Bottom line
              </h3>
              <p className="text-text-primary text-base leading-relaxed">
                {brief.takeaway}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BriefSectionCard({
  section,
  brief,
}: {
  section: BriefSection;
  brief: StockBrief;
}) {
  const style = SECTION_STYLES[section];

  return (
    <section
      className={`glass-card p-5 sm:p-6 lg:col-span-4 border ${style.accent} animate-fade-up`}
      style={{ animationDelay: "180ms" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{style.emoji}</span>
        <h3
          className={`font-display font-bold text-base uppercase tracking-wider ${style.text}`}
        >
          {section === "market"
            ? "Market Snapshot"
            : section === "news"
              ? "News Flow"
              : "Options Watch"}
        </h3>
      </div>

      {section === "market" && (
        <ul className="space-y-2">
          {brief.market.map((t) => (
            <li
              key={t.symbol}
              className="flex items-center justify-between gap-3 py-2 border-b border-border-glass last:border-0"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-sm text-text-primary">
                  {t.symbol}
                </span>
                {t.label && (
                  <span className="text-[10px] uppercase tracking-wider text-text-muted">
                    {t.label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-3 text-right">
                <span className="font-mono text-sm text-text-secondary">
                  {t.value}
                </span>
                <span
                  className={`font-mono text-xs font-bold min-w-[4.5rem] text-right ${
                    t.direction === "up"
                      ? "text-neon-emerald"
                      : t.direction === "down"
                        ? "text-neon-rose"
                        : "text-text-muted"
                  }`}
                >
                  {t.direction === "up" ? "▲ " : t.direction === "down" ? "▼ " : "— "}
                  {t.change}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {section === "news" && (
        <ul className="space-y-3">
          {brief.news.map((n, i) => (
            <li key={i} className="pb-3 border-b border-border-glass last:border-0">
              <div className="flex items-start gap-2 mb-1">
                {n.tag && (
                  <span
                    className={`pill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.softBg} ${style.text}`}
                  >
                    {n.tag}
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm text-text-primary leading-snug">
                {n.url ? (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neon-cyan transition"
                  >
                    {n.headline}
                  </a>
                ) : (
                  n.headline
                )}
              </p>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {n.context}
              </p>
            </li>
          ))}
        </ul>
      )}

      {section === "options" && (
        <ul className="space-y-3">
          {brief.options.map((o) => (
            <li
              key={o.symbol}
              className="pb-3 border-b border-border-glass last:border-0"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-base text-text-primary">
                  {o.symbol}
                </span>
                <span
                  className={`pill px-2 py-0.5 text-[10px] font-bold ${style.softBg} ${style.text}`}
                >
                  {o.signal}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {o.thesis}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
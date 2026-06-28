"use client";

import { useMemo, useState } from "react";
import briefs from "@/data/briefs.json";
import type {
  BriefSection,
  SentimentTone,
  StockBrief,
} from "../types";
import { SENTIMENT_STYLES, SECTION_STYLES } from "../types";
import { SectorHeatGrid } from "../components/SectorHeatGrid";

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
        <div className="relative -mx-4 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto pb-2 px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory">
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className={`pill px-5 py-2.5 text-xs font-semibold whitespace-nowrap snap-start ${
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
                className={`pill px-5 py-2.5 text-xs font-semibold whitespace-nowrap snap-start ${
                  isActive ? "pill-active" : "text-text-secondary"
                }`}
              >
                {b.date}
              </button>
            );
          })}
          </div>
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
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-text-primary min-w-0 flex-1">
            {brief.headline}
          </h2>
          <SentimentChip
            tone={brief.sentiment.tone}
            score={brief.sentiment.score}
            reason={brief.sentiment.reason}
          />
        </div>
        <p className="text-text-muted text-xs font-mono">
          {brief.asOf} · generated{" "}
          {new Date(brief.generatedAt).toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          })}
        </p>
        {brief.sentiment.reason && (
          <p className="text-text-secondary text-sm mt-2 italic">
            {brief.sentiment.reason}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <BriefSectionCard section="market" brief={brief} />
        <BriefSectionCard section="movers" brief={brief} />
        <BriefSectionCard section="news" brief={brief} />
        <BriefSectionCard section="options" brief={brief} />
      </div>

      <div className="mt-6">
        <BriefSectionCard section="sectors" brief={brief} />
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
      className={`glass-card p-5 sm:p-6 lg:col-span-4 border ${style.accent} animate-fade-up min-w-0 overflow-hidden`}
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
              : section === "options"
                ? "Options Watch"
                : section === "movers"
                  ? "Top Movers"
                  : "Sector Heat"}
        </h3>
      </div>

            {section === "market" && (
        <ul className="space-y-1">
          {brief.market.map((t) => (
            <li
              key={t.symbol}
              className="flex flex-col gap-1 py-2.5 border-b border-border-glass last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="flex items-baseline gap-2 min-w-0 shrink">
                <span className="font-mono font-bold text-sm text-text-primary">
                  {t.symbol}
                </span>
                {t.label && (
                  <span className="text-[10px] uppercase tracking-wider text-text-muted truncate">
                    {t.label}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between gap-3 sm:justify-end shrink-0">
                <span className="font-mono text-sm text-text-secondary tabular-nums">
                  {t.value}
                </span>
                <span
                  className={`font-mono text-xs font-bold tabular-nums min-w-[5rem] text-right ${
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

      {section === "movers" && (
        <ul className="space-y-3">
          {brief.movers.map((m) => (
            <li
              key={m.symbol}
              className="pb-3 border-b border-border-glass last:border-0"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-mono font-bold text-base text-text-primary">
                  {m.symbol}
                </span>
                <span
                  className={`font-mono text-sm font-bold tabular-nums ${
                    m.direction === "up"
                      ? "text-neon-emerald"
                      : "text-neon-rose"
                  }`}
                >
                  {m.direction === "up" ? "▲ " : "▼ "}
                  {m.change}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {m.reason}
              </p>
            </li>
          ))}
        </ul>
      )}

      {section === "sectors" && (
        <SectorHeatGrid
          sectors={brief.sectorHeat}
          cols="grid-cols-3 sm:grid-cols-4"
        />
      )}
    </section>
  );
}

function SentimentChip({
  tone,
  score,
  reason,
}: {
  tone: SentimentTone;
  score?: number;
  reason?: string;
}) {
  const s = SENTIMENT_STYLES[tone];
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${s.chip} ring-1 ${s.ring}`}
    >
      <span className="text-base leading-none">{s.emoji}</span>
      <span className="font-display font-bold text-sm uppercase tracking-wider">
        {s.label}
      </span>
      {typeof score === "number" && (
        <span className="font-mono text-xs tabular-nums opacity-80">
          {score > 0 ? "+" : ""}
          {score.toFixed(2)}
        </span>
      )}
    </div>
  );
}
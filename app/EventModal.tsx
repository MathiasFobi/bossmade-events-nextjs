"use client";

import { useEffect, useState } from "react";
import { BossEvent, CATEGORY_LABEL, CATEGORY_STYLES } from "./types";

type Props = {
  event: BossEvent | null;
  onClose: () => void;
};

/**
 * Build an ICS-format string for an event so the user can download a
 * calendar entry. Times are left as floating (no timezone) — most calendar
 * apps treat them as local.
 */
function buildIcs(event: BossEvent): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(event.date) ? event.date : "";
  // Naive time parsing: try to extract HH:MM from the human time string.
  const timeMatch = (event.time ?? "").match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  let startDateTime = date;
  let endDateTime = date;
  if (date && timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = timeMatch[2];
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === "pm" && h < 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    const hh = String(h).padStart(2, "0");
    // Default 2-hour duration if no end time given
    const endH = String((h + 2) % 24).padStart(2, "0");
    startDateTime = `${date}T${hh}${m}00`;
    endDateTime = `${date}T${endH}${m}00`;
  } else if (date) {
    startDateTime = date.replace(/-/g, "");
    endDateTime = date.replace(/-/g, "");
  }
  const fmt = (s: string) =>
    s.replace(/[-:]/g, "").replace("T", "T").replace(/(\d{8})T?(\d{6})?/, "$1T$2");

  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BossMade//Date Night//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@bossmade.events`,
    `DTSTAMP:${fmt(`${date || "20260101"}T000000`)}`,
    `DTSTART:${fmt(startDateTime)}`,
    `DTEND:${fmt(endDateTime)}`,
    `SUMMARY:${escape(event.title)}`,
    event.location ? `LOCATION:${escape(event.location)}` : "",
    event.description ? `DESCRIPTION:${escape(event.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export default function EventModal({ event, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [icsCopied, setIcsCopied] = useState(false);

  // Open animation: trigger fade-up shortly after mount
  useEffect(() => {
    if (event) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [event]);

  // ESC key closes the modal
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [event, onClose]);

  // Reset "Copied" toast when event changes
  useEffect(() => {
    setIcsCopied(false);
  }, [event]);

  if (!mounted || !event) return null;
  const style = CATEGORY_STYLES[event.category] ?? CATEGORY_STYLES["date idea"];

  // Format date for display
  let dateLabel = event.date;
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
      const d = new Date(event.date + "T00:00:00");
      if (!isNaN(d.getTime())) {
        dateLabel = d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
    }
  } catch {
    /* keep original */
  }

  const handleAddToCalendar = () => {
    const ics = buildIcs(event);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Filename: title slug + date
    const safeTitle = event.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
    const datePart = /^\d{4}-\d{2}-\d{2}$/.test(event.date) ? event.date : "event";
    a.download = `${safeTitle || "event"}-${datePart}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setIcsCopied(true);
    setTimeout(() => setIcsCopied(false), 2400);
  };

  const hasUrl = !!event.url;

  return (
    <div
      className={`modal-backdrop transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className={`modal-panel transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero / banner area with category glow */}
        <div
          className="relative h-44 sm:h-56 overflow-hidden rounded-t-2xl"
          style={{
            background: `linear-gradient(135deg, ${style.glow} 0%, rgba(255,255,255,0.4) 60%, rgba(247,246,243,0.95) 100%)`,
          }}
        >
          {/* Decorative pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 80% 30%, ${style.glow} 0%, transparent 50%)`,
            }}
          />
          <div className="absolute top-5 left-5">
            <span
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${style.accent} ${style.softBg} ${style.text} backdrop-blur-md`}
            >
              {style.emoji} {CATEGORY_LABEL[event.category]}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative">
          <h2
            id="event-modal-title"
            className="font-display font-bold text-2xl sm:text-3xl text-text-primary leading-tight mb-4"
          >
            {event.title}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
            {dateLabel && (
              <div className="glass-panel p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                  When
                </div>
                <div className="text-text-primary font-medium">{dateLabel}</div>
                {event.time && (
                  <div className="text-text-tertiary text-xs mt-0.5">{event.time}</div>
                )}
              </div>
            )}
            {event.price && (
              <div className="glass-panel p-3.5">
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                  Cost
                </div>
                <div className="text-text-primary font-medium">{event.price}</div>
              </div>
            )}
            {event.location && (
              <div className="glass-panel p-3.5 sm:col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 font-mono">
                  Where
                </div>
                <div className="text-text-primary">{event.location}</div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mb-6">
              <h3 className="text-[11px] uppercase tracking-wider text-text-muted font-mono mb-2">
                About this date
              </h3>
              <p className="text-text-secondary leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Action buttons row */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="pill px-5 py-3 text-sm font-semibold text-text-secondary sm:flex-none"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleAddToCalendar}
              className={`pill px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2 sm:flex-1 border ${style.accent} ${style.softBg} ${style.text}`}
              aria-label="Download .ics file to add to your calendar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" />
                <line x1="10" y1="16" x2="14" y2="16" />
              </svg>
              {icsCopied ? "Downloaded ✓" : "Add to Calendar"}
            </button>
            {hasUrl && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`pill px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2 sm:flex-1 border-2 ${style.accent} ${style.softBg} ${style.text} hover:scale-[1.02] transition-transform`}
                aria-label={`Open event URL for ${event.title} in a new tab`}
              >
                Get Tickets / Info
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

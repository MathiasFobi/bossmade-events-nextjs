"use client";

import { useEffect, useState } from "react";
import { BossEvent, CATEGORY_LABEL, CATEGORY_STYLES } from "./types";

type Props = {
  event: BossEvent | null;
  onClose: () => void;
};

export default function EventModal({ event, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

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

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="pill px-6 py-3 text-sm font-semibold text-text-secondary flex-1"
            >
              Close
            </button>
            <button
              type="button"
              className={`pill px-6 py-3 text-sm font-semibold flex-1 border-2 ${style.accent} ${style.softBg} ${style.text}`}
              onClick={() => {
                // Stub checkout / RSVP — Vercel-friendly no-op
                window.print();
              }}
            >
              Save / Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Unit tests for `lib/categories.ts` (US-002).
//
// Run with:   node --test lib/__tests__/categories.test.ts
//
// These tests are intentionally self-contained — they do not boot the dev
// server, do not import Next.js, and do not load `lib/events.ts` (which
// uses the `@/data/events.json` path alias and therefore needs the alias
// resolver hook to run in a bare `node --test` invocation). Instead, the
// test reads `data/events.json` directly via `node:fs` and exercises
// `lib/categories.ts` (which has no JSON dependency). This keeps the bare
// `node --test lib/__tests__/categories.test.ts` invocation (AC #7) green.
//
// `lib/events.ts` itself is type-checked by `npm run typecheck`, which
// validates the `getAllEvents()` contract at compile time.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { CATEGORY_COLORS, categoryColor } from "../categories.ts";
import type { EventCategory } from "../events.ts";

// Resolve project root relative to this file (lib/__tests__/… → ../..).
const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..", "..");
const eventsJsonPath = resolve(projectRoot, "data", "events.json");

interface RawEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  price: string;
  description: string;
  category: string;
}

function loadEvents(): RawEvent[] {
  const raw = readFileSync(eventsJsonPath, "utf8");
  return JSON.parse(raw) as RawEvent[];
}

test("CATEGORY_COLORS has entries for all 6 EventCategory values", () => {
  const required: EventCategory[] = [
    "comedy",
    "music",
    "art",
    "food",
    "dancing",
    "live music",
  ];
  for (const c of required) {
    assert.ok(
      CATEGORY_COLORS[c],
      `CATEGORY_COLORS missing entry for "${c}"`,
    );
  }
});

test("every CATEGORY_COLORS entry has non-empty styling fields", () => {
  for (const [key, entry] of Object.entries(CATEGORY_COLORS)) {
    assert.ok(entry.hex && entry.hex.length > 0, `${key}.hex is empty`);
    assert.ok(entry.twText && entry.twText.length > 0, `${key}.twText is empty`);
    assert.ok(entry.twBg && entry.twBg.length > 0, `${key}.twBg is empty`);
    assert.ok(
      entry.twBorder && entry.twBorder.length > 0,
      `${key}.twBorder is empty`,
    );
    assert.ok(entry.label && entry.label.length > 0, `${key}.label is empty`);
  }
});

test("categoryColor('comedy').hex === '#06b6d4' (cyan)", () => {
  assert.equal(categoryColor("comedy").hex, "#06b6d4");
});

test("categoryColor('music').hex === '#ec4899' (pink)", () => {
  assert.equal(categoryColor("music").hex, "#ec4899");
});

test("categoryColor('art').hex === '#a855f7' (purple)", () => {
  assert.equal(categoryColor("art").hex, "#a855f7");
});

test("categoryColor('food').hex === '#f59e0b' (gold/amber)", () => {
  assert.equal(categoryColor("food").hex, "#f59e0b");
});

test("all distinct categories in data/events.json have a CATEGORY_COLORS entry", () => {
  // The JSON may not yet cover every category in the union, but every
  // category that DOES appear in the data must be styled.
  const seen = new Set<EventCategory>();
  for (const e of loadEvents()) {
    seen.add(e.category as EventCategory);
  }
  assert.ok(seen.size > 0, "events.json appears to be empty");
  for (const c of seen) {
    assert.ok(
      CATEGORY_COLORS[c],
      `category "${c}" appears in events.json but has no CATEGORY_COLORS entry`,
    );
  }
});

test("data/events.json contains at least 13 events (matches getAllEvents() contract)", () => {
  const events = loadEvents();
  assert.equal(Array.isArray(events), true, "events.json should be an array");
  assert.ok(
    events.length >= 13,
    `expected at least 13 events, got ${events.length}`,
  );
});

test("every event in data/events.json has the required keys with non-empty string values", () => {
  const requiredKeys: (keyof RawEvent)[] = [
    "title",
    "date",
    "time",
    "location",
    "price",
    "description",
    "category",
  ];
  for (const e of loadEvents()) {
    for (const k of requiredKeys) {
      assert.equal(
        typeof e[k],
        "string",
        `event "${e.title}" is missing or non-string field "${k}"`,
      );
      assert.ok(
        (e[k] as string).length > 0,
        `event "${e.title}" has empty "${k}"`,
      );
    }
  }
});

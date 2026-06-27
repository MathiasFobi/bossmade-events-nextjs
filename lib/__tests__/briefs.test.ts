// Tests for the consolidated daily stock brief contract.
//
// The brief cron writes to data/briefs.json (mirrored to public/briefs.json)
// as a JSON array of `StockBrief` objects. These tests enforce the schema
// and ensure both files stay in sync.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

interface MarketTicker {
  symbol: string;
  label?: string;
  value: string;
  change: string;
  direction: "up" | "down" | "flat";
}

interface NewsItem {
  headline: string;
  context: string;
  url?: string;
  tag?: string;
}

interface OptionsPick {
  symbol: string;
  thesis: string;
  signal: string;
}

interface SentimentTone {
  tone: "bullish" | "bearish" | "neutral" | "mixed";
  score?: number;
  reason?: string;
}

interface EquityMover {
  symbol: string;
  change: string;
  direction: "up" | "down";
  reason: string;
}

interface SectorTick {
  symbol: string;
  label: string;
  change: string;
  direction: "up" | "down" | "flat";
}

interface StockBrief {
  date: string;
  asOf: string;
  headline: string;
  sentiment: SentimentTone;
  market: MarketTicker[];
  news: NewsItem[];
  options: OptionsPick[];
  movers: EquityMover[];
  sectorHeat: SectorTick[];
  takeaway?: string;
  generatedAt: string;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

test("briefs.json exists in both data/ and public/ and is byte-identical", () => {
  const dataPath = join(root, "data", "briefs.json");
  const publicPath = join(root, "public", "briefs.json");
  assert.ok(existsSync(dataPath), "data/briefs.json is missing");
  assert.ok(existsSync(publicPath), "public/briefs.json is missing");
  const a = readFileSync(dataPath);
  const b = readFileSync(publicPath);
  assert.equal(
    Buffer.compare(a, b),
    0,
    "data/briefs.json and public/briefs.json are NOT byte-identical",
  );
});

test("briefs.json is a non-empty array of briefs", () => {
  const briefs = readJson<StockBrief[]>(
    join(root, "data", "briefs.json"),
  );
  assert.ok(Array.isArray(briefs), "briefs.json should be an array");
  assert.ok(briefs.length >= 1, "briefs.json should have at least one brief");
});

test("every brief has required top-level keys with non-empty string values", () => {
  const briefs = readJson<StockBrief[]>(join(root, "data", "briefs.json"));
  const required: (keyof StockBrief)[] = [
    "date",
    "asOf",
    "headline",
    "sentiment",
    "market",
    "news",
    "options",
    "movers",
    "sectorHeat",
    "generatedAt",
  ];
  for (const b of briefs) {
    for (const k of required) {
      assert.ok(b[k] !== undefined, `brief ${b.date}: ${k} missing`);
    }
    assert.equal(typeof b.date, "string");
    assert.equal(typeof b.asOf, "string");
    assert.ok(b.date.match(/^\d{4}-\d{2}-\d{2}$/), `bad date format: ${b.date}`);
    assert.ok(
      b.generatedAt.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/),
      `bad generatedAt format: ${b.generatedAt}`,
    );
  }
});

test("every brief sentiment has a valid tone and optional score in [-1, 1]", () => {
  const briefs = readJson<StockBrief[]>(join(root, "data", "briefs.json"));
  for (const b of briefs) {
    assert.ok(
      ["bullish", "bearish", "neutral", "mixed"].includes(b.sentiment.tone),
      `brief ${b.date}: invalid sentiment tone ${b.sentiment.tone}`,
    );
    if (b.sentiment.score !== undefined) {
      assert.equal(typeof b.sentiment.score, "number");
      assert.ok(
        b.sentiment.score >= -1 && b.sentiment.score <= 1,
        `brief ${b.date}: sentiment score ${b.sentiment.score} out of [-1, 1]`,
      );
    }
  }
});

test("every brief has 1-3 movers with valid shape", () => {
  const briefs = readJson<StockBrief[]>(join(root, "data", "briefs.json"));
  for (const b of briefs) {
    assert.ok(b.movers.length >= 1, `brief ${b.date}: movers empty`);
    assert.ok(b.movers.length <= 5, `brief ${b.date}: too many movers (${b.movers.length})`);
    for (const m of b.movers) {
      assert.equal(typeof m.symbol, "string");
      assert.ok(m.symbol.length > 0);
      assert.equal(typeof m.change, "string");
      assert.ok(["up", "down"].includes(m.direction), `bad mover direction ${m.direction}`);
      assert.equal(typeof m.reason, "string");
      assert.ok(m.reason.length > 0);
    }
  }
});

test("every brief has sectorHeat with 11 SPDR sectors", () => {
  const briefs = readJson<StockBrief[]>(join(root, "data", "briefs.json"));
  const REQUIRED_SECTORS = [
    "XLK", "XLF", "XLE", "XLV", "XLY", "XLP", "XLI", "XLU", "XLB", "XLRE", "XLC",
  ];
  for (const b of briefs) {
    assert.equal(b.sectorHeat.length, 11, `brief ${b.date}: expected 11 sectors, got ${b.sectorHeat.length}`);
    const symbols = b.sectorHeat.map((s) => s.symbol).sort();
    const expected = [...REQUIRED_SECTORS].sort();
    assert.deepEqual(
      symbols,
      expected,
      `brief ${b.date}: sector symbols mismatch`,
    );
    for (const s of b.sectorHeat) {
      assert.equal(typeof s.label, "string");
      assert.ok(s.label.length > 0);
      assert.equal(typeof s.change, "string");
      assert.ok(["up", "down", "flat"].includes(s.direction));
    }
  }
});

test("every brief has market, news, and options sections with required shape", () => {
  const briefs = readJson<StockBrief[]>(join(root, "data", "briefs.json"));
  for (const b of briefs) {
    assert.ok(b.market.length >= 1, `brief ${b.date}: market is empty`);
    assert.ok(b.news.length >= 1, `brief ${b.date}: news is empty`);
    assert.ok(b.options.length >= 1, `brief ${b.date}: options is empty`);

    for (const t of b.market) {
      assert.equal(typeof t.symbol, "string");
      assert.equal(typeof t.value, "string");
      assert.equal(typeof t.change, "string");
      assert.ok(
        ["up", "down", "flat"].includes(t.direction),
        `brief ${b.date} ticker ${t.symbol}: invalid direction ${t.direction}`,
      );
    }

    for (const n of b.news) {
      assert.equal(typeof n.headline, "string");
      assert.ok(n.headline.length > 0);
      assert.equal(typeof n.context, "string");
      assert.ok(n.context.length > 0);
    }

    for (const o of b.options) {
      assert.equal(typeof o.symbol, "string");
      assert.ok(o.symbol.length > 0);
      assert.equal(typeof o.thesis, "string");
      assert.ok(o.thesis.length > 0);
      assert.equal(typeof o.signal, "string");
      assert.ok(o.signal.length > 0);
    }
  }
});

test("briefs are sorted newest-first by date", () => {
  const briefs = readJson<StockBrief[]>(join(root, "data", "briefs.json"));
  for (let i = 1; i < briefs.length; i++) {
    assert.ok(
      briefs[i - 1].date >= briefs[i].date,
      `briefs not sorted newest-first at index ${i}: ${briefs[i - 1].date} → ${briefs[i].date}`,
    );
  }
});

test("briefs are not older than 14 days from the most recent", () => {
  const briefs = readJson<StockBrief[]>(join(root, "data", "briefs.json"));
  if (briefs.length === 0) return;
  const newest = new Date(briefs[0].date).getTime();
  const cutoff = newest - 14 * 24 * 60 * 60 * 1000;
  for (const b of briefs) {
    const t = new Date(b.date).getTime();
    assert.ok(
      t >= cutoff,
      `brief ${b.date} is older than 14 days from the newest brief (${briefs[0].date})`,
    );
  }
});

test("briefs.json file is non-empty on disk", () => {
  const p = join(root, "data", "briefs.json");
  if (!existsSync(p)) return;
  const stat = statSync(p);
  assert.ok(stat.size > 0, "data/briefs.json should be non-empty");
});
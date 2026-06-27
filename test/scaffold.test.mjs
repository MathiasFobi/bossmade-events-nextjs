// Scaffold tests for US-001
// Verifies the Next.js project scaffold is correctly set up:
//   - required config files exist
//   - next.config.ts has output: 'export' and images.unoptimized: true
//   - events.json data is present in both data/ and public/ and has 13 entries
//   - out/ directory contains a built index.html after a build (best-effort)
//
// These tests are run with `node --test test`. They do not boot the dev server
// or Next.js itself — they're just a fast gate that the scaffold invariants
// required by US-001 hold.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

function exists(p) {
  return existsSync(p);
}

function readPkg() {
  const raw = readFileSync(join(root, "package.json"), "utf8");
  return JSON.parse(raw);
}

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

test("package.json declares the required dependencies", () => {
  const pkg = readPkg();
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  // Semver ranges are fine for our purposes — just require the keys to exist
  // and parse to versions >= the minimum the story asks for.
  function gte(dep, min) {
    assert.ok(deps[dep], `dependency ${dep} is not declared in package.json`);
    const major = parseInt(String(deps[dep]).replace(/^[^0-9]/, ""), 10);
    assert.ok(
      Number.isFinite(major) && major >= min,
      `expected ${dep} >= ${min}.0.0, got ${deps[dep]}`,
    );
  }

  gte("next", 14);
  gte("react", 18);
  gte("react-dom", 18);
  gte("typescript", 5);
  assert.ok(deps["tailwindcss"], "tailwindcss is not declared");
  assert.ok(deps["@types/node"], "@types/node is not declared");
  assert.ok(deps["@types/react"], "@types/react is not declared");
  assert.ok(deps["@types/react-dom"], "@types/react-dom is not declared");
});

test("package.json declares the required scripts", () => {
  const pkg = readPkg();
  for (const s of ["dev", "build", "start", "typecheck"]) {
    assert.ok(pkg.scripts[s], `script "${s}" is not declared in package.json`);
  }
  // typecheck should run tsc --noEmit
  assert.match(pkg.scripts.typecheck, /tsc\s+--noEmit/);
});

test("next.config has output: 'export' and unoptimized images", () => {
  const cfgPath = join(root, "next.config.ts");
  assert.ok(exists(cfgPath), "next.config.ts is missing");
  const src = readFileSync(cfgPath, "utf8");
  assert.match(src, /output:\s*["']export["']/);
  assert.match(src, /unoptimized:\s*true/);
});

test("tsconfig, postcss config, tailwind setup all exist", () => {
  assert.ok(exists(join(root, "tsconfig.json")), "tsconfig.json missing");
  assert.ok(exists(join(root, "postcss.config.mjs")), "postcss.config.mjs missing");
  // Tailwind v4 is wired through @tailwindcss/postcss in postcss.config
  const postcss = readFileSync(join(root, "postcss.config.mjs"), "utf8");
  assert.match(postcss, /@tailwindcss\/postcss/);
  // globals.css should @import "tailwindcss"
  assert.ok(exists(join(root, "app", "globals.css")), "app/globals.css missing");
  const css = readFileSync(join(root, "app", "globals.css"), "utf8");
  assert.match(css, /@import\s+["']tailwindcss["']/);
});

test("app router scaffold is in place", () => {
  assert.ok(exists(join(root, "app")), "app/ directory missing");
  assert.ok(exists(join(root, "app", "layout.tsx")), "app/layout.tsx missing");
  assert.ok(exists(join(root, "app", "page.tsx")), "app/page.tsx missing");
});

test("events.json exists in both data/ and public/ and is byte-identical", () => {
  const dataPath = join(root, "data", "events.json");
  const publicPath = join(root, "public", "events.json");
  assert.ok(exists(dataPath), "data/events.json is missing");
  assert.ok(exists(publicPath), "public/events.json is missing");

  const a = readFileSync(dataPath);
  const b = readFileSync(publicPath);
  assert.equal(
    Buffer.compare(a, b),
    0,
    "data/events.json and public/events.json are NOT byte-identical",
  );

  const events = readJson(dataPath);
  assert.ok(Array.isArray(events), "events.json is not an array");
  assert.ok(events.length >= 13, `expected at least 13 events, got ${events.length}`);

  // Sanity: every event should have the keys the story describes.
  for (const ev of events) {
    for (const k of [
      "title",
      "date",
      "time",
      "location",
      "price",
      "description",
      "category",
    ]) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(ev, k),
        `event "${ev?.title ?? "?"}" is missing key "${k}"`,
      );
    }
  }
});

test(".gitignore covers node_modules, .next, and out", () => {
  const gi = readFileSync(join(root, ".gitignore"), "utf8");
  for (const needle of ["node_modules", ".next", "out/"]) {
    assert.ok(
      gi.includes(needle),
      `.gitignore is missing expected entry: ${needle}`,
    );
  }
});

test("out/ contains a built index.html (post-build artifact)", () => {
  // This is a best-effort check — if a developer hasn't run `npm run build`
  // yet, the artifact may be missing. We skip instead of failing so the
  // scaffold tests still pass in a fresh checkout.
  const indexHtml = join(root, "out", "index.html");
  if (!exists(indexHtml)) {
    return; // skip
  }
  const stat = statSync(indexHtml);
  assert.ok(stat.isFile(), "out/index.html should be a file");
  assert.ok(stat.size > 0, "out/index.html should be non-empty");
});

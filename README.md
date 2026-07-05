# Boss Made Events

> ⚠️ **Note:** this directory is still named `bossmade-events-nextjs` on
> disk and on GitHub, but **this IS the canonical Boss Made Events site**
> (the older static HTML version was archived to
> `archive/bossmade-events-static` on 2026-07-04). The repo name on
> GitHub and the Vercel project are still `bossmade-events-nextjs`
> because renaming would break deploys. Treat the directory name as
> legacy and the project itself as just "Boss Made Events".

A glassmorphic events site for Atlanta, built with Next.js (app router),
TypeScript, and Tailwind v4. Configured for **static export** so it can
be hosted as a flat bundle on Vercel (or any static host).

## Stack

- Next.js 16 (app router)
- React 19
- TypeScript 5
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Static export via `output: 'export'`
- `node --test` for scaffold/contract tests

## Scripts

| Command            | What it does                                             |
| ------------------ | -------------------------------------------------------- |
| `npm run dev`      | Start the dev server on <http://localhost:3000>          |
| `npm run build`    | Build the static site into `out/`                        |
| `npm start`        | Serve the built `out/` directory on port 3000            |
| `npm run serve`    | Same as `npm start`                                      |
| `npm run typecheck`| Run `tsc --noEmit`                                       |
| `npm run lint`     | Run ESLint                                               |
| `npm test`         | Run the scaffold/contract tests under `test/`            |

## Project layout

```
app/                  # Next.js app router (layout.tsx, page.tsx, globals.css)
data/events.json      # 13 Atlanta events (build-time import source)
public/events.json    # Same 13 events (also fetchable at runtime)
test/                 # node:test scaffold/contract tests
out/                  # Static build output (gitignored)
next.config.ts        # output: 'export', images.unoptimized: true
```

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Production build

```bash
npm run build
npm start
# open http://localhost:3000
```

The `out/` directory is a self-contained static site and can be deployed
to Vercel, Netlify, GitHub Pages, S3, or any static host.

## Why static export?

- No server runtime to operate.
- Cheaper / simpler Vercel hosting.
- The site is a pure read-only events feed — no per-request rendering needed.

`images.unoptimized: true` is required by Next's static export mode.
`output: 'export'` automatically runs `next export` after the build in
Next 14+, so no extra command is needed.

## Testing

The `npm test` script uses Node's built-in test runner (`node --test`) to
verify scaffold invariants:

- All required config files are present.
- `next.config.ts` has `output: 'export'` and `unoptimized: true`.
- `data/events.json` and `public/events.json` exist and are byte-identical,
  with exactly 13 events.
- The app router scaffold (`app/layout.tsx`, `app/page.tsx`) is in place.
- `tsconfig.json`, `postcss.config.mjs`, and Tailwind wiring are present.
- `.gitignore` covers `node_modules`, `.next`, and `out/`.
- If a build has been run, `out/index.html` exists and is non-empty.

Run the full check:

```bash
npm run typecheck && npm test && npm run build
```

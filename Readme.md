# Echelon

The Edgelon web app: tournament results, leaderboards and teams for the
**Levels** Tekken 8 scene in Rotterdam.

Make sure docker, go and make are installed.

```sh
make
```

| Service | URL |
|---|---|
| UI (Angular, server-rendered) | http://localhost:3000 |
| API (Go + Gin) | http://localhost:8080/api/v1 |

The UI proxies `/api/*` through to the backend, so the browser only ever talks
to one origin.

## Front end

```sh
cd front-end
npm ci
npm start          # http://localhost:4200
npm test           # Vitest
npm run build
```

Requires Node >= 24.15.0 (the Angular CLI enforces this).

The app is Angular 22, **zoneless**, standalone components, no NgModules. That
means no `ChangeDetectorRef.detectChanges()`, no `setTimeout` refresh hacks, and
any library that depends on Zone.js will silently fail to update the view.

### Where the data comes from

The front end currently runs on a **frozen snapshot** of the Levels history,
scraped from start.gg and committed to `front-end/public/data/`. The provenance,
counts and caveats travel with it in `meta.json` and are rendered in the app
footer and under "How points are calculated".

Two files are not from the scrape:

- `teams.json` and `team_memberships.json` are **hand-authored**. Teams do not
  exist in start.gg at all, so there was nothing to scrape. They use real player
  ids and the real sponsor prefixes found in the entrant names.

`entrant_id` was stripped from `entries.json` and `org.json` was left out
entirely: both are start.gg identifiers, and no start.gg id is allowed to reach
the browser.

### Swapping the fixtures for the real API

Every page reads through one abstraction, `EchelonData`
(`src/app/core/data/echelon-data.ts`). Its methods are shaped like the endpoints
Gin will serve, not like the fixture files, and all the joining happens behind
it. Switching the whole app onto the backend is one line in `app.config.ts`:

```ts
{ provide: EchelonData, useClass: HttpEchelonData }
```

Client-side joins that the backend will do in SQL are marked `SERVER-SIDE LATER`
in `mock-echelon-data.ts`.

### Styling

There is none yet, on purpose. This is a structural sketch: layout utilities
only (flex, grid, spacing, sizing, overflow), no colour, typography, radius or
shadow. The single `.sketch-box` rule in `src/styles.css` makes structure
visible and deleting it removes the entire sketch look in one edit.

Design tokens go in the `@theme` block in `src/styles.css`. Tailwind v4 is
CSS-first — do not add a `tailwind.config.js`, it would be silently ignored.

Guardrail, should print nothing:

Directional border utilities (`border-b`, `border-t`) are allowed — they set
width only, and the colour comes from a component class.

```sh
grep -rEo 'class="[^"]*"' src/app --include=*.html \
  | grep -E 'bg-|text-(xs|sm|base|lg|xl)|font-|rounded|shadow|border-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)'
```

## Back end

```sh
cd back-end && go build ./...
```

Happy coding!!!

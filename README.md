# PintaStreaming

A streaming front-end built with Angular 20 and Angular Material. It browses movies and TV series through [The Movie Database](https://www.themoviedb.org/) (TMDB), plays them through an embedded external video player, and keeps per-user watch progress and favorites in Firebase.

The UI is currently in Italian, with the metadata language selectable at runtime.

## Features

### Catalog

- Home catalog built from four TMDB categories: popular movies, popular TV series, top-rated movies, top-rated TV series.
- Category filtering through the route (`/catalog/all`, `/catalog/movies`, `/catalog/tv-series`):
  showing only the movie or only the TV rows.
- Horizontal carousels of poster cards, each card linking straight to the player and marking whether the title is actually available for streaming.

### Search

- Multi-search across movies and TV series (`/search`), with paginated results and an auto-focused search field.
- Results route to the right player shape automatically — movies to `/player/movies/:id`, series to season 1, episode 1.

### Player

- Separate routes for movies (`/player/movies/:id`) and series (`/player/tv-series/:id/:season/:episode`), so any episode is directly linkable.
- Season and episode pickers that navigate by URL; switching to a shorter season falls back to episode 1 instead of a dead link.
- Playback resume: the embedded player's `timeupdate` events are captured via `postMessage`
  (origin-checked), stored in `sessionStorage`, and pushed to Firestore at most once a minute. Reopening a title restarts where it left off, either from the stored checkpoint or from a
  `?time=` query parameter.
- On `ended`, the title is removed from *Continue watching* automatically.

### Show details

- Details card next to the player: poster, year, movie/season count, genre chips and overview.
- Titles and overviews are localized using TMDB translations for the selected language, falling back to the original title.
- Season accordion with per-season names, air dates, episode counts and descriptions.
- "Where to watch" row showing flat-rate streaming providers for the selected locale, with provider logos and tooltips, sourced from TMDB watch providers.

### Accounts and personal lists

- Sign in with Google, GitHub, or email and password, all via Firebase Auth with local persistence, so the session survives a reload.
- Email sign-up sends a verification mail and blocks the session until the address is confirmed.
- Per-user Firestore document holding the role, *Continue watching* list (most recent first, capped at 20 entries) and *Favorites*.
- Both lists appear as their own carousels on the catalog page, and entries can be removed or un-favorited directly from the card menu.

### Admin panel

- `/admin`, visible only to users with the `admin` role, manages the list of TMDB ids that count as streamable.
- Movie and TV lists are edited as JSON, can be reloaded from the current published version, and are saved as a new timestamped document — the app always reads the most recent one, so previous versions stay in history.

### Interface

- Angular Material 3 with a custom theme, responsive shell with a toolbar and a sidenav for narrow screens.
- Metadata language picker listing every language TMDB knows about, sorted by localized name and persisted in `localStorage` (default: Italian).

## Tech stack

| Area        | Choice                                                                                  |
|-------------|-----------------------------------------------------------------------------------------|
| Framework   | Angular 20, standalone components, signals throughout                                   |
| UI          | Angular Material 20 + custom SCSS theme                                                 |
| Metadata    | TMDB REST API v3 (bearer token)                                                         |
| Auth / data | Firebase Auth + Cloud Firestore                                                         |
| Playback    | External embed provider in an iframe                                                    |
| Hosting     | Cloudflare Workers (static assets + SPA fallback); Firebase Hosting config also present |
| Tests       | Karma + Jasmine                                                                         |

## Getting started

Requirements: Node.js 20+ and npm (a `bun.lock` is committed too, so Bun works as well).

```bash
npm install
npm start
```

The dev server runs on `http://localhost:4200/` and reloads on save.

## Scripts

| Command           | Description                                        |
|-------------------|----------------------------------------------------|
| `npm start`       | Dev server with live reload                        |
| `npm run build`   | Production build into `dist/`                      |
| `npm run watch`   | Development build in watch mode                    |
| `npm test`        | Unit tests via Karma                               |
| `npm run preview` | Build and serve through the local Wrangler runtime |
| `npm run deploy`  | Build and deploy to Cloudflare Workers             |

## Legal

Metadata and images come from TMDB; this project is not endorsed or certified by TMDB. Video playback is delegated to a third-party embed provider — no media is hosted or distributed by this application, and it is up to whoever deploys it to point `videoStreamingDomain` at a source they are entitled to use.

Released under the [MIT License](LICENSE).

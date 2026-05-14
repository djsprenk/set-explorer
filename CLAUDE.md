# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

DJ analytics and visualization web app that renders interactive D3.js graphs of
DJ sets (BPM, energy, playlists, etc.). Published at djsprenk.com. The repo is
also known as `dj-analytics` on GitHub.

## Commands

### Frontend

```bash
npm run develop      # Start webpack-dev-server with hot reload
npm run build        # Production build + Sass compilation
npm run format       # Format JS with StandardJS
```

### Python Data Pipeline

```bash
make database        # Convert VirtualDJ XML database → JSON
make playlists       # Extract song metadata from playlists
make recording-scans # Extract recording data with Points of Interest
make update-all      # Full data pipeline (song data + mixcloud + compilation)
make build           # Bundle to /dist/
make publish         # Deploy dist/ to djsprenk.github.io
make format          # Format Python (Black + isort) + JS (StandardJS)
```

## Architecture

### Data Flow

The pipeline runs in Python and outputs a single JS data file consumed by the
frontend:

1. VirtualDJ XML → `scripts/database.py` → JSON
2. Playlists → `scripts/playlists.py` → metadata
3. Recordings → `scripts/recordings.py` → timing & POI data
4. Mixcloud API → `scripts/mixcloud.py` → artwork & online metadata
5. All sources → `scripts/data.py` (pandas joins/transforms) →
   `src/data/song-data.js`
6. Frontend loads `song-data.js`, D3 renders interactive SVG visualizations

Local paths (VirtualDJ database location, directories) are configured in `.env`.

### Frontend (`src/`)

- `src/scripts/index.js` — App entry point: initializes controls, loads set
  data, triggers rendering
- `src/scripts/controls.js` — Settings menu (BPM range, sort order, scaling,
  light/dark mode)
- `src/scripts/timeline.js` — Combined BPM + energy timeline graph
- `src/scripts/bpm.js` / `energy.js` — Individual graph renderers
- `src/scripts/e3.js` — Familiarity/categorization graph
- `src/scripts/playlist.js` — Playlist view
- `src/scripts/cookie.js` — Cookie-based settings persistence
- `src/data/song-data.js` — **Generated file** — do not edit manually; produced
  by `make update-all`

Stylesheets follow SMACSS: `abstracts/` (vars/mixins), `components/` (per-graph
styles), `pages/`, `theme/`.

### Build

- `webpack.config.dev.js` — Dev server config
- `webpack.config.prod.js` — Production build (splitChunks, HtmlWebpackPlugin,
  CopyPlugin)
- D3.js is pinned to v5.1.0; do not upgrade without verifying all graph code
  remains compatible.

### Code Style

- JavaScript: StandardJS (no semicolons, 2-space indent) — enforced via
  `npm run format`
- Python: Black + isort — enforced via `make format`
- Markdown: Prettier (`proseWrap: always`) — runs as part of `npm run format` /
  `make format`
- No TypeScript; no ESLint config (StandardJS handles linting)

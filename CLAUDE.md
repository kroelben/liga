# Magnes Fodboldliga

Local football league simulator. Single Express server + single-file frontend.

## Working with this project

After finishing any task, update this file if files or state shape changed. Backlog is tracked in `backlog.md`.

After every task, commit and push.

## Start

```bash
npm install   # first time only
npm start     # http://localhost:3000
```

## Files

| File | Purpose |
|---|---|
| `server.js` | Express. Serves `index.html`, static `/logos`, static `/shirts`, `GET /save`, `POST /save`, `GET /logos-list`, `GET /teams` |
| `index.html` | Entire frontend: HTML, CSS, and JS in one file |
| `teams.json` | Hardcoded list of all 20 teams with `name` and `id`. Source of truth for team names — never derived from filenames. |
| `save.json` | Auto-created on first load. Delete to reset manually. |
| `logos/` | Team logo PNGs. Filename must match team `id` (e.g. `bladington_fc.png`). |
| `shirts/` | Team shirt PNGs. Filename must match team `id` (e.g. `bladington_fc.png`). Served at `/shirts/`. |

## State Shape

```js
{
  teams:    [{ id, name, logoFile, strength, played, won, drawn, lost, gf, ga, points }],
  fixtures: [{ matchday, homeId, awayId }],          // 380 total (38 × 10)
  results:  [{ matchday, homeId, awayId, homeGoals, awayGoals }],
  scorers:  [{ name, teamId, goals, assists }],       // ~50–60 total
  currentMatchday: 0
}
```

## Name Formatting

Team names are defined once in `teams.json`. Do not derive names from filenames.

# Magnes Fodboldliga

Local football league simulator. Single Express server + single-file frontend.

## Start

```bash
npm install   # first time only
npm start     # http://localhost:3000
```

## Files

| File | Purpose |
|---|---|
| `server.js` | Express. Serves `index.html`, static `/logos`, `GET /save`, `POST /save`, `GET /logos-list` |
| `index.html` | Entire frontend: HTML, CSS, and JS in one file |
| `save.json` | Auto-created on first load. Delete to reset manually. |
| `logos/` | Team logo PNGs. Filename → team ID and display name. |

## State Shape

```js
{
  teams:    [{ id, name, logoFile, strength, played, won, drawn, lost, gf, ga, points }],
  fixtures: [{ matchday, homeId, awayId }],          // 380 total (38 × 10)
  results:  [{ matchday, homeId, awayId, homeGoals, awayGoals }],
  scorers:  [{ name, teamId, goals }],               // ~50–60 total
  currentMatchday: 0
}
```

## Name Formatting

`bladington_fc.png` → `Bladington FC`  
`afc_04_rasby.png` → `AFC 04 Rasby`

Rule: strip `.png`, split on `_`, title-case each token, uppercase `FC`/`AFC`.

## Backlog

- **Simulate matchday** button: advance `currentMatchday`, generate results using team `strength` + randomness (0–5 goal range), update team stats, distribute goals to scorers, auto-save

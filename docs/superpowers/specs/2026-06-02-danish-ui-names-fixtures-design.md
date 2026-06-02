# Design: Danish UI, International Names, Random Fixtures, Assists

**Date:** 2026-06-02  
**Scope:** `index.html` only — no new files, no server changes

---

## 1. International Player Names (Deterministic)

### Name pool
- 200 first names covering: English, French, Spanish, Portuguese, Dutch, German, Scandinavian, African, Brazilian, Eastern European nationalities
- 250 surnames from the same mix
- Full name format: "Marcus Silva", "Diogo Johnson"

### Determinism
Replace `Math.random()` in `generateScorers` with a seeded PRNG keyed on team ID. Same team → same squad every time, regardless of reset or reload.

```js
function strToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  return h >>> 0;
}
function makeRng(seed) {
  let s = seed;
  return () => { s = Math.imul(s, 1664525) + 1013904223; return (s >>> 0) / 4294967296; };
}
```

### State change
`scorers` entries gain `assists: 0`. Shape: `{ name, teamId, goals, assists }`.

---

## 2. Danish UI — Superliga Column Style

### Tab structure (6 tabs)

| Tab | Description |
|---|---|
| Stilling | Full season standings |
| Hjemme | Standings from home results only |
| Ude | Standings from away results only |
| Form | Standings re-ranked by last-5-game points |
| Kampe | Single matchday view: results (past) + fixtures (future) |
| Statistik | Top scorers with goals and assists |

### Standings column order (Stilling / Hjemme / Ude / Form)
`#` · Hold · K · V · U · T · MÅL · DIFF · Form · P

- **MÅL**: rendered as `62-32` (GF–GA), not two separate columns
- **DIFF**: `+30` / `-5` / `0`
- **P**: points (was Pts)
- Form badges shown in Stilling and Form tabs; omitted in Hjemme and Ude tabs

### Hjemme tab
Re-compute K/V/U/T/MÅL/DIFF/P using only results where the team was home. Re-rank independently. No form badges.

### Ude tab
Same as Hjemme but away results only.

### Form tab
Re-rank all teams by points earned across their last 5 played matches (regardless of home/away). Tiebreak: GD in those same 5 games. Show last-5 form badges. K/V/U/T/MÅL/DIFF/P reflect last 5 games only.

### Kampe tab
- Matchday dropdown (defaults to next unplayed matchday)
- Past matchdays: show result cards with score
- Future matchdays: show fixture cards with "vs"
- Replaces the old Results and Fixtures tabs

### Statistik tab
Columns: `#` · Spiller · Klub · Mål · Assist  
Sort: goals desc, then assists desc as tiebreak.

### Other UI text translations

| English | Danish |
|---|---|
| Season 1 · Matchday X of 38 | Sæson 1 · Runde X af 38 |
| Pre-season | Før sæsonen |
| Simulate matchday X | Simuler runde X |
| Season complete | Sæson afsluttet |
| Resume matchday X | Fortsæt runde X |
| ↺ Reset | ↺ Nulstil |
| Reset the league? All progress will be cleared. | Nulstil ligaen? Al fremgang slettes. |
| Kick off → | Spark af → |
| Next match → | Næste kamp → |
| Close | Luk |
| Skip to result | Spring til resultat |
| No results yet. Simulate a matchday to see results here. | Ingen resultater endnu. Simuler en runde for at se resultater her. |
| Champions League (1–4) | Champions League (1–4) |
| Europa League (5–6) | Europa League (5–6) |
| Relegation (18–20) | Nedrykning (18–20) |
| Top Scorers | Topscorere |
| Player | Spiller |
| Club | Klub |
| Goals | Mål |
| Matchday X · N/M | Runde X · N/M |
| Failed to load | Indlæsning mislykkedes |

---

## 3. Assists

- In `generateEvents`, each goal event has a 75% chance of having an assister
- Assister is a different player from the same team, chosen via `Math.random()` (match events don't need to be deterministic)
- `applyResult` increments `scorer.assists` when `ev.assist` is set
- Displayed in Statistik table

---

## 4. Random Fixtures

Two changes to `generateFixtures(teams)`:

1. **Shuffle the teams array** before building the round-robin, using `Math.random()` (intentionally non-deterministic — a different schedule each new season is fine)
2. **Shuffle match order within each matchday** after building both halves — so no team consistently appears first

The round-robin algorithm itself is unchanged; this preserves the guarantee that each pair plays exactly twice (once home, once away).

---

## State shape (updated)

```js
{
  teams:    [{ id, name, logoFile, strength, played, won, drawn, lost, gf, ga, points }],
  fixtures: [{ matchday, homeId, awayId }],
  results:  [{ matchday, homeId, awayId, homeGoals, awayGoals }],
  scorers:  [{ name, teamId, goals, assists }],   // assists added
  currentMatchday: 0
}
```

---

## Files changed

| File | Changes |
|---|---|
| `index.html` | All JS and HTML/CSS changes |
| `CLAUDE.md` | Update state shape, tab list |

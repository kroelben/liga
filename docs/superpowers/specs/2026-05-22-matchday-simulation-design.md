# Matchday Simulation with Shirt Display

**Date:** 2026-05-22
**Status:** Approved

## Overview

When the user clicks "Simulate matchday", all 10 match results are computed instantly, state is saved, and a full-screen modal plays through each match one at a time. Each match shows both teams' shirt PNGs prominently, then events (goals, chances, cards) flash one by one. The user taps to start each match and to advance to the next.

## Simulate Button

- Added to the header alongside the existing Reset button
- Label: "Simulate matchday N" where N = `currentMatchday + 1`
- Disabled and visually muted after matchday 38 (all 380 fixtures played)
- On click: runs simulation engine, updates state, auto-saves, opens modal

## Simulation Engine

All computation happens synchronously before the modal opens.

For each of the 10 fixtures on the current matchday:

1. **Score**: generate `homeGoals` and `awayGoals` (0–5 each) weighted by team `strength` with randomness
2. **Events**: build a sorted-by-minute list:
   - One `goal` event per goal — assigned to a random scorer from that team's `scorers` array, random minute (1–90)
   - 2–4 `chance` events (near misses) — random team, random minute, no player name required
   - 0–2 `yellow` card events — random team, random player name from that team's scorers
3. **State updates** (applied immediately, before modal):
   - Team stats: `played`, `won`/`drawn`/`lost`, `gf`, `ga`, `points`
   - Scorer `goals` tallies incremented
   - Result pushed to `state.results`
   - `state.currentMatchday` incremented
   - Auto-save to server

Event shape:
```js
{ minute: Number, type: 'goal' | 'chance' | 'yellow', teamId: String, playerName: String | null }
```

## Modal UI

Full-screen overlay, edge-to-edge (no border-radius on card), dark background. Single match in view at a time.

### Layout (top to bottom)

1. **Header line**: `Matchday X · 3/10` — small, muted, uppercase
2. **Shirt row**: two shirt PNGs side by side (`/shirts/{teamId}.png`), ~130px height CSS, team name below each, running score (large, ~48px) below the name. A `–` separator sits between the two scores.
3. **Event flash zone**: fixed-height area, centred. Shows:
   - Large emoji icon (⚽ for goal, 💨 for chance, 💛 for yellow)
   - Event label (`GOAL!`, `Close chance`, `Yellow card`)
   - Player name and minute (`Jonesy · 61'`)
   - Neutral/blank state before kick-off and between events
4. **Primary button**: full-width, gold, cycles through states:
   - `Kick off →` (before match starts)
   - Hidden during event playback
   - `Next match →` (after final score, matches 1–9)
   - `Close` (after match 10)
5. **Skip button**: small, secondary, border-only. Visible only during event playback. Jumps to final score and holds for 1.5s before showing "Next match →".

### Playback timing

- Events fire every ~600ms automatically after Kick off is tapped
- After last event: 1500ms pause showing final score, then primary button appears
- Chance events flash briefly; goal events cause the score to increment at the moment of display

### "Full time" screen (after match 10)

After the last match's score pause, the modal content switches to a simple centred screen:
- "Full time" heading
- "Matchday X complete" subline
- `Close` button

## Server Change

Add to `server.js` alongside the existing `/logos` static route:
```js
app.use('/shirts', express.static('shirts'));
```

Shirt filenames follow the same convention as logos: `{teamId}.png` (e.g. `bladington_fc.png`).

## Out of Scope

- Red cards (kept simple for now)
- Substitutions
- Match-by-match stats summary screen
- Animated score counter (score updates instantly on goal event)

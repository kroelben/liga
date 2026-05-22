# Matchday Simulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Simulate Matchday button that instantly computes results, then plays them back match-by-match in a full-screen modal with shirt images and animated events.

**Architecture:** All simulation logic runs synchronously before the modal opens — compute all 10 results + events, update state, save, then hand off to the modal playback engine. The modal is a full-screen overlay added to the `<body>` that plays through pre-computed event arrays. No new files — all changes to `server.js` and `index.html`.

**Tech Stack:** Vanilla JS, Express (static file serving), localStorage for state persistence.

---

## File Map

| File | Change |
|---|---|
| `server.js` | Add one line: serve `/shirts` static directory |
| `index.html` `<style>` | Add `.simulate-btn`, `.header-right`, and all `#md-*` modal CSS |
| `index.html` `<body>` header | Wrap right side in `.header-right`, add `#simulate-btn` |
| `index.html` `<body>` bottom | Add `#md-modal` DOM |
| `index.html` `<script>` | Add `simulateMatchday`, `computeGoals`, `generateEvents`, `randomScorer`, `applyResult`, and all `md*` modal functions; update `render()` |

---

## Task 1: Serve shirts from Express

**Files:**
- Modify: `server.js:8` (after the LOGOS_DIR constant)

- [ ] **Add `/shirts` static route to server.js**

  After line 8 (`const LOGOS_DIR = ...`), add:
  ```js
  const SHIRTS_DIR = path.join(__dirname, 'shirts');
  ```
  After line 16 (`app.use('/logos', ...)`), add:
  ```js
  app.use('/shirts', express.static(SHIRTS_DIR));
  ```

- [ ] **Restart server and verify**

  Stop and restart `npm start`. Open `http://localhost:3000/shirts/bladington_fc.png` in the browser. Expected: the Bladington FC shirt image loads.

- [ ] **Commit**
  ```bash
  git add server.js
  git commit -m "feat: serve /shirts static directory"
  ```

---

## Task 2: Simulate button in header

**Files:**
- Modify: `index.html` — `<style>` block and header HTML

- [ ] **Add CSS for header-right and simulate button**

  Inside `<style>`, after the `.reset-btn:hover` rule (around line 40), add:
  ```css
  .header-right { display: flex; align-items: center; gap: 10px; }
  .simulate-btn {
    padding: 10px 20px;
    background: #e8c84a;
    border: none;
    color: #000;
    font-size: 12px; font-family: inherit; font-weight: 700;
    border-radius: 4px; cursor: pointer;
    text-transform: uppercase; letter-spacing: 0.5px;
    transition: background 0.15s;
  }
  .simulate-btn:hover:not(:disabled) { background: #f0d55a; }
  .simulate-btn:disabled { background: #1e1e2a; color: #444; cursor: default; }
  ```

- [ ] **Replace header right side with two-button group**

  In the header HTML, replace:
  ```html
  <button class="reset-btn" onclick="resetLeague()">↺ Reset League</button>
  ```
  With:
  ```html
  <div class="header-right">
    <button id="simulate-btn" class="simulate-btn" onclick="simulateMatchday()">Simulate matchday 1</button>
    <button class="reset-btn" onclick="resetLeague()">↺ Reset</button>
  </div>
  ```

- [ ] **Update render() to keep button label in sync**

  In `render()`, after the `league-sub` textContent line, add:
  ```js
  const simBtn = document.getElementById('simulate-btn');
  if (simBtn) {
    const next = state.currentMatchday + 1;
    simBtn.textContent = next <= 38 ? `Simulate matchday ${next}` : 'Season complete';
    simBtn.disabled = state.currentMatchday >= 38;
  }
  ```

- [ ] **Verify**

  Reload `http://localhost:3000`. Expected: gold "Simulate matchday 1" button visible in header. "↺ Reset" is now shorter and sits to its right. Clicking Simulate should throw a JS error (function not yet defined) — that's fine.

- [ ] **Commit**
  ```bash
  git add index.html
  git commit -m "feat: add simulate matchday button to header"
  ```

---

## Task 3: Simulation engine

**Files:**
- Modify: `index.html` `<script>` — add functions before `resetLeague`

- [ ] **Add simulation functions**

  Before `async function resetLeague()`, insert:
  ```js
  function computeGoals(attackStr, defStr, isHome) {
    const base = (attackStr / (attackStr + defStr)) * (isHome ? 2.2 : 1.8);
    const raw = Math.floor(base + Math.random() * 3);
    return Math.min(5, Math.max(0, raw));
  }

  function randomScorer(teamId) {
    const pool = state.scorers.filter(s => s.teamId === teamId);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)].name;
  }

  function generateEvents(fixture, homeGoals, awayGoals) {
    const events = [];
    const usedMinutes = new Set();
    function randMinute() {
      let m;
      do { m = 1 + Math.floor(Math.random() * 90); } while (usedMinutes.has(m));
      usedMinutes.add(m);
      return m;
    }
    for (let i = 0; i < homeGoals; i++)
      events.push({ minute: randMinute(), type: 'goal', teamId: fixture.homeId, playerName: randomScorer(fixture.homeId) });
    for (let i = 0; i < awayGoals; i++)
      events.push({ minute: randMinute(), type: 'goal', teamId: fixture.awayId, playerName: randomScorer(fixture.awayId) });
    const chanceCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < chanceCount; i++)
      events.push({ minute: randMinute(), type: 'chance', teamId: Math.random() < 0.5 ? fixture.homeId : fixture.awayId, playerName: null });
    const cardCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < cardCount; i++) {
      const cardTeam = Math.random() < 0.5 ? fixture.homeId : fixture.awayId;
      events.push({ minute: randMinute(), type: 'yellow', teamId: cardTeam, playerName: randomScorer(cardTeam) });
    }
    return events.sort((a, b) => a.minute - b.minute);
  }

  function applyResult(fixture, homeGoals, awayGoals, events) {
    const home = state.teams.find(t => t.id === fixture.homeId);
    const away = state.teams.find(t => t.id === fixture.awayId);
    home.played++; away.played++;
    home.gf += homeGoals; home.ga += awayGoals;
    away.gf += awayGoals; away.ga += homeGoals;
    if (homeGoals > awayGoals) { home.won++; home.points += 3; away.lost++; }
    else if (homeGoals < awayGoals) { away.won++; away.points += 3; home.lost++; }
    else { home.drawn++; home.points++; away.drawn++; away.points++; }
    for (const ev of events) {
      if (ev.type === 'goal' && ev.playerName) {
        const scorer = state.scorers.find(s => s.teamId === ev.teamId && s.name === ev.playerName);
        if (scorer) scorer.goals++;
      }
    }
    state.results.push({ matchday: fixture.matchday, homeId: fixture.homeId, awayId: fixture.awayId, homeGoals, awayGoals });
  }

  function simulateMatchday() {
    const nextMatchday = state.currentMatchday + 1;
    if (nextMatchday > 38) return;
    const fixtures = state.fixtures.filter(f => f.matchday === nextMatchday);
    const matchResults = [];
    for (const fixture of fixtures) {
      const home = state.teams.find(t => t.id === fixture.homeId);
      const away = state.teams.find(t => t.id === fixture.awayId);
      const homeGoals = computeGoals(home.strength, away.strength, true);
      const awayGoals = computeGoals(away.strength, home.strength, false);
      const events = generateEvents(fixture, homeGoals, awayGoals);
      applyResult(fixture, homeGoals, awayGoals, events);
      matchResults.push({ fixture, homeGoals, awayGoals, events });
    }
    state.currentMatchday = nextMatchday;
    saveState();
    render();
    openMatchdayModal(matchResults);
  }
  ```

- [ ] **Verify**

  Reload and click "Simulate matchday 1". The console should show an error about `openMatchdayModal` not being defined — that's expected. Check that `state.currentMatchday` is now 1 by typing `state.currentMatchday` in the browser console. Check that the Standings tab updates with real data.

- [ ] **Commit**
  ```bash
  git add index.html
  git commit -m "feat: add matchday simulation engine"
  ```

---

## Task 4: Modal HTML and CSS

**Files:**
- Modify: `index.html` — `<style>` block and `<body>`

- [ ] **Add modal CSS**

  Inside `<style>`, after the `.empty-state p` rule (around line 162), add:
  ```css
  /* ── Matchday Modal ── */
  #md-modal {
    position: fixed; inset: 0; z-index: 100;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.88);
  }
  #md-card {
    width: 100%; max-width: 100%; height: 100dvh;
    background: #13131e;
    display: flex; flex-direction: column;
    padding: 32px 28px 28px;
    overflow: hidden;
  }
  #md-header {
    text-align: center; font-size: 11px; color: #444;
    text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 28px;
    flex-shrink: 0;
  }
  #md-teams {
    display: flex; justify-content: center; align-items: flex-end;
    gap: 24px; margin-bottom: 28px; flex-shrink: 0;
  }
  .md-team { display: flex; flex-direction: column; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .md-shirt { height: 130px; width: auto; object-fit: contain; }
  .md-team-name { font-size: 13px; font-weight: 600; color: #ccc; text-align: center; }
  .md-score { font-size: 48px; font-weight: 800; color: #fff; line-height: 1; }
  #md-sep { font-size: 26px; font-weight: 700; color: #333; padding-bottom: 54px; flex-shrink: 0; }
  #md-event-zone {
    flex: 1; background: #0d0d18; border-radius: 14px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; margin-bottom: 24px; padding: 22px; text-align: center;
  }
  #md-event-icon { font-size: 44px; min-height: 52px; }
  #md-event-label { font-size: 18px; font-weight: 700; color: #e8c84a; min-height: 26px; }
  #md-event-detail { font-size: 13px; color: #aaa; min-height: 20px; }
  #md-primary-btn {
    width: 100%; padding: 20px;
    background: #e8c84a; color: #000;
    font-weight: 700; font-size: 16px;
    border: none; border-radius: 12px; cursor: pointer;
    font-family: inherit; margin-bottom: 12px; flex-shrink: 0;
  }
  #md-primary-btn:disabled { background: #1e1e2a; color: #333; cursor: default; }
  #md-skip-btn {
    width: 100%; padding: 14px;
    background: transparent; color: #444; font-size: 13px;
    border: 1px solid #1e1e2a; border-radius: 12px; cursor: pointer;
    font-family: inherit; flex-shrink: 0;
  }
  ```

- [ ] **Add modal DOM to body**

  Just before `</body>`, add:
  ```html
  <div id="md-modal" style="display:none">
    <div id="md-card">
      <div id="md-header"></div>
      <div id="md-teams">
        <div class="md-team">
          <img id="md-home-shirt" class="md-shirt" src="" alt="">
          <span id="md-home-name" class="md-team-name"></span>
          <span id="md-home-score" class="md-score">0</span>
        </div>
        <div id="md-sep">–</div>
        <div class="md-team">
          <img id="md-away-shirt" class="md-shirt" src="" alt="">
          <span id="md-away-name" class="md-team-name"></span>
          <span id="md-away-score" class="md-score">0</span>
        </div>
      </div>
      <div id="md-event-zone">
        <div id="md-event-icon"></div>
        <div id="md-event-label"></div>
        <div id="md-event-detail"></div>
      </div>
      <button id="md-primary-btn" onclick="mdPrimaryAction()"></button>
      <button id="md-skip-btn" onclick="mdSkip()" style="display:none">Skip to result</button>
    </div>
  </div>
  ```

- [ ] **Verify layout**

  In the browser console, run: `document.getElementById('md-modal').style.display = 'flex'`
  Expected: full-screen dark overlay with a centred dark card, two shirt image placeholders (broken images), large score zeros, a dark event zone, and a gold primary button.

- [ ] **Commit**
  ```bash
  git add index.html
  git commit -m "feat: add matchday modal HTML and CSS"
  ```

---

## Task 5: Modal playback engine

**Files:**
- Modify: `index.html` `<script>` — add modal functions after `simulateMatchday`

- [ ] **Add all modal JS functions**

  After the `simulateMatchday` function, insert:
  ```js
  let mdState = null;

  function openMatchdayModal(matchResults) {
    mdState = { matchResults, matchIndex: 0, eventTimer: null, pendingKickoff: true };
    document.getElementById('md-modal').style.display = 'flex';
    showMatch(0);
  }

  function showMatch(index) {
    const { matchResults } = mdState;
    const { fixture, homeGoals, awayGoals } = matchResults[index];
    const home = state.teams.find(t => t.id === fixture.homeId);
    const away = state.teams.find(t => t.id === fixture.awayId);
    document.getElementById('md-header').textContent =
      `Matchday ${state.currentMatchday} · ${index + 1}/${matchResults.length}`;
    document.getElementById('md-home-shirt').src = `/shirts/${fixture.homeId}.png`;
    document.getElementById('md-home-shirt').alt = home.name;
    document.getElementById('md-away-shirt').src = `/shirts/${fixture.awayId}.png`;
    document.getElementById('md-away-shirt').alt = away.name;
    document.getElementById('md-home-name').textContent = home.name;
    document.getElementById('md-away-name').textContent = away.name;
    document.getElementById('md-home-score').textContent = '0';
    document.getElementById('md-away-score').textContent = '0';
    mdClearEvent();
    document.getElementById('md-skip-btn').style.display = 'none';
    document.getElementById('md-primary-btn').textContent = 'Kick off →';
    document.getElementById('md-primary-btn').disabled = false;
    mdState.matchIndex = index;
    mdState.pendingKickoff = true;
  }

  function mdPrimaryAction() {
    if (mdState.pendingKickoff) {
      mdState.pendingKickoff = false;
      document.getElementById('md-primary-btn').disabled = true;
      document.getElementById('md-skip-btn').style.display = 'block';
      playEvents(mdState.matchResults[mdState.matchIndex].events,
                 mdState.matchResults[mdState.matchIndex].fixture);
    } else {
      const next = mdState.matchIndex + 1;
      if (next < mdState.matchResults.length) {
        showMatch(next);
      } else {
        mdClose();
      }
    }
  }

  function playEvents(events, fixture) {
    let homeScore = 0, awayScore = 0, i = 0;
    function tick() {
      if (i >= events.length) {
        document.getElementById('md-skip-btn').style.display = 'none';
        const isLast = mdState.matchIndex + 1 >= mdState.matchResults.length;
        document.getElementById('md-primary-btn').textContent = isLast ? 'Close' : 'Next match →';
        document.getElementById('md-primary-btn').disabled = false;
        mdState.eventTimer = null;
        return;
      }
      const ev = events[i++];
      if (ev.type === 'goal') {
        if (ev.teamId === fixture.homeId) {
          homeScore++;
          document.getElementById('md-home-score').textContent = homeScore;
        } else {
          awayScore++;
          document.getElementById('md-away-score').textContent = awayScore;
        }
        mdShowEvent('⚽', 'GOAL!', ev.playerName ? `${ev.playerName} · ${ev.minute}'` : `${ev.minute}'`);
      } else if (ev.type === 'chance') {
        mdShowEvent('💨', 'Close chance!', `${ev.minute}'`);
      } else if (ev.type === 'yellow') {
        mdShowEvent('💛', 'Yellow card', ev.playerName ? `${ev.playerName} · ${ev.minute}'` : `${ev.minute}'`);
      }
      mdState.eventTimer = setTimeout(tick, 600);
    }
    tick();
  }

  function mdSkip() {
    if (mdState.eventTimer) { clearTimeout(mdState.eventTimer); mdState.eventTimer = null; }
    const { fixture, homeGoals, awayGoals } = mdState.matchResults[mdState.matchIndex];
    document.getElementById('md-home-score').textContent = homeGoals;
    document.getElementById('md-away-score').textContent = awayGoals;
    mdClearEvent();
    document.getElementById('md-skip-btn').style.display = 'none';
    const isLast = mdState.matchIndex + 1 >= mdState.matchResults.length;
    document.getElementById('md-primary-btn').textContent = isLast ? 'Close' : 'Next match →';
    document.getElementById('md-primary-btn').disabled = false;
  }

  function mdShowEvent(icon, label, detail) {
    document.getElementById('md-event-icon').textContent = icon;
    document.getElementById('md-event-label').textContent = label;
    document.getElementById('md-event-detail').textContent = detail;
  }

  function mdClearEvent() {
    document.getElementById('md-event-icon').textContent = '';
    document.getElementById('md-event-label').textContent = '';
    document.getElementById('md-event-detail').textContent = '';
  }

  function mdClose() {
    if (mdState && mdState.eventTimer) clearTimeout(mdState.eventTimer);
    mdState = null;
    document.getElementById('md-modal').style.display = 'none';
  }
  ```

- [ ] **Verify full flow**

  Reset the league. Click "Simulate matchday 1". Expected:
  - Modal opens showing Match 1 with both shirt PNGs, team names, score 0–0, "Kick off →" button
  - Tap "Kick off →": events flash one by one — chances show 💨, goals show ⚽ and increment the score, yellows show 💛
  - "Skip to result" jumps immediately to final score
  - "Next match →" shows match 2 with its own shirts
  - After match 10, button reads "Close" and dismisses the modal
  - Standings and Stats tabs reflect updated data

- [ ] **Verify iPad layout**

  Open `http://localhost:3000` in Safari or Chrome with mobile emulation set to iPad (768×1024). Confirm shirts are large and visible, buttons are easy to tap, nothing overflows.

- [ ] **Commit**
  ```bash
  git add index.html
  git commit -m "feat: matchday modal playback engine with shirt display"
  ```

---

## Task 6: Update CLAUDE.md

- [ ] **Update CLAUDE.md to reflect completed feature**

  In the Backlog section, mark the simulate matchday item as done and note the new `shirts/` server route. Add a row to the Files table for the shirts directory:

  ```
  | `shirts/` | Team shirt PNGs. Filename must match team `id` (e.g. `bladington_fc.png`). Served at `/shirts/`. |
  ```

- [ ] **Commit**
  ```bash
  git add CLAUDE.md
  git commit -m "docs: update CLAUDE.md after matchday simulation feature"
  ```

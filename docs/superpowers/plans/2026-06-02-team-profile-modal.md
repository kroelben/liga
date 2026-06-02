# Team Profile Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a team profile modal that opens when clicking a team row, showing read-only identity fields and editable stadium + skill fields that auto-save.

**Architecture:** Single-file frontend — all CSS, HTML, and JS live in `index.html`. New modal follows the same pattern as the existing matchday modal (`#md-modal`): a static overlay div populated dynamically via JS. A module-level variable `tpTeamId` tracks the active team. No test framework exists — verify by running the app and exercising the feature manually.

**Tech Stack:** Vanilla JS, HTML, CSS — no dependencies beyond the existing Express server.

---

## Files

- Modify: `index.html` (CSS block, JS script block, body HTML at bottom)

---

### Task 1: Extend team state with new fields

**Files:**
- Modify: `index.html` — `loadTeams()` function and `init()` migration

- [ ] **Step 1: Add fields to `loadTeams()`**

Find `loadTeams()` (around line 272). Replace the `return teams.map(...)` block:

```js
return teams.map(t => ({
  id: t.id,
  name: t.name,
  logoFile: `${t.id}.png`,
  strength: Math.floor(Math.random() * 10) + 1,
  played: 0, won: 0, drawn: 0, lost: 0,
  gf: 0, ga: 0, points: 0,
  stadiumName: '', capacity: '', forsvar: '', kontrol: '', angreb: ''
}));
```

- [ ] **Step 2: Migrate existing saves in `init()`**

In `init()`, after `state = JSON.parse(saved);` and before the scorers migration line, add:

```js
state.teams = state.teams.map(t => ({
  stadiumName: '', capacity: '', forsvar: '', kontrol: '', angreb: '',
  ...t
}));
```

This ensures old localStorage saves without the new fields get them added transparently (spread order: defaults first, then existing values win).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add stadiumName, capacity, forsvar, kontrol, angreb to team state"
git push
```

---

### Task 2: Add CSS for the team profile modal

**Files:**
- Modify: `index.html` — `<style>` block (add before closing `</style>`)

- [ ] **Step 1: Add CSS**

Append the following inside the `<style>` block, just before `</style>`:

```css
/* ── Team Profile Modal ── */
#tp-modal {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.75);
}
#tp-card {
  width: 420px; max-width: 92vw;
  background: #13131e; border-radius: 16px;
  display: flex; flex-direction: column;
  padding: 24px 28px 28px; gap: 20px;
  position: relative;
}
#tp-dismiss {
  position: absolute; top: 14px; right: 16px;
  background: transparent; border: none; color: #555;
  font-size: 20px; line-height: 1; cursor: pointer;
  padding: 4px 8px; border-radius: 6px; font-family: inherit;
}
#tp-header { display: flex; align-items: center; gap: 14px; }
#tp-logo { width: 48px; height: 48px; object-fit: contain; }
#tp-name { font-size: 20px; font-weight: 700; color: #fff; }
#tp-middle { display: flex; align-items: flex-start; gap: 20px; }
#tp-shirt { height: 110px; width: auto; object-fit: contain; flex-shrink: 0; }
#tp-info { display: flex; flex-direction: column; gap: 12px; flex: 1; min-width: 0; }
.tp-field { display: flex; flex-direction: column; gap: 4px; }
.tp-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
.tp-input {
  width: 100%; background: #0d0d18; border: 1px solid #1e1e2a;
  color: #e0e0e0; padding: 10px 12px; border-radius: 8px;
  font-family: inherit; font-size: 14px;
}
.tp-input:focus { outline: none; border-color: #e8c84a; }
#tp-skills { display: flex; flex-direction: column; gap: 10px; }
.tp-section-label {
  font-size: 11px; color: #444;
  text-transform: uppercase; letter-spacing: 1.5px;
}
.tp-skills-row { display: flex; gap: 12px; }
.tp-skill { flex: 1; display: flex; flex-direction: column; gap: 4px; }
#tp-close {
  width: 100%; padding: 14px;
  background: #1e1e2a; color: #ccc;
  font-weight: 600; font-size: 14px;
  border: none; border-radius: 10px; cursor: pointer;
  font-family: inherit;
}
.standings-table tbody tr { cursor: pointer; }
.standings-table tbody tr:hover { background: rgba(255,255,255,0.03); }
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add CSS for team profile modal"
git push
```

---

### Task 3: Add team modal HTML

**Files:**
- Modify: `index.html` — add modal div just before `</body>`

- [ ] **Step 1: Add modal HTML**

Find the line `</body>` at the very bottom of `index.html`. Insert this immediately before it (after the existing `#md-modal` closing `</div>`):

```html
<div id="tp-modal" style="display:none">
  <div id="tp-card">
    <button id="tp-dismiss" onclick="closeTeamModal()">×</button>
    <div id="tp-header">
      <img id="tp-logo" src="" alt="">
      <span id="tp-name"></span>
    </div>
    <div id="tp-middle">
      <img id="tp-shirt" src="" alt="">
      <div id="tp-info">
        <div class="tp-field">
          <div class="tp-label">Stadion</div>
          <input class="tp-input" id="tp-stadium" type="text" placeholder="Stadion"
            oninput="teamModalSave('stadiumName', this.value)">
        </div>
        <div class="tp-field">
          <div class="tp-label">Kapacitet</div>
          <input class="tp-input" id="tp-capacity" type="number" placeholder="Kapacitet"
            oninput="teamModalSave('capacity', this.value)">
        </div>
      </div>
    </div>
    <div id="tp-skills">
      <div class="tp-section-label">Kompetencer</div>
      <div class="tp-skills-row">
        <div class="tp-skill">
          <div class="tp-label">Forsvar</div>
          <input class="tp-input" id="tp-forsvar" type="number" min="1" max="100" placeholder="1–100"
            oninput="teamModalSave('forsvar', this.value)">
        </div>
        <div class="tp-skill">
          <div class="tp-label">Kontrol</div>
          <input class="tp-input" id="tp-kontrol" type="number" min="1" max="100" placeholder="1–100"
            oninput="teamModalSave('kontrol', this.value)">
        </div>
        <div class="tp-skill">
          <div class="tp-label">Angreb</div>
          <input class="tp-input" id="tp-angreb" type="number" min="1" max="100" placeholder="1–100"
            oninput="teamModalSave('angreb', this.value)">
        </div>
      </div>
    </div>
    <button id="tp-close" onclick="closeTeamModal()">Luk</button>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add team profile modal HTML"
git push
```

---

### Task 4: Add JS functions for the team modal

**Files:**
- Modify: `index.html` — `<script>` block, add after `mdResume()` function

- [ ] **Step 1: Add module-level variable and three functions**

Find `let tpTeamId = null;` — if it doesn't exist, add it near the top of the `<script>` block alongside `let state = {};` and `let activeTab = 'stilling';`:

```js
let tpTeamId = null;
```

Then add the three functions after the `mdResume()` function:

```js
function openTeamModal(teamId) {
  const team = state.teams.find(t => t.id === teamId);
  tpTeamId = teamId;
  document.getElementById('tp-logo').src = `./logos/${team.logoFile}`;
  document.getElementById('tp-logo').alt = team.name;
  document.getElementById('tp-name').textContent = team.name;
  document.getElementById('tp-shirt').src = `/shirts/${team.id}.png`;
  document.getElementById('tp-shirt').alt = team.name;
  document.getElementById('tp-stadium').value = team.stadiumName ?? '';
  document.getElementById('tp-capacity').value = team.capacity ?? '';
  document.getElementById('tp-forsvar').value = team.forsvar ?? '';
  document.getElementById('tp-kontrol').value = team.kontrol ?? '';
  document.getElementById('tp-angreb').value = team.angreb ?? '';
  document.getElementById('tp-modal').style.display = 'flex';
}

function closeTeamModal() {
  tpTeamId = null;
  document.getElementById('tp-modal').style.display = 'none';
}

function teamModalSave(field, value) {
  if (!tpTeamId) return;
  const team = state.teams.find(t => t.id === tpTeamId);
  team[field] = value;
  saveState();
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add openTeamModal, closeTeamModal, teamModalSave JS functions"
git push
```

---

### Task 5: Wire click handler on standings rows

**Files:**
- Modify: `index.html` — `standingsTableHTML()` function

- [ ] **Step 1: Add onclick to `<tr>` in `standingsTableHTML`**

Find the `<tr class="zone-${zone}">` line inside `standingsTableHTML`. Replace it:

```js
return `
  <tr class="zone-${zone}" onclick="openTeamModal('${team.id}')">
```

- [ ] **Step 2: Verify manually**

Start the server (`npm start`), open `http://localhost:3000`, click any team row in the standings table. The modal should open with the team's logo, name, shirt, and empty editable fields. Edit a stadium name, close and reopen — the value should persist.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: open team profile modal on standings row click"
git push
```

---

### Task 6: Update CLAUDE.md state shape

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the State Shape section**

In `CLAUDE.md`, update the `teams` line in the State Shape block to:

```
teams:    [{ id, name, logoFile, strength, played, won, drawn, lost, gf, ga, points, stadiumName, capacity, forsvar, kontrol, angreb }],
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update state shape with team profile fields"
git push
```

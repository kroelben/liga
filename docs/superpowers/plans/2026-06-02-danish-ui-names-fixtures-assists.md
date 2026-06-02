# Danish UI, Names, Fixtures, Assists — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `index.html` with international player names (seeded/deterministic), Danish Superliga-style UI with 6 tabs, assists tracking, and randomised fixture order.

**Architecture:** Single-file frontend — every change is in `index.html`. No automated tests exist; verification is manual via `npm start` + browser. Each task ends with a commit. Old `localStorage` state is migrated on load.

**Tech Stack:** Vanilla JS, HTML, CSS. Express serves the file on port 3000 (`npm start`).

---

## File map

| File | Changes |
|---|---|
| `index.html` | All JS, HTML, CSS changes |
| `CLAUDE.md` | Update state shape + tab list after all tasks done |

---

## Task 1: Seeded RNG helpers + name pools + update generateScorers

**Files:**
- Modify: `index.html` — JS section, `generateScorers` function + name arrays

- [ ] **Replace the existing `initials`/`surnames` arrays and `generateScorers` function** with the following. Find the block starting `function generateScorers` and replace the entire function (including the two const arrays above it) with:

```js
const FIRST_NAMES = [
  // English
  'James','Harry','Jack','George','Mason','Declan','Bukayo','Trent','Jordan','Marcus',
  'Raheem','Phil','Aaron','Conor','Tommy','Luke','Oliver','Liam','Reece','Ben',
  // French
  'Kylian','Antoine','Ousmane','Théo','Aurélien','Tanguy','Jonathan','William','Adrien','Moussa',
  'Cheick','Rayan','Ibrahima','Mamadou','Ferland','Axel','Christopher','Lucas','Mattéo','Wesley',
  // Spanish
  'Pedri','Gavi','Marcos','Pablo','Diego','Carlos','Álvaro','Rodrigo','Sergio','Mikel',
  'Aymeric','Eric','Ander','Dani','Ferran','Joselu','Unai','Borja','Gerard','Yerlan',
  // Portuguese
  'Diogo','Rúben','Bernardo','João','Rafael','Nuno','Pedro','Tiago','André','Gonçalo',
  'Bruno','Vitinha','Matheus','Renato','Otávio','Pepe','Ricardo','Florentino','Wendell','Domingos',
  // Dutch
  'Virgil','Memphis','Davy','Denzel','Stefan','Frenkie','Cody','Xavi','Tijjani','Jeremie',
  'Ryan','Nathan','Donyell','Quilindschy','Jorrel','Brian','Guus','Wout','Lutsharel','Teun',
  // German
  'Leroy','Serge','Kai','Jamal','Thomas','Joshua','Niklas','Antonio','Benjamin','Marco',
  'Timo','Florian','Robin','Leon','Luca','Jonas','Kevin','Lukas','Felix','David',
  // Scandinavian
  'Erling','Martin','Alexander','Christian','Victor','Andreas','Emil','Rasmus','Kasper','Mikkel',
  'Daniel','Sebastian','Lasse','Mathias','Morten','Lars','Henrik','Nicolai','Birkir','Magnus',
  // African
  'Mohamed','Sadio','Wilfried','Nicolas','Ismaila','Naby','Idrissa','Cheikhou','Kalidou','Famara',
  'Yannick','Samuel','Emmanuel','Kelechi','Alex','Henry','Odion','Taiwo','Chisom','Okafor',
  // Brazilian
  'Gabriel','Roberto','Danilo','Douglas','Eder','Fabinho','Richarlison','Everton','Matheus','Vinicius',
  'Rodrygo','Antony','Raphinha','Renan','Endrick','Wesley','Paulinho','Willian','Malcom','Helinho',
  // Eastern European
  'Lukasz','Wojciech','Grzegorz','Kamil','Piotr','Tomasz','Radoslav','Jakub','Ondrej','Patrik',
  'Marek','Michal','Tomas','Jan','Petr','Pavel','Dominik','Filip','Adam','Lukas'
];

const LAST_NAMES = [
  // English
  'Smith','Jones','Williams','Taylor','Brown','Davies','Evans','Wilson','Thomas','Roberts',
  'Johnson','Walker','Wright','Robinson','Thompson','White','Jackson','Harris','Martin','Wood',
  'Lewis','Clark','Hall','Green','Turner',
  // French
  'Dupont','Bernard','Dubois','Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia',
  'David','Bertrand','Roux','Vincent','Fournier','Morel','Girard','Mercier','Lambert','Bonnet',
  'Blanc','Chevallier','Henry','Colin','Perrot',
  // Spanish
  'García','González','Rodríguez','Fernández','López','Martínez','Sánchez','Pérez','Gómez','Jiménez',
  'Ruiz','Hernández','Díaz','Moreno','Álvarez','Romero','Alonso','Gutiérrez','Navarro','Torres',
  'Domínguez','Ramos','Gil','Serrano','Blanco',
  // Portuguese
  'Silva','Santos','Ferreira','Pereira','Oliveira','Costa','Rodrigues','Martins','Sousa','Fernandes',
  'Gonçalves','Gomes','Lopes','Marques','Alves','Correia','Mendes','Nunes','Carvalho','Monteiro',
  'Moreira','Rocha','Ribeiro','Pinto','Cardoso',
  // Dutch
  'de Jong','van Dijk','Depay','Dumfries','Timber','Gravenberch','Wijnaldum','van Persie','Robben','Sneijder',
  'Kuyt','Blind','Strootman','Huntelaar','Bergkamp','Seedorf','Davids','Kluivert','Overmars','van Nistelrooy',
  'Gullit','Rijkaard','van Basten','de Bruyne','Promes',
  // German
  'Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann',
  'Koch','Bauer','Richter','Klein','Wolf','Schröder','Kroos','Kimmich','Neuer','Boateng',
  'Goretzka','Gnabry','Havertz','Werner','Brandt',
  // Scandinavian
  'Hansen','Nielsen','Jensen','Pedersen','Andersen','Christensen','Larsen','Sørensen','Rasmussen','Petersen',
  'Jørgensen','Madsen','Kristensen','Olsen','Thomsen','Eriksen','Haaland','Thorsby','Berge','Ryerson',
  'Meling','Bjørkan','Ajer','Lindström','Kulusevski',
  // African
  'Diallo','Traoré','Koné','Coulibaly','Touré','Diarra','Keita','Kouyaté','Ndoye','Niang',
  'Sarr','Mané','Diedhiou','Sow','Mbaye','Fall','Cissé','Ba','Koulibaly','Sissoko',
  'Sakho','Coman','Maiga','Camara','Diop',
  // Brazilian
  'Silva','Santos','Oliveira','Souza','Lima','Costa','Almeida','Barbosa','Cavalcanti','Nascimento',
  'Carvalho','Gomes','Marques','Teixeira','Freitas','Ramos','Braga','Cunha','Moura','Palhinha',
  'Firmino','Coutinho','Willian','Hulk','Robinho',
  // Eastern European
  'Kowalski','Nowak','Wójcik','Kamiński','Lewandowski','Zieliński','Szymański','Woźniak','Dąbrowski','Novák',
  'Dvořák','Procházka','Horáček','Svoboda','Blažek','Souček','Coufal','Havel','Krejčí','Pokorný',
  'Navrátil','Kratochvíl','Janda','Mašek','Duda'
];

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

function generateScorers(teams) {
  const scorers = [];
  for (const team of teams) {
    const rng = makeRng(strToSeed(team.id));
    const count = 2 + Math.floor(rng() * 2); // 2 or 3
    for (let i = 0; i < count; i++) {
      const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
      const last  = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
      scorers.push({ name: `${first} ${last}`, teamId: team.id, goals: 0, assists: 0 });
    }
  }
  return scorers;
}
```

- [ ] **Migrate old saved state** — in `init()`, after `state = JSON.parse(saved)`, add a migration line so existing saves without `assists` don't break:

```js
state.scorers = state.scorers.map(s => ({ assists: 0, ...s }));
```

- [ ] **Start server and verify:** `npm start` → open http://localhost:3000 → open DevTools console → run `localStorage.clear()` → reload → check Stats tab shows full names like "Marcus Silva" (no more "M. Hansen" format)

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: international player names with seeded RNG, add assists field"
```

---

## Task 2: Assists in simulation

**Files:**
- Modify: `index.html` — `generateEvents` and `applyResult` functions

- [ ] **Update `generateEvents`** — inside the goal loop, add an `assist` field. Each goal has a 75% chance of an assister (a different player from the same team). Replace the two goal-pushing loops:

```js
for (let i = 0; i < homeGoals; i++) {
  const scorer = randomScorer(fixture.homeId);
  const assist = Math.random() < 0.75 ? randomScorerExcluding(fixture.homeId, scorer) : null;
  events.push({ minute: randMinute(), type: 'goal', teamId: fixture.homeId, playerName: scorer, assist });
}
for (let i = 0; i < awayGoals; i++) {
  const scorer = randomScorer(fixture.awayId);
  const assist = Math.random() < 0.75 ? randomScorerExcluding(fixture.awayId, scorer) : null;
  events.push({ minute: randMinute(), type: 'goal', teamId: fixture.awayId, playerName: scorer, assist });
}
```

- [ ] **Add `randomScorerExcluding` helper** — place it right after `randomScorer`:

```js
function randomScorerExcluding(teamId, excludeName) {
  const pool = state.scorers.filter(s => s.teamId === teamId && s.name !== excludeName);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].name;
}
```

- [ ] **Update `applyResult`** — inside the `for (const ev of events)` loop, after the goals block, add:

```js
if (ev.type === 'goal' && ev.assist) {
  const assister = state.scorers.find(s => s.teamId === ev.teamId && s.name === ev.assist);
  if (assister) assister.assists++;
}
```

- [ ] **Start server and verify:** simulate a matchday → open Stats tab → players should start accumulating assists alongside goals after a few matchdays

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: add assists to match simulation (75% chance per goal)"
```

---

## Task 3: Randomise fixtures

**Files:**
- Modify: `index.html` — `generateFixtures` function

- [ ] **Replace `generateFixtures`** entirely with the version below. It adds a Fisher-Yates shuffle of the teams array (so no team is always the pivot) and shuffles match order within each matchday:

```js
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateFixtures(teams) {
  const ids = shuffle([...teams]).map(t => t.id);
  const n = ids.length; // 20
  const rotate = ids.slice(1);
  const firstHalf = [];

  for (let round = 0; round < n - 1; round++) {
    const circle = [ids[0], ...rotate];
    for (let i = 0; i < n / 2; i++) {
      firstHalf.push({ matchday: round + 1, homeId: circle[i], awayId: circle[n - 1 - i] });
    }
    rotate.unshift(rotate.pop());
  }

  const secondHalf = firstHalf.map(f => ({
    matchday: f.matchday + (n - 1),
    homeId: f.awayId,
    awayId: f.homeId
  }));

  const all = [...firstHalf, ...secondHalf];
  const byMatchday = {};
  for (const f of all) {
    (byMatchday[f.matchday] ??= []).push(f);
  }
  return Object.values(byMatchday).flatMap(matches => shuffle(matches));
}
```

- [ ] **Start server and verify:** `localStorage.clear()` → reload → Fixtures tab → Matchday 1 → confirm AFC 04 Rasby doesn't always appear as the first match

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: randomise fixture order (shuffled pivot + shuffled within matchdays)"
```

---

## Task 4: Standings table refactor — Superliga columns + Danish text

**Files:**
- Modify: `index.html` — `renderStandings`, `render`, `resetLeague`, modal button labels, `mdShowEvent` calls

This task changes column format (MÅL = `62 - 32`, DIFF, P) and all visible text to Danish. It introduces a shared `standingsTableHTML(rankedTeams, showForm)` helper used by all four standings tabs.

- [ ] **Add `standingsTableHTML` helper** — insert this new function after `renderFormBadges`:

```js
function standingsTableHTML(rankedTeams, showForm) {
  const rows = rankedTeams.map((team, i) => {
    const rank = i + 1;
    const zone = getZone(rank);
    const gd = team.gf - team.ga;
    const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
    const ptsClass = { cl: 'pts-cl', el: 'pts-el', rel: 'pts-rel', none: 'pts-mid' }[zone];
    const maal = `${team.gf} - ${team.ga}`;
    const formCell = showForm
      ? `<td>${renderFormBadges(team.id)}</td>`
      : `<td></td>`;
    return `
      <tr class="zone-${zone}">
        <td><span class="rank-badge rank-${zone}">${rank}</span></td>
        <td class="col-team">
          <div class="team-cell">
            <img class="team-logo" src="./logos/${team.logoFile}" alt="${esc(team.name)}">
            <span class="team-name">${esc(team.name)}</span>
          </div>
        </td>
        <td>${team.played}</td>
        <td>${team.won}</td>
        <td>${team.drawn}</td>
        <td>${team.lost}</td>
        <td>${maal}</td>
        <td>${gdStr}</td>
        ${formCell}
        <td class="${ptsClass}">${team.points}</td>
      </tr>`;
  }).join('');

  return `
    <table class="standings-table">
      <thead>
        <tr>
          <th style="width:32px;">#</th>
          <th class="col-team">Hold</th>
          <th>K</th><th>V</th><th>U</th><th>T</th>
          <th>MÅL</th><th>DIFF</th>
          <th>Form</th>
          <th>P</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
```

- [ ] **Replace `renderStandings`** with a version that uses the new helper:

```js
function renderStandings() {
  const sorted = [...state.teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdDiff = (b.gf - b.ga) - (a.gf - a.ga);
    if (gdDiff !== 0) return gdDiff;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });

  document.getElementById('tab-stilling').innerHTML = `
    <div class="section-label">
      ${state.currentMatchday > 0 ? `Runde ${state.currentMatchday} af 38` : 'Før sæsonen'}
    </div>
    ${standingsTableHTML(sorted, true)}
    <div class="standings-legend">
      <div class="legend-item"><div class="legend-dot" style="background:#4caf50"></div>Champions League (1–4)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#4a8fff"></div>Europa League (5–6)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ff5252"></div>Nedrykning (18–20)</div>
    </div>`;
}
```

- [ ] **Update `render()`** — change the subtitle and simulate button text:

```js
// Replace:
state.currentMatchday > 0
  ? `Season 1 · Matchday ${state.currentMatchday} of 38`
  : 'Season 1 · Pre-season'
// With:
state.currentMatchday > 0
  ? `Sæson 1 · Runde ${state.currentMatchday} af 38`
  : 'Sæson 1 · Før sæsonen'

// Replace button labels:
simBtn.textContent = `Resume matchday ${state.currentMatchday}`  →  `Fortsæt runde ${state.currentMatchday}`
simBtn.textContent = next <= 38 ? `Simulate matchday ${next}` : 'Season complete'
                  →  next <= 38 ? `Simuler runde ${next}` : 'Sæson afsluttet'
```

- [ ] **Update `resetLeague`** — change confirm message:

```js
// Replace:
if (!confirm('Reset the league? All progress will be cleared.')) return;
// With:
if (!confirm('Nulstil ligaen? Al fremgang slettes.')) return;
```

- [ ] **Update modal button labels** — in `showMatch`:
```js
document.getElementById('md-primary-btn').textContent = 'Spark af →';
```
In `playEvents` tick function:
```js
document.getElementById('md-primary-btn').textContent = isLast ? 'Luk' : 'Næste kamp →';
```

- [ ] **Update `mdShowEvent` calls** in `playEvents`:
```js
mdShowEvent('⚽', 'MÅL!', ...)
mdShowEvent('💨', 'Stor chance!', ...)
mdShowEvent('💛', 'Gult kort', ...)
```

- [ ] **Update skip button** — in HTML:
```html
<button id="md-skip-btn" onclick="mdSkip()" style="display:none">Spring til resultat</button>
```

- [ ] **Update reset button** — in HTML:
```html
<button class="reset-btn" onclick="resetLeague()">↺ Nulstil</button>
```

- [ ] **Start server and verify:** reload → standings table shows MÅL column with `X - Y` format, DIFF with sign, P for points, button says "Simuler runde 1", modal says "Spark af →" when opened

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: Superliga column format (MÅL/DIFF/P) and full Danish UI text"
```

---

## Task 5: New tab structure (6 tabs)

**Files:**
- Modify: `index.html` — HTML tab list + tab content divs + `switchTab`/`render` routing

- [ ] **Replace the tab HTML** (the `.tabs` div) with 6 tabs:

```html
<div class="tabs">
  <div class="tab active" data-tab="stilling"  onclick="switchTab('stilling')">Stilling</div>
  <div class="tab"        data-tab="hjemme"    onclick="switchTab('hjemme')">Hjemme</div>
  <div class="tab"        data-tab="ude"       onclick="switchTab('ude')">Ude</div>
  <div class="tab"        data-tab="form"      onclick="switchTab('form')">Form</div>
  <div class="tab"        data-tab="kampe"     onclick="switchTab('kampe')">Kampe</div>
  <div class="tab"        data-tab="statistik" onclick="switchTab('statistik')">Statistik</div>
</div>
```

- [ ] **Replace the tab content divs** (the four `<div id="tab-*">` divs) with six:

```html
<div id="tab-stilling"  class="tab-content active"></div>
<div id="tab-hjemme"    class="tab-content"></div>
<div id="tab-ude"       class="tab-content"></div>
<div id="tab-form"      class="tab-content"></div>
<div id="tab-kampe"     class="tab-content"></div>
<div id="tab-statistik" class="tab-content"></div>
```

- [ ] **Update `activeTab` initial value** at the top of the script:
```js
let activeTab = 'stilling';
```

- [ ] **Update `render()`** routing block — replace the `if/else` chain at the bottom:

```js
if      (activeTab === 'stilling')  renderStandings();
else if (activeTab === 'hjemme')    renderHjemme();
else if (activeTab === 'ude')       renderUde();
else if (activeTab === 'form')      renderForm();
else if (activeTab === 'kampe')     renderKampe();
else if (activeTab === 'statistik') renderStats();
```

- [ ] **Start server and verify:** 6 tabs appear, clicking each does not crash (functions not yet implemented will just leave the tab empty — that's fine for now)

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: 6-tab structure (Stilling/Hjemme/Ude/Form/Kampe/Statistik)"
```

---

## Task 6: Hjemme and Ude tabs

**Files:**
- Modify: `index.html` — add `computeFilteredStandings`, `renderHjemme`, `renderUde`

- [ ] **Add `computeFilteredStandings`** — insert after `renderStandings`:

```js
function computeFilteredStandings(homeOrAway) {
  return state.teams.map(team => {
    const relevant = state.results.filter(r =>
      homeOrAway === 'home' ? r.homeId === team.id : r.awayId === team.id
    );
    let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, points = 0;
    for (const r of relevant) {
      const isHome = r.homeId === team.id;
      const scored = isHome ? r.homeGoals : r.awayGoals;
      const conceded = isHome ? r.awayGoals : r.homeGoals;
      played++;
      gf += scored; ga += conceded;
      if (scored > conceded)      { won++;   points += 3; }
      else if (scored === conceded){ drawn++; points += 1; }
      else                         { lost++; }
    }
    return { ...team, played, won, drawn, lost, gf, ga, points };
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdDiff = (b.gf - b.ga) - (a.gf - a.ga);
    if (gdDiff !== 0) return gdDiff;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}
```

- [ ] **Add `renderHjemme` and `renderUde`** right after `computeFilteredStandings`:

```js
function renderHjemme() {
  const sorted = computeFilteredStandings('home');
  document.getElementById('tab-hjemme').innerHTML = `
    <div class="section-label">Hjemmekampe</div>
    ${standingsTableHTML(sorted, false)}`;
}

function renderUde() {
  const sorted = computeFilteredStandings('away');
  document.getElementById('tab-ude').innerHTML = `
    <div class="section-label">Udekampe</div>
    ${standingsTableHTML(sorted, false)}`;
}
```

- [ ] **Start server and verify:** simulate a few matchdays → click Hjemme → table shows re-ranked standings based on home-only results; click Ude → same for away. No form badges in these tabs.

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: Hjemme and Ude standings tabs"
```

---

## Task 7: Form tab

**Files:**
- Modify: `index.html` — add `computeFormStandings`, `renderForm`

- [ ] **Add `computeFormStandings`** — insert after `renderUde`:

```js
function computeFormStandings() {
  return state.teams.map(team => {
    const recent = state.results
      .filter(r => r.homeId === team.id || r.awayId === team.id)
      .sort((a, b) => b.matchday - a.matchday)
      .slice(0, 5);
    let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, points = 0;
    for (const r of recent) {
      const isHome = r.homeId === team.id;
      const scored = isHome ? r.homeGoals : r.awayGoals;
      const conceded = isHome ? r.awayGoals : r.homeGoals;
      played++;
      gf += scored; ga += conceded;
      if (scored > conceded)       { won++;   points += 3; }
      else if (scored === conceded) { drawn++; points += 1; }
      else                          { lost++; }
    }
    return { ...team, played, won, drawn, lost, gf, ga, points };
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdDiff = (b.gf - b.ga) - (a.gf - a.ga);
    if (gdDiff !== 0) return gdDiff;
    return a.name.localeCompare(b.name);
  });
}
```

- [ ] **Add `renderForm`** right after:

```js
function renderForm() {
  const sorted = computeFormStandings();
  document.getElementById('tab-form').innerHTML = `
    <div class="section-label">Form — seneste 5 kampe</div>
    ${standingsTableHTML(sorted, true)}`;
}
```

- [ ] **Start server and verify:** simulate 6+ matchdays → click Form → ranking differs from Stilling and reflects recent performance. Form badges are shown.

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: Form tab (last-5-games standings)"
```

---

## Task 8: Kampe tab (merged results + fixtures)

**Files:**
- Modify: `index.html` — add `renderKampe`, remove old `renderResults`/`renderFixtures` (or leave them unused)

- [ ] **Add `renderKampe`** — insert after `renderForm`. Past matchdays show scores; future show "vs":

```js
function renderKampe() {
  const allMatchdays = [...new Set([
    ...state.fixtures.map(f => f.matchday),
    ...state.results.map(r => r.matchday)
  ])].sort((a, b) => a - b);

  const nextUnplayed = allMatchdays.find(md => md > state.currentMatchday)
    ?? allMatchdays[allMatchdays.length - 1];

  function buildMatchdayHTML(matchday) {
    const isPast = matchday <= state.currentMatchday;
    if (isPast) {
      const matches = state.results.filter(r => r.matchday === matchday);
      return `<div class="results-grid">${matches.map(r => {
        const home = state.teams.find(t => t.id === r.homeId) ?? { logoFile: '', name: 'Unknown' };
        const away = state.teams.find(t => t.id === r.awayId) ?? { logoFile: '', name: 'Unknown' };
        return `
          <div class="result-card">
            <div class="result-team">
              <img class="team-logo" src="./logos/${home.logoFile}" alt="${esc(home.name)}">
              <span class="result-team-name">${esc(home.name)}</span>
            </div>
            <span class="result-score">${r.homeGoals}–${r.awayGoals}</span>
            <div class="result-team away">
              <img class="team-logo" src="./logos/${away.logoFile}" alt="${esc(away.name)}">
              <span class="result-team-name">${esc(away.name)}</span>
            </div>
          </div>`;
      }).join('')}</div>`;
    } else {
      const matches = state.fixtures.filter(f => f.matchday === matchday);
      return `<div class="fixtures-grid">${matches.map(f => {
        const home = state.teams.find(t => t.id === f.homeId) ?? { logoFile: '', name: 'Unknown' };
        const away = state.teams.find(t => t.id === f.awayId) ?? { logoFile: '', name: 'Unknown' };
        return `
          <div class="fixture-card">
            <div class="fixture-team">
              <img class="team-logo" src="./logos/${home.logoFile}" alt="${esc(home.name)}">
              <span class="fixture-team-name">${esc(home.name)}</span>
            </div>
            <span class="fixture-vs">vs</span>
            <div class="fixture-team away">
              <img class="team-logo" src="./logos/${away.logoFile}" alt="${esc(away.name)}">
              <span class="fixture-team-name">${esc(away.name)}</span>
            </div>
          </div>`;
      }).join('')}</div>`;
    }
  }

  const options = allMatchdays.map(md => {
    const label = md <= state.currentMatchday ? `Runde ${md} ✓` : `Runde ${md}`;
    return `<option value="${md}" ${md === nextUnplayed ? 'selected' : ''}>${label}</option>`;
  }).join('');

  document.getElementById('tab-kampe').innerHTML = `
    <div class="results-controls">
      <div class="section-label" style="margin:0">Runde</div>
      <select class="matchday-select" id="kampe-select" onchange="updateKampeMatchday(this.value)">
        ${options}
      </select>
    </div>
    <div id="kampe-content">${buildMatchdayHTML(nextUnplayed)}</div>`;

  window.updateKampeMatchday = md => {
    document.getElementById('kampe-content').innerHTML = buildMatchdayHTML(Number(md));
  };
}
```

- [ ] **Start server and verify:** simulate some matchdays → Kampe tab → dropdown shows "Runde X ✓" for past rounds and "Runde X" for future → past shows scores, future shows "vs"

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: Kampe tab merging results and fixtures"
```

---

## Task 9: Statistik tab with assists

**Files:**
- Modify: `index.html` — `renderStats` function

- [ ] **Replace `renderStats`** entirely:

```js
function renderStats() {
  const sorted = [...state.scorers].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return (b.assists ?? 0) - (a.assists ?? 0);
  });

  if (sorted.every(s => s.goals === 0)) {
    document.getElementById('tab-statistik').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>Ingen resultater endnu. Simuler en runde for at se statistik her.</p>
      </div>`;
    return;
  }

  const rows = sorted.map((scorer, i) => {
    const team = state.teams.find(t => t.id === scorer.teamId) ?? { logoFile: '', name: 'Unknown' };
    return `
      <tr>
        <td>${i + 1}</td>
        <td class="col-player">${esc(scorer.name)}</td>
        <td class="col-player">
          <div class="team-cell">
            <img class="team-logo" src="./logos/${team.logoFile}" alt="${esc(team.name)}">
            <span style="color:#888;font-size:12px;">${esc(team.name)}</span>
          </div>
        </td>
        <td class="goals-cell">${scorer.goals}</td>
        <td style="font-weight:600;color:#aaa;">${scorer.assists ?? 0}</td>
      </tr>`;
  }).join('');

  document.getElementById('tab-statistik').innerHTML = `
    <div class="section-label">Topscorere</div>
    <table class="stats-table">
      <thead>
        <tr>
          <th style="width:32px;">#</th>
          <th class="col-player">Spiller</th>
          <th class="col-player">Klub</th>
          <th>Mål</th>
          <th>Assist</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
```

- [ ] **Start server and verify:** simulate several matchdays → Statistik tab → table shows Mål and Assist columns, players have values in both

- [ ] **Commit:**
```bash
git add index.html
git commit -m "feat: Statistik tab with assists column"
```

---

## Task 10: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Update the State Shape section** to reflect `assists` on scorers:

```
scorers:  [{ name, teamId, goals, assists }],
```

- [ ] **Update the Backlog section** — mark items 1–3 as done and remove "assists" note if listed separately.

- [ ] **Commit:**
```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new state shape and completed backlog items"
```

---

## Self-review

**Spec coverage:**
- ✅ 200 first + 250 surnames → Task 1
- ✅ Deterministic seeded RNG → Task 1
- ✅ 6 tabs: Stilling/Hjemme/Ude/Form/Kampe/Statistik → Tasks 4–9
- ✅ MÅL X-Y / DIFF / P columns → Task 4
- ✅ Superliga column order → Task 4
- ✅ Danish text throughout → Task 4
- ✅ Hjemme (home-only standings) → Task 6
- ✅ Ude (away-only standings) → Task 6
- ✅ Form (last-5 standings) → Task 7
- ✅ Kampe (merged results + fixtures) → Task 8
- ✅ Assists in simulation (75%) → Task 2
- ✅ Assists in Statistik table → Task 9
- ✅ Random fixtures (shuffle pivot + within matchdays) → Task 3
- ✅ State migration for assists → Task 1

**No placeholders found.**

**Type consistency:** `standingsTableHTML` is defined in Task 4 and called in Tasks 4, 6, 7 using `(rankedTeams, showForm)` — consistent. `computeFilteredStandings` returns objects with `{ played, won, drawn, lost, gf, ga, points }` matching what `standingsTableHTML` reads — consistent. `randomScorerExcluding` defined and called in Task 2 — consistent.

# GitHub Pages Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the league simulator playable in a browser with no server, by replacing server-side save calls with `localStorage` and deploying to GitHub Pages.

**Architecture:** Three targeted edits to `index.html` swap `fetch('/save')` GET/POST for `localStorage` and `fetch('/teams')` for `fetch('./teams.json')`. A matching `/teams.json` route is added to `server.js` so local dev continues to work. No new files are created.

**Tech Stack:** Vanilla JS, localStorage API, GitHub Pages (static hosting)

---

## File Map

| File | Change |
|---|---|
| `index.html` | Replace server fetch calls with localStorage; fix stale error message |
| `server.js` | Add `/teams.json` route so local dev matches the new URL |

---

### Task 1: Add `/teams.json` route to server.js

This ensures `fetch('./teams.json')` works both locally (via Express) and on GitHub Pages (static file). Without this, local dev breaks after the index.html change.

**Files:**
- Modify: `server.js`

- [ ] **Step 1: Add the route**

In `server.js`, add this line immediately after the existing `/teams` route (after line 29):

```js
app.get('/teams.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'teams.json'));
});
```

The file should now look like:

```js
app.get('/teams', (req, res) => {
  res.sendFile(path.join(__dirname, 'teams.json'));
});

app.get('/teams.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'teams.json'));
});
```

- [ ] **Step 2: Verify locally**

Run `npm start`, then open `http://localhost:3000/teams.json` in a browser.  
Expected: JSON array of team objects is displayed.

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat: serve teams.json at /teams.json for static hosting compatibility"
```

---

### Task 2: Replace `fetch('/teams')` in index.html

**Files:**
- Modify: `index.html` (line 200)

- [ ] **Step 1: Update the fetch URL**

In `loadTeams()` (line 200), change:

```js
const res = await fetch('/teams');
```

to:

```js
const res = await fetch('./teams.json');
```

- [ ] **Step 2: Verify locally**

With `npm start` running, open `http://localhost:3000` and click "Reset League" (confirm the dialog). The league should regenerate successfully — teams load from the new URL.  
Expected: standings reset, no console errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: load teams from static teams.json path"
```

---

### Task 3: Replace `saveState()` with localStorage

**Files:**
- Modify: `index.html` (lines 259–270)

- [ ] **Step 1: Rewrite the function body**

Replace the entire body of `saveState()` (lines 259–270):

```js
async function saveState() {
  try {
    const res = await fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (!res.ok) console.error('Save failed:', res.status);
  } catch (err) {
    console.error('Save failed:', err);
  }
}
```

with:

```js
async function saveState() {
  localStorage.setItem('magnes-liga', JSON.stringify(state));
}
```

Keep `async` — it is awaited on lines 285 and 545.

- [ ] **Step 2: Verify locally**

With `npm start` running, open `http://localhost:3000`. Simulate a matchday (or use Reset League). Open DevTools → Application → Local Storage → `http://localhost:3000`. A key `magnes-liga` should appear with a JSON string as its value.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: save league state to localStorage instead of server"
```

---

### Task 4: Replace `init()` load with localStorage

**Files:**
- Modify: `index.html` (lines 272–288)

- [ ] **Step 1: Rewrite the load logic**

Replace the fetch inside `init()` (lines 272–288):

```js
async function init() {
  const res = await fetch('/save');
  if (res.ok) {
    state = await res.json();
  } else {
    const teams = await loadTeams();
    state = {
      teams,
      fixtures: generateFixtures(teams),
      results: [],
      scorers: generateScorers(teams),
      currentMatchday: 0
    };
    await saveState();
  }
  render();
}
```

with:

```js
async function init() {
  const saved = localStorage.getItem('magnes-liga');
  if (saved) {
    state = JSON.parse(saved);
  } else {
    const teams = await loadTeams();
    state = {
      teams,
      fixtures: generateFixtures(teams),
      results: [],
      scorers: generateScorers(teams),
      currentMatchday: 0
    };
    await saveState();
  }
  render();
}
```

- [ ] **Step 2: Verify save round-trip locally**

With `npm start` running, open `http://localhost:3000`.

Test A — Fresh start: Open DevTools → Application → Local Storage, delete the `magnes-liga` key, refresh the page. The league should initialise fresh with new teams.

Test B — Persisted load: Refresh the page without clearing localStorage. The league should show the same standings as before the refresh.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: load league state from localStorage on startup"
```

---

### Task 5: Fix stale error message in resetLeague

The `resetLeague` catch block (line 549) says "Is the server running?" — no longer relevant.

**Files:**
- Modify: `index.html` (line 549)

- [ ] **Step 1: Update the alert**

Change line 549:

```js
    alert('Reset failed. Is the server running?');
```

to:

```js
    alert('Reset failed.');
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "fix: remove stale server-running message from reset error"
```

---

### Task 6: Deploy to GitHub Pages

This task is manual — no code changes.

- [ ] **Step 1: Push the repo to GitHub**

If the repo is not yet on GitHub, create a new repo at github.com, then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin master
```

If it is already on GitHub:

```bash
git push
```

- [ ] **Step 2: Enable GitHub Pages**

1. Open the repo on github.com
2. Go to **Settings → Pages**
3. Under "Source", select **Deploy from a branch**
4. Branch: **master** (or main), Folder: **/ (root)**
5. Click **Save**

GitHub will show a URL like `https://<username>.github.io/<repo-name>/` — it takes ~1 minute to go live.

- [ ] **Step 3: Verify on GitHub Pages**

Open the URL in a browser (not localhost). The league should load, standings should display, and progress should persist across page refreshes (check via DevTools → Application → Local Storage for that origin).

- [ ] **Step 4: Test on iPad**

Send the URL to the kid's iPad. Open it in Safari. Play through a matchday, close Safari completely, reopen it, navigate back to the URL. Progress should be intact.

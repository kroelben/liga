# Dismissible Matchday Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the matchday playback modal a centered dialog (not fullscreen), add a × dismiss button, and let the user resume playback later via a "Resume matchday X" button.

**Architecture:** All 10 match results are already computed and saved when Simulate is clicked — the modal is purely animated playback. The resume mechanism keeps `mdState` alive (not nulled) when the modal is dismissed, and routes the simulate button to `mdResume()` instead of `simulateMatchday()` when playback is in progress.

**Tech Stack:** Vanilla JS, HTML, CSS — single file `index.html`. Express server (`server.js`) is unchanged. No build step; verify by running `npm start` and opening `http://localhost:3000`.

---

## File Map

| File | What changes |
|---|---|
| `index.html:178-189` | Resize `#md-modal` backdrop + `#md-card` from fullscreen to centered dialog |
| `index.html:220-225` | Add CSS for `#md-dismiss-btn` after `#md-skip-btn` styles |
| `index.html:376-381` | Update `render()` simulate-button block to show Resume state |
| `index.html:664-666` | Add early-return to `simulateMatchday()` when `mdState` exists |
| `index.html:790-796` | Add `mdDismiss()` and `mdResume()` functions after `mdClose()`; update `mdClose()` to call `render()` instead of manually patching the button |
| `index.html:827` | Add `#md-dismiss-btn` HTML as first child of `#md-card` |

---

## Task 1: Resize modal to centered dialog

**Files:**
- Modify: `index.html:178-189` (CSS), `index.html:220-225` (CSS)

- [ ] **Step 1: Update `#md-modal` backdrop opacity**

In `index.html`, replace lines 178–182:

```css
  #md-modal {
    position: fixed; inset: 0; z-index: 100;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.75);
  }
```

- [ ] **Step 2: Update `#md-card` to centered dialog size**

Replace lines 183–189:

```css
  #md-card {
    width: 420px; max-width: 92vw; max-height: 88vh;
    background: #13131e;
    border-radius: 16px;
    display: flex; flex-direction: column;
    padding: 32px 28px 28px;
    overflow-y: auto;
    position: relative;
  }
```

Key changes: removes `height: 100dvh`, adds `width: 420px`, `max-width: 92vw`, `max-height: 88vh`, `border-radius: 16px`, `position: relative` (needed for the absolute-positioned dismiss button in Task 2), changes `overflow: hidden` → `overflow-y: auto`.

- [ ] **Step 3: Add CSS for `#md-dismiss-btn` after `#md-skip-btn` block**

After the closing brace of `#md-skip-btn` (currently line 225), add:

```css
  #md-dismiss-btn {
    position: absolute; top: 14px; right: 16px;
    background: transparent; border: none; color: #555;
    font-size: 20px; line-height: 1; cursor: pointer;
    padding: 4px 8px; border-radius: 6px; font-family: inherit;
  }
  #md-dismiss-btn:hover { color: #ccc; background: #1e1e2a; }
```

- [ ] **Step 4: Verify visually**

Run `npm start`, open `http://localhost:3000`, simulate a matchday. The modal should appear as a centered card (not fullscreen), with rounded corners and the app dimly visible behind it. The × button is not yet functional — that's Task 2.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: resize matchday modal to centered dialog"
```

---

## Task 2: Add dismiss button HTML and wire up mdDismiss() / mdResume()

**Files:**
- Modify: `index.html:827` (HTML), `index.html:790` (JS — add functions after `mdClose`)

- [ ] **Step 1: Add dismiss button to modal HTML**

In `index.html`, `#md-card` starts at line 827. Add `#md-dismiss-btn` as its first child:

```html
<div id="md-card">
  <button id="md-dismiss-btn" onclick="mdDismiss()">×</button>
  <div id="md-header"></div>
```

- [ ] **Step 2: Add `mdDismiss()` function**

After the closing brace of `mdClose()` (currently ends around line 796), add:

```javascript
function mdDismiss() {
  if (!mdState) return;
  if (mdState.eventTimer) mdSkip();
  document.getElementById('md-modal').style.display = 'none';
  render();
}
```

`mdSkip()` already handles: clear timer, snap scores to final, hide skip button, set primary button text to "Next match →" or "Close". Calling it here means the user resumes at a clean post-match state rather than mid-animation.

- [ ] **Step 3: Add `mdResume()` function**

Immediately after `mdDismiss()`:

```javascript
function mdResume() {
  if (!mdState) return;
  document.getElementById('md-modal').style.display = 'flex';
  const simBtn = document.getElementById('simulate-btn');
  if (simBtn) simBtn.disabled = true;
}
```

- [ ] **Step 4: Verify dismiss behaviour**

Run `npm start`. Simulate a matchday. Click Kick off to start a match mid-animation, then click ×.

Expected:
- Modal disappears
- The app is fully interactive again
- Simulate button still shows "Simulate matchday N+1" (Resume state wiring is Task 3 — that's fine for now)
- Open browser console, type `mdState` — it should NOT be `null`; it should show an object with `matchResults`, `matchIndex`, etc.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add dismiss button and mdDismiss/mdResume functions"
```

---

## Task 3: Wire Resume state into render() and simulateMatchday()

**Files:**
- Modify: `index.html:790-796` (`mdClose()`)
- Modify: `index.html:376-381` (`render()` simulate-button block)
- Modify: `index.html:664-666` (top of `simulateMatchday()`)

- [ ] **Step 1: Update `mdClose()` to call `render()` instead of manually patching the button**

`mdClose()` currently ends with:
```javascript
  const simBtn = document.getElementById('simulate-btn');
  if (simBtn) simBtn.disabled = state.currentMatchday >= 38;
```

Replace those two lines with a single `render()` call:

```javascript
function mdClose() {
  if (mdState && mdState.eventTimer) clearTimeout(mdState.eventTimer);
  mdState = null;
  document.getElementById('md-modal').style.display = 'none';
  render();
}
```

`render()` (after the change in Step 2 below) correctly sets both button text and disabled state based on whether `mdState` is null. Without this, after natural close the button would keep showing "Resume matchday N".

- [ ] **Step 2: Update simulate-button block in `render()`**

Replace lines 376–381:

```javascript
  const simBtn = document.getElementById('simulate-btn');
  if (simBtn) {
    if (mdState) {
      simBtn.textContent = `Resume matchday ${state.currentMatchday}`;
      simBtn.disabled = false;
    } else {
      const next = state.currentMatchday + 1;
      simBtn.textContent = next <= 38 ? `Simulate matchday ${next}` : 'Season complete';
      simBtn.disabled = state.currentMatchday >= 38;
    }
  }
```

- [ ] **Step 3: Add early-return to `simulateMatchday()`**

`simulateMatchday()` currently starts (line 664):

```javascript
async function simulateMatchday() {
  const nextMatchday = state.currentMatchday + 1;
```

Add a guard as the very first line of the function body:

```javascript
async function simulateMatchday() {
  if (mdState) { mdResume(); return; }
  const nextMatchday = state.currentMatchday + 1;
```

This ensures that if the simulate button is clicked while `mdState` is alive (e.g. via keyboard shortcut or any other path), it resumes rather than double-simulating.

- [ ] **Step 4: Verify full resume flow**

Run `npm start`. Simulate a matchday:

1. Modal opens — click Kick off, let a few events fire, then click ×
2. Modal dismisses — simulate button now reads **"Resume matchday N"**
3. Click "Resume matchday N" — modal re-opens showing the current match at final score, primary button showing "Next match →" or "Close"
4. Navigate through remaining matches normally
5. Click Close on the final match — simulate button reverts to **"Simulate matchday N+1"**

Also verify the edge case: dismiss before clicking Kick off (pendingKickoff = true). On resume the modal should show the same match waiting for Kick off.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: show Resume button and route simulate button through mdState"
```

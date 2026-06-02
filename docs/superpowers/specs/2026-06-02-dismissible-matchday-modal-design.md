# Dismissible Matchday Modal — Design Spec

**Date:** 2026-06-02

## Summary

Make the matchday playback modal non-fullscreen and dismissible mid-round, with the ability to resume playback from where it was left off. All 10 match results are already computed and saved at simulation time; the modal is purely for animated playback, so "resuming" is a matter of keeping `mdState` alive when the modal is hidden.

## Context

`simulateMatchday()` computes all 10 results immediately, saves them to `state`, and then opens the modal for animated playback. Currently `mdClose()` nulls `mdState`, destroying all playback progress. The modal card is styled `width: 100%; height: 100dvh` — genuinely full-screen.

## Approach

Option A: keep `mdState` alive in memory. Dismiss hides the modal but preserves the in-progress playback state. A "Resume" button re-opens it. Survives until page refresh (acceptable since the actual results are already persisted in `save.json`).

## Design

### 1. Modal size

`#md-card` changes from full-screen to a centered dialog:

```css
width: 420px;
max-width: 92vw;
max-height: 88vh;
border-radius: 16px;
overflow-y: auto;
```

The backdrop opacity lightens slightly (`rgba(0,0,0,0.75)`) since the app behind is now contextually visible.

### 2. Dismiss button

A small `×` button (`#md-dismiss-btn`) is added to the top-right of `#md-card`. It is always visible while the modal is open.

### 3. `mdDismiss()` function

New function called by the `×` button:

1. Clear `mdState.eventTimer` (pause any in-progress animation)
2. If a match was mid-play (timer was running), snap to final score for that match — same effect as pressing Skip — so on resume the user lands at a clean "Next match →" or "Close" state, not mid-animation
3. Set `document.getElementById('md-modal').style.display = 'none'`
4. Do **not** null `mdState`
5. Call `render()` to update the simulate button

### 4. Simulate button — resume state

`render()` gains a check: if `mdState !== null`, set button text to `Resume matchday ${state.currentMatchday}` and `disabled = false`, instead of the normal "Simulate matchday N+1" text. This is the only entry point for resuming.

### 5. Resume

Clicking "Resume matchday X" calls `openMatchdayModal()` passing the existing `mdState.matchResults`. Since `mdState` is still populated, the modal re-opens at `matchIndex` with the correct scores and the primary button ready ("Next match →" or "Close").

`openMatchdayModal()` is adjusted to accept optional existing state: if `mdState` already exists (resume path), skip re-initialising `matchIndex` and `pendingKickoff` and simply re-show the modal.

### 6. Natural close

After the final match the user clicks **Close**, which calls `mdClose()` as today. `mdClose()` clears `mdState = null` and re-enables the normal simulate button for the next matchday. No change to this path.

## Files changed

| File | Changes |
|---|---|
| `index.html` | CSS: resize `#md-card`, add `×` button styles. HTML: add `#md-dismiss-btn` inside `#md-card`. JS: add `mdDismiss()`, adjust `openMatchdayModal()` for resume path, update `render()` to show Resume button when `mdState !== null` |

## Out of scope

- Persisting resume state across page refresh (localStorage) — results are saved; only the animated replay is lost on refresh, which is acceptable
- Any other modal content changes

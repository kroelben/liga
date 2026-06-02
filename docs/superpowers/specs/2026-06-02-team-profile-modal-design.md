# Team Profile Modal — Design Spec

**Date:** 2026-06-02

## Overview

Clicking a team row in the standings table opens a modal showing that team's profile. The top portion is read-only (name, crest). The middle row shows the shirt alongside editable stadium info. The bottom section has editable skill sliders. All changes auto-save.

---

## Trigger

Any click on a team `<tr>` in the standings table opens the team modal for that team. The row already has a `onclick` via the rendered HTML.

---

## Modal Layout

```
┌─────────────────────────────┐
│  [logo]  Team Name          │  ← read-only header
├─────────────────────────────┤
│  [shirt]  Stadion: ______   │  ← shirt left, stadium + capacity right
│           Kapacitet: ____   │
├─────────────────────────────┤
│  KOMPETENCER                │  ← section label
│  Forsvar  [  __  ]          │
│  Kontrol  [  __  ]          │
│  Angreb   [  __  ]          │
├─────────────────────────────┤
│           [Luk]             │
└─────────────────────────────┘
```

- Shirt image: `height: 120px`, same `/shirts/` path as matchday modal
- Stadium + capacity inputs: `type="text"` and `type="number"` respectively, no `min`/`max` enforced in UI
- Skills: `type="number"`, `min="1"`, `max="100"` — blank by default until user sets them
- All inputs: `placeholder` shows the field label (e.g. `placeholder="Stadion"`)
- "Luk" button closes the modal

---

## State Changes

Five new optional fields added to each team object. Added in `loadTeams()` with empty-string defaults so existing saves migrate transparently on next load:

```js
stadiumName: '',
capacity:    '',
forsvar:     '',
kontrol:     '',
angreb:      ''
```

Existing `strength` field is **unchanged** — it still drives match simulation.

The `state.teams` array in `CLAUDE.md` should be updated to reflect the new fields.

---

## Auto-Save

Each input has an `oninput` handler that:
1. Writes the value back to `state.teams.find(t => t.id === teamId)[field]`
2. Calls `saveState()`

---

## Implementation Notes

- Modal reuses the same overlay/card pattern as the matchday modal (`position:fixed`, dark background, centered card)
- Close on "Luk" button; no close-on-backdrop-click needed
- No validation — values are freeform; the number inputs rely on browser behaviour for type enforcement
- Modal is injected into the DOM once (like `md-modal`) and populated dynamically when a team is clicked

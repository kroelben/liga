# GitHub Pages Hosting Design

**Date:** 2026-05-21  
**Goal:** Make the league simulator accessible from a kid's iPad via a public URL, with save state persisted in the browser's localStorage.

## Summary

Convert the single-file frontend to run without the Express backend by replacing server-side save calls with `localStorage`, and deploy to GitHub Pages as a static site.

## Changes to index.html

Three targeted edits — nothing else changes:

1. **`loadTeams()` (line 200):** Change `fetch('/teams')` → `fetch('./teams.json')`. The file is already in the repo; GitHub Pages serves it at the same relative path.

2. **`saveState()` (lines 261–269):** Replace the `fetch('/save', { method: 'POST', ... })` call with:
   ```js
   localStorage.setItem('magnes-liga', JSON.stringify(state));
   ```
   Keep the `async` keyword — it is called with `await` on lines 285 and 545, and removing `async` would require updating both call sites unnecessarily.

3. **`init()` (lines 272–287):** Replace `const res = await fetch('/save')` and its `if (res.ok)` block with:
   ```js
   const saved = localStorage.getItem('magnes-liga');
   if (saved) {
     state = JSON.parse(saved);
   } else { ... }
   ```

## Data persistence

Save state lives in Safari's localStorage on the iPad (~few KB). It survives tab closes, app quits, and restarts. It can be cleared by "Clear History and Website Data" in iOS Settings or under extreme storage pressure — accepted risk.

## GitHub Pages setup (manual, one-time)

1. Push the repo to GitHub (if not already).
2. Settings → Pages → Source: main branch, root folder → Save.
3. URL: `https://<username>.github.io/<repo-name>/`
4. Share the URL with the kid.

`server.js` and `package.json` remain in the repo — GitHub Pages ignores them. The local Express server continues to work unchanged for development.

## Out of scope

- Export/import save buttons
- Cloud-backed save
- Custom domain

# SignGloss — Dev B Context

## Current Progress

All Dev B tasks across all 4 phases are complete. Audit fixes applied. UI refinement pass complete.

### UI Refinement Pass

Visual direction: minimal, clean, professional (SaaS-like dark theme).

**Styling changes (css/style.css)**
- Replaced neon color palette (#6c63ff, #00d4ff) with muted grays and whites
- Removed all glow effects (box-shadow glow, hover glow)
- Removed gradient text, gradient backgrounds, gradient borders
- Reduced border-radius from 12–16px to 6–8px across all components
- Removed hover transforms (translateY -4px) — now subtle border-color change only
- Removed the ::before gradient accent bar on cards
- Removed the ::after shimmer effect on primary button
- Stat numbers now white instead of gradient text
- Badges simplified to white-on-dark-bg instead of colored
- Scrollbar thumb simplified
- Navbar brand is now plain white text instead of gradient

**Transition changes (js/warp-transition.js, js/common.js)**
- Removed star-field warp animation entirely
- Replaced canvas overlay with a simple div overlay
- New transition: fade to dark (350ms ease-in-out) → navigate → fade from dark (400ms ease-out)
- No flashes, no bright overlays, no particle effects
- Duration total ~750ms, feels seamless

**About page feature (about.html)**
- Project Overview section is now clickable/expandable
- Click toggles expanded state with chevron rotation
- Expanded content reveals: what the system does, how it works (step-by-step), key components
- Smooth height transition via max-height + opacity (350ms)
- CSS-only expand/collapse, no extra JS library

**Hero visual (index.html)**
- Replaced animated neon SVG with static muted gray landmark diagram
- No animations, reduced opacity, monochrome palette

### Files Modified in Refinement
| File | Change |
|------|--------|
| `css/style.css` | Full restyle — muted palette, reduced rounding, removed effects |
| `js/warp-transition.js` | Rewritten — simple fade overlay instead of star warp |
| `js/common.js` | Creates div instead of canvas for transition |
| `index.html` | Replaced hero SVG, removed gradient text styling |
| `about.html` | Added expandable overview, removed text-info colors |

### Audit Fixes Applied (prior)
- [x] CRITICAL-1: MediaPipe CDN import — fixed bare URL to use `/vision_bundle.mjs` ESM entry
- [x] CRITICAL-2: Timestamp monotonic — added `safeTimestamp` guard in `processFrame()` to prevent MediaPipe collision
- [x] CRITICAL-3: IGNORED — shoulders + elbows (indices 11-14) is correct per explicit override
- [x] CRITICAL-4: Warp flag bug — removed `beforeunload` listener from common.js, moved flag set into `startWarp()` in warp-transition.js
- [x] Duplicate CSS — removed inline `<style>` from operations.html (style.css already has status-dot rules)
- [x] Junk files — deleted `assets/images/random.txt` and `assets/videos/random 2.txt`
- [x] Dead import — removed unused `POSITION_FEATURES` from operations-capture.js

### Phase 1 — Scaffold ✅
- contract.js, team.html, team.js, learn.html, demo.html, demo.js
- signgloss_stub.onnx, generate_stub_model.py, README.md, .gitignore

### Phase 2 — Pipeline ✅
- decoder.js, inference-worker.js, bridge.js, operations-inference.js

### Phase 3 — Integration ✅
- Model load/inference error handling, retry button, loading spinner, buffer throttle

### Phase 4 — Polish ✅
- Status indicators, error states, README finalized

## System Status
- All 6 pages load correctly
- Pipeline: camera → MediaPipe → worker → gloss → UI should now work end-to-end
- Page transitions use smooth fade overlay (no warp stars)
- About page has interactive expandable Project Overview
- ONNX model loads from CDN WASM paths
- Contact form validates
- Visual style: minimal dark, no neon, no glow, tight border-radius

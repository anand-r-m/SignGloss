# SignGloss — Phase Roadmaps (All Phases)

> Stack: HTML + CSS (Bootstrap 5) + Vanilla JS
> Nav order: Home → About → Demo → Operations → Learn → Team
> Page transitions: Interstellar lightspeed warp animation

---

# Phase 1 — Scaffold (Days 1–2)

> **Goal:** All 6 pages exist, navbar works with warp transition, footer on all pages, contact form validates.

---

## Day 1

### Dev A — Project Structure + Shared Layout + Landing Page

**Files to create:** `index.html`, `about.html`, `operations.html`, `css/style.css`, `js/common.js`, `js/warp-transition.js`

| # | Task | File | Time |
|---|------|------|------|
| 1 | Delete all remaining old files (`src/`, leftover configs). Create folder structure: `css/`, `js/`, `models/`, `assets/images/`, `assets/videos/`. | — | 10 min |
| 2 | Create `css/style.css` — dark theme base, custom scrollbar, `#warp-overlay` styles, Bootstrap overrides for dark mode. | `css/style.css` | 30 min |
| 3 | Create `js/common.js` — inject navbar (Home→About→Demo→Operations→Learn→Team) + footer into `#navbar-placeholder` and `#footer-placeholder`. Highlight active link. Intercept all nav `<a>` clicks → call `startWarp(targetUrl)`. | `js/common.js` | 45 min |
| 4 | Create `js/warp-transition.js` — full-screen canvas with ~200 star particles. Stars accelerate radially from center into stretched speed lines. White flash at end. Navigate after 900ms. On page load, play 200ms arrival fade. | `js/warp-transition.js` | 90 min |
| 5 | Create `index.html` — Bootstrap dark page. Hero section with project name, tagline, CTA button ("Try it →" linking to operations.html). Feature cards (3 cards: Real-time, Client-side, ISL). | `index.html` | 45 min |
| 6 | Create `about.html` — project description, pipeline diagram (ASCII or image), tech stack table. | `about.html` | 30 min |
| 7 | Create `operations.html` — skeleton only. Two-column layout (`col-8` for video panel, `col-4` for results panel). Empty placeholder divs with IDs. | `operations.html` | 20 min |
| 8 | Test: all 3 pages load, navbar shows on all, warp transition fires on link click, footer shows. | — | 15 min |

**Commit after:** `"scaffold and shared layout"`, `"warp transition added"`, `"landing and about pages"`

**Dev A Day 1 Total: ~4.5 hrs**

---

### Dev B — Contract + Team + Learn + Demo Pages

**Files to create:** `js/contract.js`, `team.html`, `js/team.js`, `learn.html`, `demo.html`

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create `js/contract.js` — all shared constants (`LANDMARK_COUNT`, `WINDOW_SIZE`, `HOP_SIZE`, `NUM_CLASSES`, `MODEL_PATH`, etc.) + `Pipeline` callback object. | `js/contract.js` | 20 min |
| 2 | Create `team.html` — Bootstrap card row (`col-md-6`) with 2 team member cards (photo placeholder, name, role, GitHub/LinkedIn links). Below: contact form (name, email, message, submit button) using Bootstrap form classes. | `team.html` | 45 min |
| 3 | Create `js/team.js` — form validation. Check: name not empty, email valid format, message ≥ 10 chars. Show Bootstrap `is-valid`/`is-invalid` feedback. On valid submit, show success alert, reset form. | `js/team.js` | 30 min |
| 4 | Create `learn.html` — hero section "Learn Indian Sign Language". Video grid using Bootstrap `row` + `col-md-4` cards. Each card: YouTube `<iframe>` embed + label below. 6-9 videos total. Below the grid: "Learning Resources" section with links to ISL guides, references, online courses. | `learn.html` | 60 min |
| 5 | Create `demo.html` — hero section "See SignGloss in Action". `<video>` element with `controls` attribute, `src` pointing to `assets/videos/demo.mp4` (placeholder — swap later). Description text below explaining what the viewer is seeing. | `demo.html` | 30 min |
| 6 | Test: all 3 pages load, contact form validation works, YouTube embeds play, demo video placeholder shows. | — | 15 min |

**Commit after:** `"contract file"`, `"team page with contact form"`, `"learn page"`, `"demo page"`

**Dev B Day 1 Total: ~3.5 hrs**

---

## Day 2

### Dev A — Polish Index + About + Warp Refinement

| # | Task | File | Time |
|---|------|------|------|
| 1 | Polish `index.html` hero — add gradient text, animated CTA button, feature icons. | `index.html` | 45 min |
| 2 | Polish `about.html` — add pipeline flow diagram (can be a styled `<div>` chain or an image), tech stack table with Bootstrap `table-dark`. | `about.html` | 30 min |
| 3 | Refine warp transition — tune star count, speed curve, trail length, flash intensity. Test across all nav links. Ensure arrival animation plays on every page load. | `js/warp-transition.js` | 45 min |
| 4 | Finalize `css/style.css` — scrollbar, hover states, card shadows, consistent spacing. | `css/style.css` | 30 min |

**Dev A Day 2 Total: ~2.5 hrs**

---

### Dev B — Dummy Model + README + Content Polish

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create dummy ONNX model (Python script) → save to `models/signgloss_stub.onnx`. Input `[1,64,156]` → output `[1,64,601]`. Simple linear layer. | `models/signgloss_stub.onnx` | 30 min |
| 2 | Write `README.md` — project overview, tech stack (HTML/CSS/JS/Bootstrap/ONNX/MediaPipe), setup instructions (just open index.html or use Live Server), team table, pipeline diagram. | `README.md` | 30 min |
| 3 | Polish `learn.html` — finalize video selections, add resource links, ensure grid is responsive. | `learn.html` | 30 min |
| 4 | Polish `team.html` — add placeholder photos, finalize card styling. | `team.html` | 20 min |

**Dev B Day 2 Total: ~2 hrs**

---

### End of Phase 1 — Checklist

- [ ] All 6 HTML pages load without console errors
- [ ] Navbar appears on every page (Home→About→Demo→Operations→Learn→Team)
- [ ] Active nav link is highlighted on current page
- [ ] Warp transition plays on every nav click
- [ ] Arrival animation plays on page load
- [ ] Footer appears on every page
- [ ] Contact form validates (name, email, message)
- [ ] YouTube embeds play on learn page
- [ ] Demo video placeholder shows
- [ ] Operations page has empty skeleton with correct `col-8`/`col-4` layout

---

# Phase 2 — Pipeline (Days 3–7)

> **Goal:** Dev A has working camera → landmarks. Dev B has working worker → gloss output. Both tested independently with mocks.

---

## Day 3

### Dev A — Camera Capture

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create `js/capture.js` — export `startCamera(videoEl)` and `stopCamera()`. Use `navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })`. Handle errors (NotAllowedError, NotFoundError). | `js/capture.js` | 60 min |
| 2 | Temporarily test in `operations.html`: add a "Start Camera" button that calls `startCamera()` and shows the feed in the `<video>` element. Verify camera works in Chrome. | `operations.html` (temp) | 30 min |

**Dev A Day 3: ~1.5 hrs**

### Dev B — CTC Decoder

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create `js/decoder.js` — export `ctcGreedyDecode(outputFloat32, timeSteps, numClasses)`. Argmax per timestep → remove blank (index 0) → collapse repeats → map to label strings. Placeholder label array `["<blank>", "GLOSS_0", ..., "GLOSS_599"]`. | `js/decoder.js` | 60 min |
| 2 | Test decoder in browser console with fake output data. Verify collapsing works: `[0,0,42,42,0,17,17,0]` → `["GLOSS_41", "GLOSS_16"]`. | — | 30 min |

**Dev B Day 3: ~1.5 hrs**

---

## Day 4

### Dev A — MediaPipe Landmarks

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create `js/landmarks.js` — import MediaPipe Tasks Vision from CDN. Export `initMediaPipe()` that creates HandLandmarker + PoseLandmarker. Export `extractLandmarks(videoEl)` that returns `Float32Array[78]` (26 landmarks × 3 coords). Subset: 11 left hand + 11 right hand + 4 pose. | `js/landmarks.js` | 120 min |
| 2 | Test: init MediaPipe, call `extractLandmarks()` in a loop, log the 78-float array to console. Verify numbers change when hands move. | — | 30 min |

**Dev A Day 4: ~2.5 hrs**

### Dev B — Inference Worker

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create `js/inference-worker.js` — Web Worker file. Handle messages: `LOAD_MODEL` (load ONNX via importScripts or import), `FRAME` (compute velocity from prev frame, concat [pos,vel]=156 features, buffer 64 frames, run ONNX when full, CTC decode, post result), `RESET` (clear buffer). Include sliding window logic (keep 16 frames after inference). | `js/inference-worker.js` | 150 min |
| 2 | Test worker in isolation: create it from console, send mock LOAD_MODEL + 64 fake FRAME messages, verify GLOSS_RESULT comes back. | — | 30 min |

**Dev B Day 4: ~3 hrs**

---

## Day 5

### Dev A — Operations Capture Wiring

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create `js/operations-capture.js` — on "Start" button click: call `startCamera(videoEl)`, call `initMediaPipe()`, start `requestAnimationFrame` loop that calls `extractLandmarks(videoEl)` and feeds result to `Pipeline.onLandmarks(landmarks, frameId, timestamp)`. On "Stop": stop camera, cancel animation frame. | `js/operations-capture.js` | 60 min |
| 2 | Add landmark overlay: create `<canvas>` over `<video>` in operations.html. In the rAF loop, draw colored dots at landmark positions on the canvas. Left hand = blue, right hand = green, pose = yellow. | `js/operations-capture.js` | 60 min |
| 3 | Test: Start camera → landmarks extracted → dots drawn on canvas → `Pipeline.onLandmarks()` called (log to console to verify). | — | 20 min |

**Dev A Day 5: ~2.5 hrs**

### Dev B — Worker Bridge

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create `js/bridge.js` — export `InferenceBridge` class. Constructor: create Worker from `js/inference-worker.js`. Methods: `loadModel(path)`, `sendFrame(float32)` (use Transferable), `reset()`, `terminate()`. Route worker messages to `Pipeline.onGlossResult`, `Pipeline.onBufferProgress`, `Pipeline.onStatusChange`, `Pipeline.onError`. Add crash recovery: on `worker.onerror`, restart up to 3 times. | `js/bridge.js` | 90 min |
| 2 | Test bridge with mock frames: create bridge, load model, send 64 fake `Float32Array[78]` frames, verify gloss result arrives in `Pipeline.onGlossResult`. | — | 30 min |

**Dev B Day 5: ~2 hrs**

---

## Day 6

### Dev A — Landmark Overlay Polish

| # | Task | File | Time |
|---|------|------|------|
| 1 | Draw connection lines between landmarks (finger chains, shoulder-hip lines) on the canvas overlay. Color-code by body part. | `js/operations-capture.js` | 45 min |
| 2 | Add FPS counter display — count frames per second in the rAF loop, show in a small badge on the video panel. | `js/operations-capture.js` | 20 min |
| 3 | Handle camera edge cases: permission denied → show error message in video panel. Camera disconnect → show "Camera disconnected" message. | `js/operations-capture.js` | 30 min |

**Dev A Day 6: ~1.5 hrs**

### Dev B — Operations Inference UI

| # | Task | File | Time |
|---|------|------|------|
| 1 | Create `js/operations-inference.js` — on page load: create InferenceBridge. Set `Pipeline.onLandmarks` to feed bridge with `sendFrame()`. Set `Pipeline.onGlossResult` to update DOM: show gloss tokens in `#current-gloss` div, append to `#gloss-history` list, update confidence in `#confidence-display`. | `js/operations-inference.js` | 60 min |
| 2 | Build metrics bar in `#results-panel`: model status indicator (dot: yellow=loading, green=ready, red=error), buffer progress bar (Bootstrap progress), inference time display, FPS display. Wire to `Pipeline.onStatusChange` and `Pipeline.onBufferProgress`. | `js/operations-inference.js` | 45 min |
| 3 | Create mock landmark emitter for testing: a function that sends fake `Float32Array[78]` at 30fps to `Pipeline.onLandmarks`. Add a hidden "Test Mode" button on operations page that activates this. | `js/operations-inference.js` | 30 min |
| 4 | Test: click "Test Mode" → mock frames flow → buffer fills → gloss tokens appear → history grows. | — | 15 min |

**Dev B Day 6: ~2.5 hrs**

---

## Day 7

### Dev A — End-to-End Capture Test

| # | Task | Time |
|---|------|------|
| 1 | Full test: Start camera → MediaPipe extracts landmarks → `Pipeline.onLandmarks()` is called with real data → canvas overlay draws correctly. | 30 min |
| 2 | Fix any MediaPipe loading issues (CDN timing, WASM files). | 30 min |
| 3 | Ensure `operations-capture.js` properly cleans up on "Stop" (cancel rAF, stop camera tracks, clear canvas). | 20 min |

**Dev A Day 7: ~1.5 hrs**

### Dev B — End-to-End Inference Test

| # | Task | Time |
|---|------|------|
| 1 | Full test with mock emitter: mock landmarks → bridge → worker → ONNX inference on stub model → CTC decode → gloss tokens in UI. | 30 min |
| 2 | Fix any worker/ONNX loading issues. Verify model path resolves correctly. | 30 min |
| 3 | Verify buffer sliding works: after first inference, buffer keeps 16 frames, waits for 48 new ones, then infers again. | 20 min |

**Dev B Day 7: ~1.5 hrs**

---

### End of Phase 2 — Checklist

**Dev A side:**
- [ ] Camera starts and shows video feed
- [ ] MediaPipe extracts landmarks (logged to console)
- [ ] Canvas overlay draws dots + connection lines
- [ ] FPS counter shows in video panel
- [ ] `Pipeline.onLandmarks()` fires every frame
- [ ] Camera stop cleans up properly
- [ ] Permission denied shows error message

**Dev B side:**
- [ ] Worker loads ONNX model (stub)
- [ ] Mock frames → buffer fills → progress updates
- [ ] After 64 frames → inference runs → gloss tokens returned
- [ ] CTC decoder collapses correctly
- [ ] Gloss tokens display in `#current-gloss`
- [ ] History list grows in `#gloss-history`
- [ ] Metrics bar shows status, buffer %, inference time
- [ ] Worker crash → auto-restart works

---

# Phase 3 — Integration (Days 8–9)

> **Goal:** Camera → MediaPipe → Worker → Gloss → UI works end-to-end.

---

## Day 8 — Wire Everything Together

### Dev A + Dev B (Joint Session)

| # | Task | Owner | Time |
|---|------|-------|------|
| 1 | Load both scripts on `operations.html`: `operations-capture.js` + `operations-inference.js`. Ensure both set up their `Pipeline.*` callbacks without overwriting each other. | Both | 30 min |
| 2 | Test: Click "Start" → camera starts → MediaPipe extracts → `Pipeline.onLandmarks` fires → bridge sends to worker → worker buffers, infers, decodes → `Pipeline.onGlossResult` fires → UI updates. | Both | 60 min |
| 3 | Debug any issues: data shape mismatches, timing problems, worker errors. | Both | 60 min |
| 4 | Verify the full cycle repeats: after first inference, sliding window keeps 16 frames, next inference after 48 more frames (~1.6s). | Both | 20 min |

**Day 8 Total: ~3 hrs (joint)**

---

## Day 9 — Edge Cases + Polish

### Dev A — Capture Hardening

| # | Task | Time |
|---|------|------|
| 1 | Handle camera disconnect mid-stream: listen for `track.onended`, show message, stop pipeline. | 30 min |
| 2 | Handle tab hidden: pause landmark extraction when `document.hidden`, resume when visible. | 20 min |
| 3 | Polish landmark overlay: adjust dot sizes, line opacity, colors. | 20 min |

**Dev A Day 9: ~1 hr**

### Dev B — Inference Hardening

| # | Task | Time |
|---|------|------|
| 1 | Handle model load failure: show "Model failed to load" in results panel with retry button. | 30 min |
| 2 | Handle inference failure: show error in metrics bar, don't crash the pipeline. | 20 min |
| 3 | Throttle buffer progress updates to max 10/sec to avoid DOM thrashing. | 15 min |
| 4 | Polish gloss display: token badges, confidence percentage, clean history list. | 30 min |

**Dev B Day 9: ~1.5 hrs**

---

### End of Phase 3 — Checklist

- [ ] Camera → landmarks → worker → gloss → UI works end-to-end
- [ ] Buffer progress bar fills in real-time
- [ ] Gloss tokens appear ~2 seconds after starting
- [ ] History accumulates across multiple inference windows
- [ ] Sliding window repeats every ~1.6 seconds
- [ ] Stop button → everything stops cleanly
- [ ] Restart → everything works again from clean state
- [ ] Camera disconnect handled
- [ ] Model load failure handled
- [ ] No console errors during normal operation

---

# Phase 4 — Polish + Deploy (Days 10–12)

> **Goal:** Error handling, visual polish, and live on GitHub Pages.

---

## Day 10 — Error States + Loading

### Dev A — Camera Error UX

| # | Task | File | Time |
|---|------|------|------|
| 1 | Camera permission denied → show Bootstrap alert with instructions ("Allow camera in browser settings"). Add retry button. | `js/operations-capture.js` | 30 min |
| 2 | Camera initializing → show spinner in video panel ("Requesting camera access..."). | `js/operations-capture.js` | 15 min |
| 3 | No camera found → show "No camera detected" message. | `js/operations-capture.js` | 15 min |
| 4 | MediaPipe loading → show "Loading AI model..." overlay on video panel. | `js/operations-capture.js` | 20 min |

**Dev A Day 10: ~1.5 hrs**

### Dev B — Model Error UX

| # | Task | File | Time |
|---|------|------|------|
| 1 | Model loading → show Bootstrap spinner in results panel ("Loading ONNX model..."). | `js/operations-inference.js` | 20 min |
| 2 | Model load failed → show error alert with specific message (404, corrupted, etc.) and retry button. | `js/operations-inference.js` | 30 min |
| 3 | Inference failed → show warning, don't crash. Log error, continue accepting frames. | `js/operations-inference.js` | 20 min |
| 4 | Worker crash → auto-restart (already built in bridge.js). Show brief "Restarting pipeline..." message. After 3 fails → show "Please refresh the page." | `js/operations-inference.js` | 20 min |

**Dev B Day 10: ~1.5 hrs**

---

## Day 11 — Visual Polish + README

### Dev A — CSS + Layout Polish

| # | Task | File | Time |
|---|------|------|------|
| 1 | Verify all pages at 1024px and 1440px widths. Fix any layout breaks. | `css/style.css` | 45 min |
| 2 | Add hover effects to nav links, card shadows, smooth transitions on buttons. | `css/style.css` | 30 min |
| 3 | Fine-tune warp transition — ensure it feels smooth, not jarring. Adjust speed curve if needed. | `js/warp-transition.js` | 30 min |
| 4 | Take screenshots of each page for README. | `assets/images/` | 15 min |

**Dev A Day 11: ~2 hrs**

### Dev B — README + Demo Page

| # | Task | File | Time |
|---|------|------|------|
| 1 | Finalize `README.md` — add screenshots, finalize tech stack table, setup instructions (Live Server or direct file open), pipeline description. | `README.md` | 45 min |
| 2 | Finalize `demo.html` — ensure video player works, add description text. If no demo video yet, add clear placeholder with instructions. | `demo.html` | 20 min |
| 3 | Cross-browser test: Chrome, Firefox, Edge. Fix any JS module or Canvas issues. | — | 30 min |

**Dev B Day 11: ~1.5 hrs**

---

## Day 12 — Deploy

### Dev A — Final Testing

| # | Task | Time |
|---|------|------|
| 1 | Full walkthrough: visit every page, click every nav link, verify warp transition, test operations page end-to-end. | 30 min |
| 2 | Test with camera on operations page. Verify full pipeline works in Chrome. | 20 min |
| 3 | Fix any last-minute CSS or layout issues. | 20 min |

**Dev A Day 12: ~1 hr**

### Dev B — GitHub Pages Deploy

| # | Task | Time |
|---|------|------|
| 1 | Verify `.gitignore` is correct (no `node_modules`, no temp files). | 5 min |
| 2 | Commit all files. Push to `main` branch of `anand-rm-dev/CSLR-website`. | 10 min |
| 3 | Enable GitHub Pages: Repo → Settings → Pages → Deploy from `main` branch, `/ (root)`. | 5 min |
| 4 | Wait for deploy. Visit `https://anand-rm-dev.github.io/CSLR-website/`. | 5 min |
| 5 | Post-deploy verification: all 6 pages load, nav works, warp plays, camera prompt appears on operations page, model file loads, demo video shows. | 30 min |
| 6 | Fix any path issues (relative vs absolute URLs). Re-push if needed. | 15 min |

**Dev B Day 12: ~1 hr**

---

### End of Phase 4 — Final Checklist

- [ ] All 6 pages load on GitHub Pages
- [ ] Warp transition plays on every nav click
- [ ] Dark theme consistent across all pages
- [ ] Camera permission prompt works (HTTPS required — GitHub Pages provides this)
- [ ] Model loads from `models/signgloss_stub.onnx`
- [ ] Full pipeline: camera → gloss works
- [ ] Contact form validates
- [ ] YouTube embeds play on learn page
- [ ] Demo video plays (or placeholder shows)
- [ ] No console errors on any page
- [ ] README looks good on GitHub repo page
- [ ] Works in Chrome + Firefox + Edge

---

## Time Summary

| Phase | Days | Dev A | Dev B |
|-------|------|-------|-------|
| **Phase 1** (Scaffold) | 2 | ~7 hrs | ~5.5 hrs |
| **Phase 2** (Pipeline) | 5 | ~9.5 hrs | ~10.5 hrs |
| **Phase 3** (Integration) | 2 | ~4 hrs (incl. joint) | ~4.5 hrs (incl. joint) |
| **Phase 4** (Polish+Deploy) | 3 | ~4.5 hrs | ~4 hrs |
| **Total** | **12 days** | **~25 hrs** | **~24.5 hrs** |

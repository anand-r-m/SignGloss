# SignGloss — Redesigned Implementation Plan

> Pure HTML + CSS (Bootstrap) + Vanilla JS · No frameworks · Real-time ISL → Gloss

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Desktop)                       │
│                                                             │
│  ┌──────────┐   ┌───────────┐   ┌────────────────────────┐ │
│  │  Camera   │──▶│ MediaPipe │──▶│     Web Worker          │ │
│  │ (WebRTC)  │   │(landmarks)│   │ velocity→buffer→ONNX   │ │
│  │           │   │           │   │ →CTC decode             │ │
│  └──────────┘   └───────────┘   └────────┬───────────────┘ │
│     Dev A           Dev A                 │    Dev B        │
│                                           ▼                 │
│                                    ┌─────────────┐         │
│                                    │  Gloss UI   │         │
│                                    │  (results)  │         │
│                                    └─────────────┘         │
│                                        Dev B               │
└─────────────────────────────────────────────────────────────┘
```

- **Zero backend.** Everything runs client-side.
- **No build step.** Serve static files directly.
- **CDN dependencies:** Bootstrap 5, MediaPipe Tasks Vision, ONNX Runtime Web.
- **ES Modules** via `<script type="module">` for our own JS.

---

## 2. Pages (6 Total)

| # | File | Nav Order | Purpose | Owner |
|---|------|-----------|---------|-------|
| 1 | `index.html` | Home | Landing page — hero, features, CTA | Dev A |
| 2 | `about.html` | About | Project purpose, pipeline explainer, tech stack | Dev A |
| 3 | `demo.html` | Demo | Pre-recorded screen recording of system in use | Dev B |
| 4 | `operations.html` | Operations | Live camera → inference → gloss output | Split (see below) |
| 5 | `learn.html` | Learn | Sign language video grid + learning resources | Split (see below) |
| 6 | `team.html` | Team | Team member cards + contact form | Dev B |

### Split pages

**operations.html** — Dev A owns the HTML file + video panel (`#video-panel`). Dev B owns the results panel (`#results-panel`), metrics, and gloss display.

**learn.html** — Dev B owns the HTML file. Dev A provides the video grid markup. Dev B provides the resources section.

### Page Transition — Interstellar Lightspeed Warp

Every navbar link click triggers a **full-screen warp animation** before navigating. This mimics the lightspeed/wormhole travel from Interstellar — stars stretch into radial speed lines converging toward a bright center, then the screen whites out and the new page loads.

**How it works:**

1. `common.js` intercepts all navbar `<a>` clicks via `e.preventDefault()`.
2. A full-screen `<canvas id="warp-overlay">` is shown (fixed, z-index 9999).
3. `warp-transition.js` renders ~200 star particles using `requestAnimationFrame`.
4. **Phase 1 (0–600ms): Acceleration** — stars move outward from center slowly, then rapidly stretch into long radial lines. Background fades from transparent to deep blue-black.
5. **Phase 2 (600–900ms): Flash** — a bright white radial gradient blooms from center, simulating the wormhole exit.
6. At 900ms, `window.location.href` is set to the target page.
7. On the **new page load**, a brief **deceleration** effect (200ms) plays: the white flash fades out and stars decelerate to a stop, then the overlay is removed.

**Star rendering (canvas 2D):**
```
for each star:
  - position: random angle + radius from center
  - speed: increases exponentially over time
  - trail: drawn as a line from (x, y) to (x - dx*trailLength, y - dy*trailLength)
  - color: white → blue-white at high speed
  - length: short dots → long streaks as speed increases
```

**File:** `js/warp-transition.js` — **owned by Dev A** (visual/UI responsibility).

**CSS required (in style.css):**
```css
#warp-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.1s;
}
#warp-overlay.active {
  pointer-events: all;
  opacity: 1;
}
```

---

## 3. Pipeline Design

### Data Flow

```
Camera (30fps) → MediaPipe → Float32Array[78] per frame
       ↓ (via Pipeline.onLandmarks callback)
Web Worker receives 78 floats
       ↓
Compute velocity (frame diff) → 156 features
       ↓
Accumulate in sliding window buffer (64 frames)
       ↓
When buffer full → ONNX inference on [1, 64, 156]
       ↓
Output [1, 64, 601] → CTC greedy decode
       ↓
Post gloss tokens back to main thread → update UI
       ↓
Slide window: keep 16 frames, wait for 48 new ones
```

### Timing

| Metric | Value |
|--------|-------|
| Camera FPS | 30 |
| Frames per window | 64 (~2.1 seconds) |
| Hop size | 48 frames (~1.6 seconds between inferences) |
| Overlap | 16 frames kept |
| Target inference | < 200ms |
| Model input | `[1, 64, 156]` |
| Model output | `[1, 64, 601]` (600 glosses + 1 CTC blank) |

---

## 4. Dev A ↔ Dev B Contract

### File: `js/contract.js`

```javascript
// === SHARED CONSTANTS ===
export const LANDMARK_COUNT = 26;
export const COORDS = 3;
export const POSITION_FEATURES = 78;   // 26 × 3
export const TOTAL_FEATURES = 156;     // 78 pos + 78 vel
export const WINDOW_SIZE = 64;
export const HOP_SIZE = 48;
export const OVERLAP = 16;
export const NUM_CLASSES = 601;
export const TARGET_FPS = 30;
export const MODEL_PATH = 'models/signgloss_stub.onnx';

// === HANDOFF INTERFACE ===
// Dev A sets Pipeline.onLandmarks to push data to Dev B
// Dev B sets Pipeline.onGlossResult to receive decoded output
export const Pipeline = {
  onLandmarks: null,    // (landmarks: Float32Array[78], frameId: number, timestamp: number) => void
  onGlossResult: null,  // (glosses: string[], confidence: number, inferenceTimeMs: number) => void
  onBufferProgress: null, // (fill: number) => void   (0-1)
  onStatusChange: null,   // (status: string) => void  ('loading'|'ready'|'error')
  onError: null,          // (message: string) => void
};
```

### Handoff Rules

1. **Dev A produces** `Float32Array[78]` — 26 landmarks × 3 coords (x, y, z), **position only**, normalized 0–1.
2. **Dev A calls** `Pipeline.onLandmarks(landmarks, frameId, timestamp)` every frame.
3. **Dev B computes velocity** inside the Worker (current − previous frame).
4. **Dev B concatenates** `[78 position, 78 velocity]` = 156 features per frame.
5. **Dev B buffers** 64 frames, runs ONNX, CTC decodes, then calls `Pipeline.onGlossResult(...)`.
6. **Neither dev modifies** `contract.js` without the other's review.

### 26 Landmarks

| Range | Count | Source |
|-------|-------|--------|
| 0–10 | 11 | Left hand (subset of MediaPipe 21) |
| 11–21 | 11 | Right hand (subset of MediaPipe 21) |
| 22–25 | 4 | Pose (shoulders + hips) |

---

## 5. File Structure

```
CSLR-website/
│
├── index.html                  ← Dev A
├── about.html                  ← Dev A
├── demo.html                   ← Dev B
├── operations.html             ← Dev A (HTML skeleton)
├── learn.html                  ← Dev B
├── team.html                   ← Dev B
│
├── css/
│   └── style.css               ← Dev A (custom styles + warp overlay)
│
├── js/
│   ├── contract.js             ← SHARED (Dev B writes, both agree)
│   ├── common.js               ← Dev A (navbar/footer injection + warp trigger)
│   ├── warp-transition.js      ← Dev A (Interstellar lightspeed canvas animation)
│   │
│   ├── capture.js              ← Dev A (WebRTC getUserMedia)
│   ├── landmarks.js            ← Dev A (MediaPipe init + extraction)
│   ├── operations-capture.js   ← Dev A (wires camera on operations.html)
│   │
│   ├── inference-worker.js     ← Dev B (Worker: velocity + buffer + ONNX + CTC)
│   ├── bridge.js               ← Dev B (main ↔ worker wrapper)
│   ├── decoder.js              ← Dev B (CTC greedy decode, imported by worker)
│   ├── operations-inference.js ← Dev B (wires inference + UI on operations.html)
│   ├── demo.js                 ← Dev B (demo page logic)
│   └── team.js                 ← Dev B (contact form validation)
│
├── models/
│   └── signgloss_stub.onnx     ← Dev B (dummy now, real model later)
│
├── assets/
│   ├── images/                 ← Dev A (hero, team photos, icons)
│   └── videos/                 ← Dev A (demo screen recordings)
│
├── .gitignore
└── README.md                   ← Dev B
```

### Ownership Summary

| Dev A | Dev B | Shared |
|-------|-------|--------|
| `index.html` | `team.html` | `contract.js` |
| `about.html` | `demo.html` | |
| `operations.html` | `learn.html` | |
| `css/style.css` | `inference-worker.js` | |
| `common.js` | `bridge.js` | |
| `warp-transition.js` | `decoder.js` | |
| `capture.js` | `operations-inference.js` | |
| `landmarks.js` | `demo.js` | |
| `operations-capture.js` | `team.js` | |
| `assets/*` | `models/*` | |
| | `README.md` | |

---

## 6. UI Structure

### Shared Layout (all pages)

Every HTML page follows this skeleton:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SignGloss — PAGE_TITLE</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-bs-theme="dark">
  <div id="navbar-placeholder"></div>

  <!-- PAGE CONTENT HERE -->

  <div id="footer-placeholder"></div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script type="module" src="js/common.js"></script>
  <!-- page-specific scripts -->
</body>
</html>
```

`common.js` injects a Bootstrap `navbar-dark bg-dark` nav (link order: Home, About, Demo, Operations, Learn, Team) and a footer. It also creates the `<canvas id="warp-overlay">` and imports `warp-transition.js`. All navbar links are intercepted to trigger the warp animation before navigation.

### operations.html Layout

```
┌──────────────────────────────────────────────┐
│ Navbar                                       │
├──────────────────────────────────────────────┤
│ Metrics Bar (status, buffer, fps, latency)   │  ← Dev B
├────────────────────────┬─────────────────────┤
│                        │                     │
│   Video Panel          │   Results Panel     │
│   - <video> feed       │   - Current Gloss   │
│   - <canvas> overlay   │   - Confidence      │
│   - Start/Stop btns    │   - History list    │
│                        │                     │
│   ← Dev A (col-8)      │   ← Dev B (col-4)  │
├────────────────────────┴─────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘
```

### learn.html Layout

```
┌──────────────────────────────────────────────┐
│ Navbar                                       │
├──────────────────────────────────────────────┤
│ Hero: "Learn Indian Sign Language"           │
├──────────────────────────────────────────────┤
│ Video Grid (Bootstrap row + col-md-4 cards)  │  ← Dev A provides content
│ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │ YouTube  │ │ YouTube  │ │ YouTube  │        │
│ │ embed    │ │ embed    │ │ embed    │        │
│ │ Label    │ │ Label    │ │ Label    │        │
│ └─────────┘ └─────────┘ └─────────┘         │
├──────────────────────────────────────────────┤
│ Learning Resources (links, guides, refs)     │  ← Dev B
├──────────────────────────────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘
```

### demo.html Layout

```
┌──────────────────────────────────────────────┐
│ Navbar                                       │
├──────────────────────────────────────────────┤
│ Hero: "See SignGloss in Action"              │
├──────────────────────────────────────────────┤
│ Pre-recorded video player (screen recording) │
│ <video> with controls                        │
├──────────────────────────────────────────────┤
│ Description / explanation text               │
├──────────────────────────────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘
```

### team.html Layout

```
┌──────────────────────────────────────────────┐
│ Navbar                                       │
├──────────────────────────────────────────────┤
│ Team Cards (row + col-md-6)                  │
│ ┌──────────────┐ ┌──────────────┐            │
│ │ Photo        │ │ Photo        │            │
│ │ Name         │ │ Name         │            │
│ │ Role         │ │ Role         │            │
│ │ Links        │ │ Links        │            │
│ └──────────────┘ └──────────────┘            │
├──────────────────────────────────────────────┤
│ Contact Form (name, email, message, submit)  │
├──────────────────────────────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘
```

---

## 7. State Management

No framework, no store. Simple shared mutable object + callbacks:

```javascript
// js/contract.js — Pipeline object IS the state bus
Pipeline.onLandmarks = (landmarks, frameId, ts) => { ... };
Pipeline.onGlossResult = (glosses, confidence, timeMs) => { ... };
Pipeline.onBufferProgress = (fill) => { ... };
Pipeline.onStatusChange = (status) => { ... };
Pipeline.onError = (msg) => { ... };
```

**Page-level state** (e.g. `isRunning`, `currentMode`) lives as simple variables in the page-specific JS files. No global state beyond `Pipeline`.

---

## 8. Performance Strategy

| Concern | Solution |
|---------|----------|
| ONNX blocks main thread | Run inference in a **Web Worker** |
| 30fps landmark extraction | `requestAnimationFrame` loop in `capture.js` |
| Buffer progress floods UI | Throttle `onBufferProgress` to max 10 updates/sec |
| Large model file | Chunk-load via ONNX Runtime; show progress |
| TypedArray copying | Use `Transferable` in `postMessage` (zero-copy) |
| DOM updates during inference | Batch DOM writes; only update on gloss change |

### Web Worker Communication

```
Main Thread                          Worker Thread
───────────                          ─────────────
bridge.js                            inference-worker.js
  │                                    │
  │── postMessage({LOAD_MODEL}) ──────▶│ loads ONNX session
  │◀── postMessage({STATUS:ready}) ────│
  │                                    │
  │── postMessage({FRAME, data}) ─────▶│ velocity → buffer → infer
  │   (Transferable: zero-copy)        │
  │◀── postMessage({GLOSS_RESULT}) ────│
  │◀── postMessage({BUFFER_PROGRESS})──│
```

---

## 9. CDN Dependencies

```html
<!-- Bootstrap 5.3 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- MediaPipe Tasks Vision (loaded by Dev A in capture.js) -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js"></script>

<!-- ONNX Runtime Web (loaded inside Web Worker via importScripts or import) -->
<!-- Worker imports: https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.mjs -->
```

---

## 10. Code Organization Detail

### Dev A Files

**`common.js`** — Injects navbar (Home → About → Demo → Operations → Learn → Team) + footer into every page. Highlights active nav link. Creates `<canvas id="warp-overlay">` element. Intercepts all nav clicks → triggers warp → navigates on animation end.

**`warp-transition.js`** — Exports `startWarp(targetUrl)` and `playArrival()`. Renders ~200 star particles on canvas. Stars accelerate radially outward from screen center, stretching into long blue-white speed lines. After 900ms, triggers navigation. On new page load, `playArrival()` fades the white flash out over 200ms.

**`capture.js`** — Exports `startCamera(videoElement)` and `stopCamera()`. Handles `getUserMedia` with error messages.

**`landmarks.js`** — Exports `initMediaPipe()` and `processFrame(videoElement)`. Returns `Float32Array[78]`. Subsets the 26 landmarks from MediaPipe's full set.

**`operations-capture.js`** — Page script for operations.html. Initializes camera, runs `requestAnimationFrame` loop, calls `Pipeline.onLandmarks()` each frame, draws landmark overlay on canvas.

### Dev B Files

**`decoder.js`** — Exports `ctcGreedyDecode(output, timeSteps, numClasses)`. Greedy argmax → remove blanks → collapse repeats → map to labels.

**`inference-worker.js`** — Web Worker. Handles messages: `LOAD_MODEL`, `FRAME`, `RESET`. Internally: computes velocity, buffers frames, runs ONNX, CTC decodes, posts results back.

**`bridge.js`** — Exports `InferenceBridge` class. Creates the Worker, routes messages to `Pipeline.*` callbacks, handles Worker crashes with auto-restart (max 3).

**`operations-inference.js`** — Page script for operations.html. Creates bridge, sets `Pipeline.onLandmarks` to feed bridge, updates DOM (#current-gloss, #gloss-history, #metrics-bar, #model-status) on results.

**`demo.js`** — Simple: plays a `<video>` from `assets/videos/` with standard controls. No inference needed.

**`team.js`** — Contact form validation (name, email, message fields). Shows Bootstrap validation feedback.

---

## 11. Milestones

### Phase 1 — Scaffold (Days 1–2)

| Day | Dev A | Dev B |
|-----|-------|-------|
| 1 | Delete old React files. Create new structure. Write `index.html`, `operations.html` (skeleton), `about.html` with Bootstrap. Write `css/style.css`. Write `common.js` (navbar/footer). | Write `contract.js`. Write `team.html` + `team.js` (contact form with validation). Write `learn.html` (video grid + resources). |
| 2 | Polish index hero section. Add content to about.html (pipeline diagram, tech stack). Finalize navbar active states. | Write `demo.html` (video player page). Write `README.md`. Create dummy ONNX model in `models/`. |

### Phase 2 — Pipeline (Days 3–7)

| Day | Dev A | Dev B |
|-----|-------|-------|
| 3 | Write `capture.js` (camera start/stop). Test getUserMedia. | Write `decoder.js` (CTC greedy decode). Test with fake output data. |
| 4 | Write `landmarks.js` (MediaPipe init, landmark extraction, 26-subset). | Write `inference-worker.js` (velocity, buffer, ONNX load, inference, CTC decode). |
| 5 | Write `operations-capture.js` (camera loop, landmark overlay on canvas). Test: camera → landmarks → console.log. | Write `bridge.js` (Worker wrapper, message routing, crash recovery). |
| 6 | Test end-to-end: camera → landmarks → `Pipeline.onLandmarks()` logs data. | Write `operations-inference.js` (bridge init, DOM updates for gloss/metrics). Test with mock landmark emitter. |
| 7 | Wire landmark overlay drawing (canvas dots/lines on video). | Wire full pipeline: bridge receives landmarks → worker → gloss → DOM. |

### Phase 3 — Integration (Days 8–9)

| Day | Dev A | Dev B |
|-----|-------|-------|
| 8 | Integration: camera → MediaPipe → `Pipeline.onLandmarks` → bridge → worker → gloss → UI. Both devs test together. | Same session. Dev B debugs inference path while Dev A debugs capture path. |
| 9 | Fix camera edge cases (permissions, disconnect). Polish landmark overlay. | Fix inference edge cases (model load fail, worker crash). Polish metrics display. |

### Phase 4 — Polish + Deploy (Days 10–12)

| Day | Dev A | Dev B |
|-----|-------|-------|
| 10 | Error states for camera (retry button, permission denied message). Loading state while camera initializes. | Error states for model (load failure, inference failure). Loading skeleton while model downloads. |
| 11 | Responsive check (desktop only — verify at 1024px, 1440px). Final CSS polish. Take screenshots for README. | Finalize README with screenshots. |
| 12 | Final cross-browser test (Chrome, Firefox, Edge). | Deploy to GitHub Pages. Verify live site. |

---

## 12. Cleanup — Delete Old Files

Before starting Phase 1, Dev A runs:

```bash
# From CSLR-website root — remove all React/Vite/Tailwind files
rm -rf src/ node_modules/ scripts/
rm -f package.json package-lock.json tsconfig.json tsconfig.node.json
rm -f vite.config.ts tailwind.config.ts postcss.config.js
rm -f eslint.config.js components.json
rm -f index.html   # will be recreated

# Keep .git, .gitignore, and public/models/signgloss_stub.onnx
# Move model to new location
mkdir -p models
mv public/models/signgloss_stub.onnx models/
rm -rf public/

# Create new structure
mkdir -p css js models assets/images assets/videos
```

---

## 13. Risks + Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MediaPipe CDN is large (~5MB) | Slow first load | Show loading spinner; browser caches after first visit |
| ONNX model not ready | Can't test real inference | Stub model returns random output; swap later |
| Web Worker module support | Firefox ESR may not support `type: 'module'` workers | Use `importScripts()` fallback in worker if needed |
| Camera permission denied | Operations page is unusable | Show clear error with instructions to allow camera |
| 30fps landmark extraction is slow on weak GPU | Low FPS, choppy | Fall back to 15fps; skip frames |
| Model file too large for GitHub Pages | 404 or slow load | Keep under 100MB; use Git LFS if needed |
| No hot reload during dev | Slower iteration | Use VS Code Live Server extension |

---

## 14. Testing Strategy

### Phase-wise Validation

| Phase | Test |
|-------|------|
| Phase 1 | All 6 pages load. Navbar links work. Contact form validates. No console errors. |
| Phase 2 (Dev A) | Camera starts/stops. Landmarks logged to console. Canvas overlay draws dots. |
| Phase 2 (Dev B) | Worker loads model. Mock frames → gloss output. CTC decoder produces correct collapse. |
| Phase 3 | End-to-end: camera → gloss tokens appear in UI. Buffer progress updates. History accumulates. |
| Phase 4 | Error states shown on camera deny. Model load failure handled. Works in Chrome + Firefox + Edge. |

### Integration Test Checklist

- [ ] Start button → camera feed appears
- [ ] Landmark dots drawn on canvas over video
- [ ] Model status shows "Loading" → "Ready"
- [ ] Buffer progress bar fills as frames stream
- [ ] Gloss tokens appear after ~2 seconds
- [ ] History list grows with each inference
- [ ] Stop button → camera stops, pipeline resets
- [ ] Camera permission denied → error message shown
- [ ] Page refresh → clean state, no stale workers

---

## 15. Deployment

| What | How |
|------|-----|
| Host | GitHub Pages (`anand-rm-dev/CSLR-website`) |
| Method | Push to `main` → GitHub Pages serves root |
| No build step | Files are served as-is (HTML/CSS/JS) |
| Model file | Served from `models/signgloss_stub.onnx` |
| HTTPS | GitHub Pages provides HTTPS (required for camera access) |
| Routing | Direct HTML file links (no SPA, no hash router needed) |

### GitHub Pages Settings

1. Repo → Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)`
4. Save → site is live at `https://anand-rm-dev.github.io/CSLR-website/`

---

## 16. Open Questions

> [!IMPORTANT]
> **Which 11 hand landmarks** (out of MediaPipe's 21 per hand) does the model use? And which 4 pose landmarks? This affects `landmarks.js` subsetting. If unknown, we use wrist + all 5 fingertips + 5 MCP joints = 11 per hand, and left/right shoulder + left/right hip for pose.

> [!IMPORTANT]
> **Demo video file:** Do you have the screen recording ready, or will it be recorded later? If later, Dev B can create `demo.html` with a placeholder `<video>` tag and swap the `src` attribute when the recording is available.

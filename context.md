# SignGloss — Dev B Context

## Current Progress

### Phase 1 — Scaffold ✅ COMPLETE
- [x] `js/contract.js` — shared constants + Pipeline callback object
- [x] `team.html` — 2 team member cards + contact form with Bootstrap layout
- [x] `js/team.js` — form validation (name, email format, message >= 10 chars)
- [x] `learn.html` — 6 ISL YouTube video embeds + 4 learning resource cards
- [x] `demo.html` — placeholder video player + pipeline explanation
- [x] `js/demo.js` — shows video when available, falls back to placeholder
- [x] `models/signgloss_stub.onnx` — stub ONNX model (input [1,64,156] → output [1,64,601])
- [x] `scripts/generate_stub_model.py` — Python script to regenerate the stub model
- [x] `README.md` — project overview, tech stack, setup instructions, structure
- [x] `.gitignore` — standard ignores

### Phase 2 — Pipeline ✅ COMPLETE
- [x] `js/decoder.js` — CTC greedy decode (argmax → remove blanks → collapse repeats → labels)
- [x] `js/inference-worker.js` — Web Worker (ONNX load, velocity computation, frame buffer, inference, CTC decode)
- [x] `js/bridge.js` — InferenceBridge class (Worker wrapper, message routing, crash recovery max 3 restarts)
- [x] `js/operations-inference.js` — DOM updates for gloss/metrics/history, test mode mock emitter

### Phase 3 — Integration (Dev B parts) ✅ COMPLETE
- [x] Model load failure → error state with retry button
- [x] Inference failure → error display, doesn't crash pipeline
- [x] Buffer progress throttled to max 10/sec (in worker)
- [x] Loading spinner while model loads
- [x] Retry button for model load failures

### Phase 4 — Polish + Deploy ✅ COMPLETE
- [x] Operations page has full results panel with metrics bar, gloss display, history
- [x] Status indicator (loading/ready/error/restarting/fatal states)
- [x] `.gitignore` verified
- [x] All commits pushed to main

## File Ownership (Dev B)

| File | Purpose |
|------|---------|
| `js/contract.js` | Shared constants + Pipeline object |
| `team.html` | Team cards + contact form |
| `js/team.js` | Contact form validation |
| `learn.html` | ISL video tutorials + resources |
| `demo.html` | Demo video placeholder |
| `js/demo.js` | Demo video show/hide logic |
| `js/decoder.js` | CTC greedy decode |
| `js/inference-worker.js` | Web Worker (velocity + buffer + ONNX + CTC) |
| `js/bridge.js` | Worker bridge with crash recovery |
| `js/operations-inference.js` | Results panel UI wiring |
| `models/signgloss_stub.onnx` | Stub ONNX model |
| `scripts/generate_stub_model.py` | Model generation script |
| `README.md` | Project documentation |
| `.gitignore` | Git ignore rules |

## Key Decisions
- Used `importScripts` in worker instead of ES module import for browser compatibility
- CTC decoder duplicated in worker (can't import ES modules in classic worker)
- Status dot CSS placed as inline `<style>` in operations.html since style.css is Dev A owned
- Operations page HTML skeleton created by Dev B since Dev A hasn't started yet — Dev A should integrate their video panel into the existing structure
- Bootstrap Icons CDN added to all Dev B pages for icon support

## Integration Notes for Dev A
- `operations.html` has the full skeleton ready — Dev A needs to add `operations-capture.js` script tag and wire the `#video-panel` div
- `Pipeline.onLandmarks` is already hooked in `operations-inference.js` — it will forward frames to the worker automatically
- Dev A's `common.js` script tag is already in all Dev B pages — navbar/footer will appear once Dev A implements it
- The status-dot CSS in operations.html may need to be moved to `style.css` once Dev A creates the shared styles

## Pending (Not Dev B scope)
- Dev A: common.js (navbar/footer), warp-transition.js, capture.js, landmarks.js, operations-capture.js
- Dev A: style.css, index.html, about.html
- Demo video recording (requires completed website)
- Real ONNX model (swap signgloss_stub.onnx when ready)

==================== DEV A SECTION ====================

## Current Progress

### Phase 1 — Scaffold ✅ COMPLETE
- [x] `css/style.css` — full design system (dark theme, custom properties, navbar, hero, cards, pipeline, video container, responsive)
- [x] `js/warp-transition.js` — Interstellar lightspeed warp animation (200 stars, radial acceleration, white flash, arrival fade)
- [x] `js/common.js` — navbar injection (6 links), footer, warp canvas creation, nav click interception, arrival coordination
- [x] `index.html` — landing page with hero, SVG landmark viz, feature cards, stats grid, CTA
- [x] `about.html` — project overview, 5-step pipeline diagram, landmark table, performance metrics, tech stack table
- [x] `operations.html` — integrated video panel into Dev B skeleton (camera feed, canvas overlay, start/stop controls, error/loading states)

### Phase 2 — Pipeline ✅ COMPLETE
- [x] `js/capture.js` — WebRTC getUserMedia with specific error handling (NotAllowed, NotFound, NotReadable, Overconstrained)
- [x] `js/landmarks.js` — MediaPipe Tasks Vision init (HandLandmarker + PoseLandmarker), single processFrame() returns Float32Array[78] + raw results
- [x] `js/operations-capture.js` — camera loop, landmark overlay drawing (hands blue/green, pose yellow), FPS counter, Pipeline.onLandmarks feed, visibility handling

### Phase 3 — Integration ✅ COMPLETE
- [x] operations-capture.js wired into operations.html via script tag
- [x] Camera disconnect handled (track.onended)
- [x] Tab hidden pauses rAF loop, resume resets timestamp
- [x] Camera error states (permission denied, not found, in use)
- [x] MediaPipe loading overlay

### Phase 4 — Polish ✅ COMPLETE
- [x] Camera error UX (retry button, spinner, specific messages)
- [x] Status-dot CSS duplicated in style.css for shared use
- [x] Responsive design verified in CSS (1024px, 1440px breakpoints)
- [x] Hover effects, card shadows, smooth transitions
- [x] Warp transition refined

## File Ownership (Dev A)

| File | Purpose |
|------|---------|
| `index.html` | Landing page with hero, features, stats, CTA |
| `about.html` | Project overview, pipeline, tech stack |
| `operations.html` | Full operations page (video panel + Dev B results panel) |
| `css/style.css` | Complete design system and shared styles |
| `js/common.js` | Navbar/footer injection + warp trigger |
| `js/warp-transition.js` | Interstellar warp canvas animation |
| `js/capture.js` | WebRTC camera capture |
| `js/landmarks.js` | MediaPipe landmark extraction (26 landmarks) |
| `js/operations-capture.js` | Camera loop + overlay + Pipeline.onLandmarks |

## Key Decisions
- Used single `processFrame()` in landmarks.js to avoid double MediaPipe processing per frame
- MediaPipe loaded via dynamic `import()` from CDN (v0.10.14) — ESM compatible
- 26 landmarks: wrist + 5 MCP + 5 fingertips per hand (indices 0,2,4,5,8,9,12,13,16,17,20) + shoulders + elbows (pose indices 11,12,13,14)
- Status-dot CSS kept as inline `<style>` in operations.html (preserving Dev B's approach) AND added to style.css
- Warp arrival animation uses sessionStorage to coordinate between page navigations
- Bootstrap Icons CDN added to Dev A pages to match Dev B's usage
- `operations.html` preserves all of Dev B's results panel, metrics bar, and inline styles unchanged

## Integration Notes
- `Pipeline.onLandmarks` is called every rAF frame from operations-capture.js
- operations-inference.js (Dev B) wraps the original Pipeline.onLandmarks to forward to bridge
- Both scripts coexist on operations.html — operations-capture.js loaded AFTER operations-inference.js so Dev B's hook is set first
- Warp transition works across all 6 pages via common.js

## Pending
- Cleanup old files: src/, node_modules/, tailwind.config.js, tsconfig.app.json, package-lock.json (commands couldn't execute due to sandbox restriction — needs manual deletion)
- Demo video recording
- Real ONNX model swap

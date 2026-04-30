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

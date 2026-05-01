# SignGloss — Dev B Context

## Current Progress

All Dev B tasks across all 4 phases are complete. Audit fixes applied.

### Audit Fixes Applied
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

## Files Changed in Audit Fix Round
| File | Change |
|------|--------|
| `js/landmarks.js` | Fixed CDN import URL + monotonic timestamp guard |
| `js/common.js` | Removed beforeunload warp flag setter |
| `js/warp-transition.js` | Added sessionStorage flag before navigation |
| `js/operations-capture.js` | Removed dead POSITION_FEATURES import |
| `operations.html` | Removed duplicate inline status-dot CSS |
| `assets/images/random.txt` | Deleted |
| `assets/videos/random 2.txt` | Deleted |

## System Status
- All 6 pages load correctly
- Pipeline: camera → MediaPipe → worker → gloss → UI should now work end-to-end
- Warp transition only triggers arrival on actual nav clicks
- ONNX model loads from CDN WASM paths
- Contact form validates
- All critical audit issues resolved (except CRITICAL-3 which is intentionally overridden)

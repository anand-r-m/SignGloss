# SignGloss — Dev B Context

## Current Progress

All Dev B tasks complete. Audit fixes applied. Two UI refinement passes done.

## Latest Refinement — Motion & Transition System

Visual direction: clean, minimal, alive. Controlled motion with subtle depth.

### Page Transition System

Custom directional transition with layered depth:

- **Exit**: Current page slides left (-2%) with scale(0.98) + opacity fade. A horizontal wipe element scales from left to right across the screen.
- **Bridge**: The wipe overlay (sg-transition-wipe) provides visual continuity — a subtle dark plane sweeping across.
- **Enter**: New page slides in from right (+2%) with scale(0.98→1) + opacity. Wipe retracts from right.
- **Timing**: ~450ms total, cubic-bezier(0.4, 0, 0.2, 1) for exits, cubic-bezier(0.16, 1, 0.3, 1) for entries.
- **State**: sessionStorage tracks transition direction between pages.

### Motion System

Unified timing variables in CSS:
- `--sg-ease`: cubic-bezier(0.4, 0, 0.2, 1) — standard
- `--sg-ease-out`: cubic-bezier(0.16, 1, 0.3, 1) — decelerate (entries, hovers)
- All interactive elements use the same easing for consistency

### Micro-Interactions

- **Buttons**: translateY(-1px) + scale(1.02) on hover, scale(0.98) on active
- **Cards**: translateY(-3px) + shadow elevation on hover, icon scale(1.08)
- **Stat cards / Pipeline steps**: translateY(-2px) on hover
- **Nav links**: underline uses scaleX(0→1) transform for smooth reveal
- **Tech table rows**: subtle background shift on hover
- **Brand**: opacity shift on hover

### Depth System

Three shadow levels via CSS variables:
- `--sg-shadow-sm`: 0 1px 3px — base resting state
- `--sg-shadow-md`: 0 4px 16px — hover/elevated state
- `--sg-shadow-lg`: 0 8px 32px — prominent elements (video container)

Cards rest with sm shadow, elevate to md on hover.

### Accent Color

Single muted accent: `#7c8aff` (desaturated blue-violet)
Used only for:
- Active nav underlines
- Buttons (primary action)
- Card icon backgrounds (8% opacity tint)
- Badges
- Spinner accent

No glow. No neon. Just a controlled accent.

### About Page Expandable Overview

- Smooth expand/collapse: max-height 0→900px, 400ms ease-out
- Chevron rotates 180deg with ease-out
- Content fades in with opacity transition
- Hover feedback on toggle (opacity 0.8)

### Files Modified
| File | Change |
|------|--------|
| `css/style.css` | Full rewrite — motion variables, shadow system, accent color, micro-interactions, transition wipe |
| `js/warp-transition.js` | Directional slide+scale+wipe transition replacing simple fade |
| `js/common.js` | Updated overlay creation (div wipe), new sessionStorage key |

### Prior Work
- Audit fixes (MediaPipe CDN, timestamp guard, dead imports, etc.)
- Phase 1–4 pipeline complete
- All 6 pages functional

## System Status
- All pages load correctly
- Transition: directional slide + wipe + depth
- Pipeline: camera → MediaPipe → worker → gloss → UI (end-to-end)
- ONNX model loads from CDN WASM paths
- Contact form validates
- Visual: minimal dark, muted accent, controlled motion, layered depth

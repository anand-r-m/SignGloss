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

==================== DEV A SECTION ====================

## Transition System — Multi-Stroke Opposing Paint

Replaced the previous directional slide+wipe transition with a multi-stroke paint brush system.

### Core Concept

On navigation, 4 large SVG path strokes sweep across the screen in alternating directions (L→R, R→L, L→R, R→L), covering the viewport like rapid brush strokes. After the page switches, strokes continue moving in the same direction and exit the opposite side, revealing the new page underneath.

### Stroke Logic

- 4 SVG `<path>` elements with thick curved shapes
- Alternating directions: strokes 0,2 go left→right; strokes 1,3 go right→left
- Each stroke has unique width, curve offset, and slight rotation (±2–4deg)
- Staggered timing: 55ms between each stroke start
- Two flat colors: `#2a1a1e` (muted dark red) and `#1e1a2e` (muted purple)
- No gradients, no glow — flat bold fills only

### Timing

| Phase | Duration |
|-------|----------|
| Cover (strokes enter) | ~380ms |
| Page navigation | fires after cover + max stagger |
| Reveal (strokes exit) | ~370ms |
| Total | ~750ms |
| Easing | cubic-bezier(0.4, 0, 0.2, 1) |
| Stagger | 55ms per stroke |

### Direction Continuity

- Cover: strokes translateX from off-screen to center (0%)
- Reveal: strokes continue translateX in same direction to exit opposite side
- No reversal — strokes move through, not back

### Session Persistence

- `sessionStorage.setItem('sg-paint-active', '1')` set before navigation
- On arrival, checked and cleared — triggers reveal animation
- Fallback: if animation fails, raw navigation fires after 1250ms timeout

### Performance

- Only `transform` properties animated (translateX + rotate)
- `will-change: transform` on all stroke paths
- Maximum 4 SVG paths (under the 5 limit)
- ViewBox updates on resize for responsive behavior

### Files Modified

| File | Change |
|------|--------|
| `js/paint-transition.js` | NEW — stroke generation, cover/reveal animation, SVG overlay |
| `js/common.js` | Replaced warp-transition import with paint-transition; removed div overlay creation |
| `css/style.css` | Replaced `.sg-transition-wipe` with `.transition-overlay-svg` + `.paint-stroke` |
| `js/warp-transition.js` | DEPRECATED — gutted, marked for deletion |

### Integration Notes

- Same navigation interception pattern preserved (click delegate on `.sg-navbar a.nav-link, .warp-link`)
- Same `preventDefault()` → animate → navigate flow
- Same `sessionStorage` pattern for cross-page state
- No per-page duplication — overlay injected once via `common.js` init
- No external animation libraries used

==================== DEV A SECTION ====================

## Full UI/UX Redesign — May 2026

### Chosen Design Style

**Tactile Digital / Deformable UI** (Style #60 from ui-ux-pro-max skill database)
- Warm, physical, spring-physics-driven
- Avoids: glassmorphism, aurora gradients, neon cyberpunk, generic AI SaaS

### Color Palette

| Token | Hex | Role |
|-------|-----|------|
| `--surface-deep` | `#1A1614` | Page background |
| `--surface-card` | `#252220` | Card backgrounds |
| `--surface-raised` | `#322E2B` | Elevated elements |
| `--accent-primary` | `#E8734A` | Warm terracotta accent |
| `--accent-secondary` | `#D4A574` | Sand/gold secondary |
| `--text-primary` | `#F0EBE3` | Body text |
| `--text-muted` | `#9A8E82` | Muted text |
| `--text-heading` | `#FAF7F2` | Headings |

### Typography

- Headings: **Syne** (weight 600-800)
- Body: **Manrope** (weight 400-500)
- Source: Google Fonts CDN

### Motion System

- Library: **Motion One** via CDN (`https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js`)
- API: `const { animate, inView, stagger } = Motion;`
- Spring config: `stiffness: 300, damping: 30`

#### Animations Implemented

| Animation | File | Trigger |
|-----------|------|---------|
| Staggered section entrance | `js/animations.js` | `inView()` |
| Count-up stats | `js/animations.js` | `inView()`, fires once |
| Draggable card carousel | `js/animations.js` | User drag / arrow click |
| Typewriter gloss output | `js/animations.js` | New gloss result |
| "SignGloss" intro spin | `js/animations.js` | Page load (index only) |
| Paint-stroke page wipe | `js/transitions.js` | Link click / page load |

### Transition System

- SVG paint-stroke wipe (replaces starfield warp)
- Exit: stroke sweeps LEFT → RIGHT
- Enter: stroke sweeps RIGHT → LEFT
- Duration: 0.55s, easing: `[0.76, 0, 0.24, 1]`
- State: `sessionStorage('sg-transition-active')`

### Files Modified

| File | Change |
|------|--------|
| `css/style.css` | Complete rewrite — new design system |
| `js/common.js` | Simplified — removed warp dependency |
| `js/transitions.js` | NEW — paint-stroke SVG transition |
| `js/animations.js` | NEW — Motion One shared animations |
| `index.html` | Full redesign — intro, carousel, stats |
| `about.html` | Restyled to new system |
| `operations.html` | Restyled, typewriter gloss |
| `demo.html` | Restyled |
| `learn.html` | Restyled |
| `team.html` | Restyled |

### Files NOT Modified (Dev B Protected)

- `js/contract.js`
- `js/bridge.js`
- `js/inference-worker.js`
- `js/decoder.js`
- `js/operations-inference.js`
- `js/operations-capture.js`
- `models/signgloss_stub.onnx`


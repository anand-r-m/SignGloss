# SignGloss — PRD for Dev A (Vidyasree)

> Capture & Frontend — CSS, animations, transitions, index, about, operations layout

---

## 1. Project Context & Constraints

**SignGloss** is a browser-based real-time ISL to text translation tool. This PRD covers the **complete visual redesign** — you own the design system, shared infrastructure (navbar, footer, transitions, animations), and the pages: `index.html`, `about.html`, and `operations.html` (HTML/layout only).

> [!CAUTION]
> **Technology Constraint — STRICT**: **ONLY vanilla HTML, vanilla CSS, vanilla JavaScript, and Bootstrap 5.** NO external animation libraries (no Motion One, no GSAP, no Anime.js, no Framer Motion). All animations must use CSS `@keyframes`, CSS `transition`, `requestAnimationFrame`, `IntersectionObserver`, and vanilla DOM manipulation.

### Codebase Location
```
/home/anand_rm/Documents/UID project/UID/
```

### Your Files (Dev A Owns)
```
css/style.css            — Complete rewrite (new design system)
js/common.js             — Rewrite (navbar/footer injection, transition hooks)
js/transitions.js        — Rewrite (cloud-roll page transition)
js/animations.js         — Rewrite (scroll entrance, count-up, carousel)
js/intro-animation.js    — NEW (Dijkstra sphere network canvas animation)
index.html               — Complete rewrite
about.html               — Complete rewrite
operations.html          — Complete rewrite (HTML SKELETON ONLY — see boundary rules)
```

### Files You MUST NOT Touch (Dev B Pipeline)
```
js/contract.js
js/bridge.js
js/inference-worker.js
js/decoder.js
js/operations-inference.js
js/operations-capture.js
models/signgloss_stub.onnx
```

### Files Dev B Owns (do not modify)
```
team.html
demo.html
learn.html
js/team.js
js/demo.js
```

---

## 2. Design System — `css/style.css`

### 2.1 Color Palette — Strict Black & White Monochrome

```css
:root {
  /* Surfaces */
  --bg-deep: #0A0A0A;
  --bg-surface-1: #111111;
  --bg-surface-2: #1A1A1A;
  --bg-surface-3: #222222;
  
  /* Borders */
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.08);
  --border-hover: rgba(255,255,255,0.15);
  --border-focus: rgba(255,255,255,0.2);
  
  /* Text */
  --text-primary: #F5F5F5;
  --text-secondary: #A0A0A0;
  --text-muted: #666666;
  --text-heading: #F5F5F5;
  
  /* Functional (ONLY for data visualization — not decoration) */
  --color-success: #4ADE80;
  --color-warning: #FACC15;
  --color-danger: #F87171;
  
  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0,0,0,0.5);
  --shadow-card-hover: 0 8px 32px rgba(0,0,0,0.6);
  --shadow-button: 0 2px 12px rgba(0,0,0,0.4);
  
  /* Radii */
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-button: 8px;
  --radius-badge: 20px;
  --radius-round: 50%;
  
  /* Glassmorphism */
  --glass-bg: rgba(255,255,255,0.03);
  --glass-bg-medium: rgba(0,0,0,0.5);
  --glass-bg-heavy: rgba(0,0,0,0.7);
  --glass-blur: blur(16px);
  --glass-blur-sm: blur(8px);
}
```

> [!CAUTION]
> **NO neon colors. NO colored shadows. NO gradient backgrounds.** Only black, white, and alpha variations. The only exceptions are the functional confidence bar colors (green/yellow/red).

### 2.2 Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

| Element | Font | Weight | Size | Color |
|---------|------|--------|------|-------|
| Page title (h1) | Space Grotesk | 700 | `clamp(2.5rem, 6vw, 4.5rem)` | `--text-heading` |
| Section title (h2) | Space Grotesk | 700 | `clamp(1.8rem, 3.5vw, 2.2rem)` | `--text-heading` |
| Card title (h3–h5) | Space Grotesk | 600 | `1rem–1.2rem` | `--text-heading` |
| Body text | Inter | 400 | `0.9rem–1rem` | `--text-secondary` |
| Labels/meta | Inter | 500 | `0.75rem`, uppercase, `letter-spacing: 2px` | `--text-muted` |
| Stat numbers | JetBrains Mono | 700 | `2.8rem–3.5rem` | `--text-primary` |
| Code/metrics | JetBrains Mono | 400 | `0.8rem–0.85rem` | `--text-primary` |

### 2.3 Component Styles

**Glass Card** (default for ALL cards — Dev B will use these classes too):
```css
.sg-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-none);  /* Sharp edges */
  padding: 2rem;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1),
              box-shadow 0.3s cubic-bezier(0.4,0,0.2,1),
              border-color 0.3s ease;
}
.sg-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--border-hover);
}
```

**Primary Button**:
```css
.sg-btn-primary {
  background: #F5F5F5;
  color: #0A0A0A;
  border: none;
  border-radius: var(--radius-button);
  padding: 0.85rem 2rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.sg-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255,255,255,0.1);
}
```

**Outline Button**:
```css
.sg-btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: var(--radius-button);
  padding: 0.85rem 2rem;
  font-family: var(--font-body);
  font-weight: 600;
}
.sg-btn-outline:hover {
  border-color: rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.03);
}
```

---

## 3. Navbar & Footer — `js/common.js`

**Navbar** (fixed top):
- `background: rgba(10,10,10,0.85)`, `backdrop-filter: blur(16px)`
- `border-bottom: 1px solid rgba(255,255,255,0.04)`
- Brand: "SignGloss" — `Space Grotesk`, 700, `#F5F5F5`
- Links: Home, About, Demo, Operations, Learn, Team
- Link style: `Inter`, `0.85rem`, `#666666`; active: `#F5F5F5` + `1px` underline; hover: `#A0A0A0`
- Mobile: Bootstrap hamburger menu, slide-down panel with same glassmorphic bg

**Footer**:
- `background: #111111`, top border `1px solid rgba(255,255,255,0.06)`
- "© 2026 SignGloss — Real-time ISL to Gloss Translation"
- `Inter`, `0.8rem`, `#666666`, centered

Both injected via `injectNavbar()` and `injectFooter()` into `#navbar-placeholder` and `#footer-placeholder` divs on every page.

---

## 4. Intro Animation — `js/intro-animation.js`

> [!IMPORTANT]
> Plays ONLY on `index.html`, ONLY on first page load. Full-screen `<canvas>` overlay. Pure vanilla JS + Canvas 2D API.

### Visual Reference

The network must match the attached reference image. Key characteristics:

- **Sparse, web-like network** — NOT a dense triangulated mesh. Nodes scattered unevenly with large empty areas between clusters.
- **Long-range connections** — lines span 200–500px+, criss-crossing the screen diagonally. NOT nearest-neighbor only.
- **Glowing nodes with bloom** — bright white core (`#FFFFFF`, 2–5px) with soft radial gradient halo (12–20px, `rgba(255,255,255,0.3)` → transparent). Render: bloom gradient first, then solid core dot on top.
- **Varying node sizes** — tiny (2px core, 8px bloom) to hub nodes (5px core, 20px bloom). Hubs have more connections.
- **Varying line opacity for depth** — `rgba(255,255,255,0.08)` (faint, background) to `rgba(255,255,255,0.4)` (bright, foreground). Creates 3D depth layering.
- **Uneven density** — tight clusters of 5–8 nodes in some areas, sparse elsewhere.
- **Line width** — default 0.5px–1px. Only Dijkstra path uses 1.5–2px.

### Node & Connection Rules
- **Total nodes**: 120–180
- **Connections per node**: 2–6. NOT limited to nearest neighbors — 400px radius, some 500px+ for dramatic cross-screen lines.
- **Hub nodes** (10–15%): 5–8 connections, larger radius.

### Sequence (~5.5 seconds):

| Phase | Time | Description |
|-------|------|-------------|
| 1. Black | 0–500ms | Pure `#0A0A0A`. Nothing. |
| 2. First sphere | 500–1000ms | Single glowing sphere at screen center — bloom halo first, then core sharpens. |
| 3. Network generation | 1000–3500ms | Nodes spawn outward from center in waves (15–25 per wave). Connections draw in as each node appears. **Center area kept clear** — negative space forms "SignGloss". Nodes denser around letter outlines. |
| 4. Dijkstra path | 2000–4500ms | Highlighted path traces through network from top-left. Explored edges flash at 50% opacity, committed edges brighten to `#FFFFFF` at 2px width. Nodes along path get bloom pulse. Path outlines the negative space "SignGloss". |
| 5. Hold + Fade | 4500–5500ms | Network holds 1s (subtle bloom breathing ±10%). Overlay fades out 500ms. |

### Technical Notes:
```javascript
// Rendering order (back to front):
// 1. All edges (thin lines, varying opacity)
// 2. All node bloom halos (radial gradients)
// 3. All node cores (solid white dots)
// 4. Dijkstra highlighted path (bright edges + pulsing nodes)
//
// Negative space: render "SignGloss" to offscreen canvas,
// sample pixel data as bitmap mask, reject nodes inside letters,
// increase density in 30-50px band around letter edges.
```

### HTML/CSS:
```html
<div id="sg-intro-overlay">
  <canvas id="sg-intro-canvas"></canvas>
</div>
```
```css
#sg-intro-overlay {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 10000; background: #0A0A0A;
}
#sg-intro-canvas { width: 100%; height: 100%; display: block; }
```

---

## 5. Page Transitions — `js/transitions.js`

### Horizontal Cloud-Roll Transition (vanilla JS only)

**Exit (current page):**
- All `.animate-child` elements slide left: `translateX(0) → translateX(-100px)`, `opacity: 1 → 0`
- Staggered: elements positioned further left start first
- Duration: `400ms`, easing: `cubic-bezier(0.4, 0, 0.2, 1)`

**Enter (new page):**
- Elements slide in from right: `translateX(100px) → translateX(0)`, `opacity: 0 → 1`
- Stagger: leftmost elements arrive first
- Duration: `450ms`, easing: `cubic-bezier(0.16, 1, 0.3, 1)`

**Link interception**: `click` delegate on `a[href]`, `preventDefault()`, animate exit, set `sessionStorage('sg-transition-active', '1')`, navigate. On new page load: check sessionStorage → play enter animation.

---

## 6. Scroll Animations — `js/animations.js`

All vanilla JS — no libraries.

### Staggered Section Entrance
- `IntersectionObserver` with `{ threshold: 0.15 }` on each `section`
- On intersection: iterate `.animate-child` elements, apply staggered `transitionDelay` (index × 120ms)
- Add `.animate-visible` class → CSS transition: `opacity 0.5s ease-out, transform 0.5s ease-out`

### Count-Up Stats
- `IntersectionObserver` on `.sg-stats-grid` (fire once)
- `requestAnimationFrame` loop: interpolate 0 → target over ~1.5s
- Ease-out curve: `1 - Math.pow(1 - t, 3)`

### Carousel
- Drag-to-scroll via `mousedown`/`mousemove`/`mouseup` + touch equivalents
- Snap-to-card with CSS `transition: transform 0.3s ease-out`
- Arrow buttons shift by one card width

### Intro Hook
- If `#sg-intro-overlay` exists, call `initIntroAnimation()` from `intro-animation.js`

---

## 7. Page: Index — `index.html`

**Structure (top to bottom):**

1. **Intro overlay** (canvas, removed after animation completes)

2. **Hero Section** (`min-height: 100vh`, centered):
   - "SignGloss" — `Space Grotesk`, 700, `clamp(3rem, 7vw, 5rem)`, `letter-spacing: -2px`
   - Subtitle: *"Real-time Indian Sign Language to text — entirely in your browser."* — `Inter`, 400, `1.15rem`, `#A0A0A0`
   - Two buttons, `16px` gap:
     - **"Try It"** → `operations.html` (`.sg-btn-primary`)
     - **"Info"** → `about.html` (`.sg-btn-outline`)

3. **Stats Section** (after `120px` gap):
   - 4 stat cards, **asymmetric masonry layout** (NOT uniform grid)
   - Different sizes + slight vertical offsets
   - Stats: `26` Landmarks Tracked, `600` Gloss Classes, `30` FPS, `<200ms` Inference Time
   - Numbers: `JetBrains Mono`, 700, `3rem`
   - Labels: `Inter`, `0.75rem`, uppercase, `letter-spacing: 2px`, `#666666`

4. **Pipeline Visual**:
   - 5 nodes, thin lines with arrows: Camera → MediaPipe → Web Worker → ONNX Model → CTC Decode
   - Nodes: small rectangles, 1px white border, `JetBrains Mono` `0.7rem` labels

5. **Key Features & Tech Ticker**:
   - Heading: "Key Features & Tech Used"
   - Auto-scrolling horizontal marquee, infinite loop, ~40px/s
   - Items: "Real-Time Translation" · "100% Client-Side" · "ISL Support" · "GPU Accelerated" · "MediaPipe" · "ONNX Runtime" · "Web Workers" · "CTC Decoding" · "Privacy First" · "No Backend" · "WebRTC" · "30 FPS"
   - CSS: `@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }` on duplicated track

6. **Footer**

---

## 8. Page: About — `about.html`

1. **Title**: "How We Did It" — centered, `Space Grotesk`, 700
2. **Intro paragraph**: 3–4 sentences, centered, max-width `640px`
3. **"Our System" heading**
4. **5 flush cards** (no gap, no border-radius, shared borders):
   - Single row (3+2 on mobile), `gap: 0`
   - Labels: Pipeline, Transformer Architecture, Datasets Used, Impact, Future Scope
   
   **Interaction:**
   - Hover: `translateY(-3px)`, border brightens
   - Click: card expands downward below "Our System" heading, shows detailed content. Other cards collapse. `max-height` animation + `opacity` fade.
   - Click again: collapses back to grid

   **Content for each card:**
   - **Pipeline**: 5-stage pipeline explained. Tensor shapes [1, 64, 156] → [1, 64, 601].
   - **Transformer Architecture**: Transformer encoder, positional encoding, 64-frame windows. 156 features → 601 classes.
   - **Datasets Used**: INCLUDE ISL dataset, 600 gloss classes, webcam recordings, landmark sequences.
   - **Impact**: 1.8M+ deaf/hard-of-hearing in India. Browser-only. Complete privacy.
   - **Future Scope**: Sentence translation, more sign languages, larger datasets, mobile, offline.

5. **Footer**

---

## 9. Page: Operations — `operations.html`

> [!IMPORTANT]
> You own the **HTML layout and CSS** for this page. Dev B's inference pipeline JS files (`operations-inference.js`, `operations-capture.js`) will wire into the DOM elements by ID.

> [!WARNING]
> **Preserve ALL these element IDs** — Dev B's pipeline depends on them:
> `#camera-feed`, `#landmark-canvas`, `#fps-display`, `#camera-placeholder`, `#start-btn`, `#stop-btn`, `#current-gloss`, `#gloss-history`, `#metrics-bar`, `#buffer-progress`, `#inference-time`, `#confidence-display`, `#status-dot`, `#status-label`, `#mediapipe-loading`, `#camera-error`, `#camera-error-message`, `#retry-camera-btn`, `#model-loading-spinner`, `#model-error-state`, `#retry-model-btn`, `#test-mode-btn`, `#video-container`, `#video-panel`, `#results-panel`, `#video-controls`, `#error-display`

### Layout

Camera feed (`<video>` + `<canvas>` overlay) fills the **entire viewport** — edge to edge, no padding. A semi-transparent gradient overlay sits on top of the feed (`linear-gradient(0deg, rgba(10,10,10,0.8) 0%, transparent 40%, transparent 60%, rgba(10,10,10,0.4) 100%)`). All UI elements float as absolute-positioned overlays on top.

#### 1. Pre-Start State — Translate Trigger (center of viewport)

Large glass-panel button, centered vertically and horizontally:
```
┌─────────────────────────────────┐
│         [sensors icon 64px]     │  ← Bootstrap Icons: bi-broadcast
│                                 │
│          TRANSLATE              │  ← Space Grotesk, h1 size, uppercase, bold, wide tracking
│                                 │
│  Initialize Computational       │  ← JetBrains Mono, 12px, 60% opacity
│     Inference Engine            │
└─────────────────────────────────┘
```
- Style: `.glass-panel` (rgba(255,255,255,0.03), backdrop-filter blur(16px), 1px border rgba(255,255,255,0.06))
- `border-radius: 8px`, generous padding (`40px horizontal, 24px vertical`)
- **Hover**: background transitions to solid `#F5F5F5`, text inverts to `#0A0A0A`
- **Click**: requests camera permission → turns on camera → hides this button → starts detection
- The overlay cards below are visible in placeholder/empty state behind the translate button

#### 2. Top-Left — 3 Circular Metric Badges (stacked vertically, `4px` gap)

Three small **circular** glass badges, each `56px × 56px` (`3.5rem`), `border-radius: 50%`:

```
  ┌──────┐
  │ FPS  │   ← label: JetBrains Mono, 8px, --text-secondary
  │ 60.0 │   ← value: JetBrains Mono, 12px, --text-primary
  └──────┘
  ┌──────┐
  │LATEN.│
  │ 12ms │
  └──────┘
  ┌──────┐
  │GLOSS │
  │ 0014 │
  └──────┘
```

- Style: `background: rgba(255,255,255,0.03)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.06)`
- Each badge: centered flex-col with label on top, value below
- Label: `JetBrains Mono`, `8px`, uppercase, `--text-secondary`
- Value: `JetBrains Mono`, `12px`, `--text-primary`
- Position: `top: ~112px` (below navbar), `left: 16px`
- IDs: `#fps-display` (FPS value), `#inference-time` (latency value), `#gloss-count` (gloss count value)

#### 3. Right Edge — Inference Log Panel

Vertical panel spanning from below navbar to near bottom. `width: 224px` (`14rem`), `right: 16px`. Only visible on `lg` screens and above (`display: none` on mobile).

**Header**: "INFERENCE LOG" — `JetBrains Mono`, `12px`, uppercase, `--text-secondary`, outside the panel above it

**Panel body**: `.glass-panel`, full height, vertical flex column, `overflow: hidden`

**Each log entry** (stacked vertically, `16px` gap):
```
│ ██ 14:02:11              │  ← timestamp: JetBrains Mono, 10px, --text-secondary
│ ██ GREETINGS              │  ← gloss: JetBrains Mono, 16px, uppercase, --text-primary
```

- **Current entry** (topmost): `opacity: 1.0`, has a `2px` solid left border in `--text-primary` color, `padding-left: 16px`
- **Previous entries**: no left border, just `padding-left: 16px`, opacity fading: `0.80`, `0.60`, `0.40`, `0.20`
- **Bottom of panel** (pinned with `margin-top: auto`): separator line (`border-top: 1px solid rgba(255,255,255,0.1)`), then a row with:
  - Pulsing dot: `8px × 8px`, `border-radius: 50%`, `background: #F5F5F5`, CSS `animation: pulse 2s infinite`
  - "LIVE SCANNING" — `JetBrains Mono`, `12px`, uppercase, `--text-primary`
- **Click** the panel → all entries become fully opaque + scrollable; click again → returns to fading view
- IDs: `#gloss-history` (the panel body), `#status-dot` (pulsing dot), `#status-label` ("LIVE SCANNING" text)

#### 4. Bottom Center — Gloss Output Card

Centered horizontally, positioned `40px` from bottom. `max-width: 384px` (sm), `width: 100%`, `padding: 0 16px` for mobile margins.

```
┌──────────────────────────────────────────┐
│████████████████████████████████████░░░░░░│  ← certainty bar (top edge, 4px)
├──────────────────────────────────────────┤
│ ⚙ Prediction: 92.4%              [copy] │  ← header row
│                                          │
│              NAMASTE                     │  ← Space Grotesk, h1, uppercase, wide tracking
│     Semantic Mapping: Standard           │  ← Inter, 12px, --text-secondary
│         Formal Greeting                  │
│                                          │
│  ████████    ████████    ░░░░░░░░       │  ← 3-segment confidence grid
└──────────────────────────────────────────┘
```

**Card style**: `background: rgba(255,255,255,0.02)`, `backdrop-filter: blur(40px)`, `border: 1px solid rgba(255,255,255,0.05)`, **`border-radius: 12px`** (exception — this card gets rounded corners), `overflow: hidden`

**Certainty bar** (top edge):
- Absolutely positioned at top, `height: 4px`, full width
- Width = confidence percentage (e.g. `width: 92%`)
- Color: `--text-primary` (#F5F5F5) — monochrome, not colored

**Header row** (below bar, inside padding):
- Left: icon (`bi-gear-fill`, 14px, `--text-primary`) + "Prediction: 92.4%" (`JetBrains Mono`, 12px, uppercase, `--text-secondary`)
- Right: copy icon (`bi-clipboard`, `--text-primary` at 40% opacity), clickable
- Background: `--bg-surface-3` pill, small padding
- ID: `#confidence-display` (the "92.4%" text)

**Gloss text** (center):
- `Space Grotesk`, `h1` size (32px), uppercase, `letter-spacing: 0.1em`, `--text-primary`
- Vertically padded (`16px` top/bottom)
- ID: `#current-gloss`

**Semantic mapping subtitle**:
- `Inter`, `12px`, `--text-secondary`, centered
- Shows: "Semantic Mapping: [description of the sign]"

**3-segment confidence grid** (bottom):
- 3 equal-width horizontal bars, `height: 4px`, `gap: 16px`
- Filled segments: `background: --text-primary`
- Empty segments: `background: rgba(255,255,255,0.06)`
- Number of filled segments = confidence level (1/3 = low, 2/3 = medium, 3/3 = high)

#### 5. Bottom-Left — Terminate Operations Button

Rectangular button (NOT a circle), positioned `40px` from bottom, `16px` from left:

```
┌────────────────────────┐
│  ⏹  TERM OPS          │
└────────────────────────┘
```

- Icon: `bi-stop-circle` + text "TERM OPS"
- Style: `background: var(--color-danger)` muted container (dark red, ~`#93000A`), `color: #ffdad6`
- `border-radius: 2px` (sharp), uppercase, `Space Grotesk`, bold, wide tracking
- Padding: `16px 24px`
- **Hover**: background brightens to `#F87171`, text color shifts to dark
- **Click**: stops translation, turns off camera, returns to pre-start state
- ID: `#stop-btn`

### Script Tags (end of body)
```html
<script src="js/common.js"></script>
<script src="js/transitions.js"></script>
<script src="js/animations.js"></script>
<script type="module" src="js/operations-inference.js"></script>  <!-- Dev B -->
<script type="module" src="js/operations-capture.js"></script>    <!-- Dev B -->
```

---

## 10. External Dependencies

> [!IMPORTANT]
> **Only these. Nothing else.**

```html
<!-- Bootstrap 5.3 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

---

## 11. Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| `> 1200px` | Full desktop layout |
| `992px–1200px` | Slight compression, cards stack 2-wide |
| `768px–992px` | Mobile nav hamburger, single column |
| `< 768px` | Full mobile: stacked cards, smaller text |

---

## 12. SEO & Accessibility

- Unique `<title>` and `<meta description>` per page
- Single `<h1>` with proper heading hierarchy
- Semantic HTML5 (`<section>`, `<nav>`, `<footer>`, `<main>`)
- All interactive elements: unique `id` attributes
- `aria-label` on icon-only buttons
- `prefers-reduced-motion`: disable all animations

---

## 13. Dev A Checklist

- [ ] `css/style.css` — Full design system with all tokens, components, responsive rules
- [ ] `js/common.js` — Navbar + footer inject correctly on all 6 pages
- [ ] `js/intro-animation.js` — Dijkstra network → "SignGloss" negative space → fade out
- [ ] `js/transitions.js` — Cloud-roll transition on every nav link click
- [ ] `js/animations.js` — Scroll entrance, count-up stats, carousel (all vanilla)
- [ ] `index.html` — Hero + stats masonry + pipeline + ticker + footer
- [ ] `about.html` — 5 flush expandable cards with detailed content
- [ ] `operations.html` — Full-screen camera layout, all element IDs preserved
- [ ] No neon colors — strict black/white/gray
- [ ] All cards glassmorphic, sharp edges (border-radius: 0), buttons 8px
- [ ] Responsive at 1440px, 1024px, 768px, 375px
- [ ] No external animation libraries

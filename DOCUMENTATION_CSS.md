# SignGloss — CSS Documentation

This document explains every major CSS class, layout system, animation, hover effect, media query, and visual technique used in the project.

---

## CSS File Overview

All styles live in ONE file: `css/style.css` (1156 lines). Some pages also have inline `<style>` blocks for page-specific styles (about.html, learn.html, team.html).

---

## CSS Variables (Design Tokens)

CSS variables are defined in `:root` (lines 9–41). Think of them as "named colors and values" you can reuse everywhere.

```css
:root {
  /* BACKGROUNDS — darkest to lightest */
  --bg-deep: #0A0A0A;           /* Main page background (near black) */
  --bg-surface-1: #111111;       /* Footer background */
  --bg-surface-2: #1A1A1A;       /* Carousel buttons, table backgrounds */
  --bg-surface-3: #222222;       /* Table headers, badge backgrounds */

  /* BORDERS — all white at very low opacity */
  --border-subtle: rgba(255, 255, 255, 0.06);   /* Barely visible */
  --border-default: rgba(255, 255, 255, 0.08);   /* Normal card borders */
  --border-hover: rgba(255, 255, 255, 0.15);      /* On hover */
  --border-focus: rgba(255, 255, 255, 0.2);       /* On focus */

  /* TEXT COLORS */
  --text-primary: #F5F5F5;       /* Main text (off-white) */
  --text-secondary: #A0A0A0;     /* Secondary text (gray) */
  --text-muted: #666666;          /* Very subtle text */
  --text-heading: #F5F5F5;        /* Headings (same as primary) */

  /* FUNCTIONAL COLORS */
  --color-success: #4ADE80;       /* Green — success messages */
  --color-warning: #FACC15;       /* Yellow — warnings */
  --color-danger: #F87171;        /* Red — errors */

  /* SHADOWS */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.5);
  --shadow-card-hover: 0 8px 32px rgba(0, 0, 0, 0.6);

  /* BORDER RADIUS */
  --radius-none: 0px;             /* Sharp corners (used on most cards) */
  --radius-sm: 2px;               /* Barely rounded */
  --radius-button: 8px;           /* Buttons */
  --radius-badge: 20px;           /* Pill-shaped badges */
  --radius-round: 50%;            /* Perfect circle */

  /* GLASSMORPHISM */
  --glass-bg: rgba(255, 255, 255, 0.03);    /* Very faint white */
  --glass-bg-medium: rgba(0, 0, 0, 0.5);
  --glass-bg-heavy: rgba(0, 0, 0, 0.7);
  --glass-blur: blur(16px);                  /* Background blur */

  /* FONTS */
  --font-heading: 'Space Grotesk', sans-serif;   /* Bold, geometric */
  --font-body: 'Inter', sans-serif;               /* Clean, readable */
  --font-mono: 'JetBrains Mono', monospace;       /* Code/numbers */
}
```

### How to use variables

In any CSS rule, write `var(--variable-name)`:
```css
.my-element {
  color: var(--text-primary);        /* Uses #F5F5F5 */
  background: var(--bg-surface-2);   /* Uses #1A1A1A */
  font-family: var(--font-heading);  /* Uses Space Grotesk */
}
```

**Why use variables?** If you want to change the primary text color across the ENTIRE site, you only change it in ONE place (the `:root` block).

---

## Global Styles

### Reset (lines 3–7)
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```
**What this does:** Removes all default spacing from every element. `box-sizing: border-box` means padding and borders are included in an element's width/height, making layout math easier.

### Body (lines 47–55)
```css
body {
  font-family: var(--font-body);
  background-color: var(--bg-deep);
  color: var(--text-primary);
  overflow-x: hidden;          /* No horizontal scrollbar */
  min-height: 100vh;           /* At least full screen height */
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;  /* Smoother text rendering */
}
```

### Custom Scrollbar (lines 106–121)
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-deep); }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
```
**What this does:** Replaces the browser's default scrollbar with a thin, dark-themed one.

---

## Layout Systems

### Flexbox Usage

Flexbox is used for:
- **Navbar links** — `navbar-nav` (horizontal row)
- **Pipeline cards** — `sg-pipeline` (horizontal row with centered items)
- **Marquee** — `sg-marquee-track` (horizontal scrolling row)
- **Metric badges** — column layout within each badge
- **Buttons** — `inline-flex` for icon + text alignment

Example:
```css
.sg-pipeline {
  display: flex;
  align-items: center;      /* Vertically centered */
  justify-content: center;  /* Horizontally centered */
  gap: 0;
  flex-wrap: wrap;           /* Wraps to next line on small screens */
}
```

### CSS Grid Usage

Grid is used for:
- **Stats grid** — 4 columns with unequal widths
- **Collage grid** (about.html) — 3 columns with tiles spanning multiple rows/columns
- **Confidence grid** — 3 equal segments

Example (Stats Grid):
```css
.sg-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1fr 1.2fr;  /* Unequal columns */
  gap: 1.5rem;
}
```

**What `1fr` means:** "1 fraction of available space". `1.3fr` gets 30% more space than `1fr`.

### Bootstrap Grid

Bootstrap's 12-column grid is used for:
- Team cards (`col-md-6 col-lg-5`)
- Learning resources (`col-md-6`)
- Contact form (`col-lg-8 col-xl-6`)

Example:
```html
<div class="row g-4 justify-content-center">
  <div class="col-md-6 col-lg-5">  <!-- 50% on medium, ~42% on large -->
    ...
  </div>
</div>
```

---

## Spacing System

The project uses:
- **rem units** for padding/margins (relative to root font size, usually 16px)
- **Bootstrap utility classes** for quick spacing (`mb-4` = margin-bottom 1.5rem, `p-5` = padding 3rem)

Common patterns:
```css
padding: 2rem 1.5rem;     /* 32px top/bottom, 24px left/right */
margin-bottom: 0.8rem;    /* 12.8px */
gap: 1.5rem;              /* 24px between grid/flex items */
```

---

## Card System (Glassmorphism)

### Base Card (`.sg-card`)
```css
.sg-card {
  background: var(--glass-bg);                    /* rgba(255,255,255,0.03) */
  backdrop-filter: var(--glass-blur);              /* blur(16px) */
  -webkit-backdrop-filter: var(--glass-blur);      /* Safari support */
  border: 1px solid var(--border-default);
  border-radius: var(--radius-none);               /* Sharp corners */
  padding: 2rem;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
}
```

**What is glassmorphism?** A design style where elements look like frosted glass — you can slightly see through them, and the background behind them is blurred.

### Card Hover Effect
```css
.sg-card:hover {
  transform: translateY(-2px);         /* Lifts up slightly */
  box-shadow: var(--shadow-card-hover); /* Deeper shadow */
  border-color: var(--border-hover);    /* Brighter border */
}
```

### Card Spinning Border (`.sg-card::before`)
```css
.sg-card::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.03) 25%, transparent 50%);
  opacity: 0;                          /* Hidden by default */
  animation: card-border-spin 8s linear infinite;
}
.sg-card:hover::before { opacity: 1; }  /* Visible on hover */
```

**What this does:** A rotating cone-shaped gradient that appears on hover. Because it's `200%` size and positioned at `-50%`, the rotation covers the entire card.

---

## Button Styles

### Primary Button (`.sg-btn-primary`)
```css
.sg-btn-primary {
  background: #F5F5F5;           /* White */
  color: #0A0A0A;                /* Black text */
  border-radius: var(--radius-button);  /* 8px rounded */
  padding: 0.85rem 2rem;
  font-weight: 600;
}
.sg-btn-primary:hover {
  transform: translateY(-2px);   /* Lifts up */
  box-shadow: 0 4px 16px rgba(255,255,255,0.1);
  color: #F5F5F5;                /* Text becomes white */
  background: #0A0A0A;           /* Background becomes black */
}
```
**The hover effect inverts the colors** — white button becomes black, black text becomes white.

### Outline Button (`.sg-btn-outline`)
```css
.sg-btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid rgba(255,255,255,0.15);
}
.sg-btn-outline:hover {
  border-color: rgba(255,255,255,0.3);  /* Brighter border */
  background: rgba(255,255,255,0.03);   /* Faint fill */
}
```

---

## All CSS Animations (Keyframes)

### 1. `hero-breathe` — Hero Section Pulse
```css
@keyframes hero-breathe {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
}
```
**Duration:** 6s, infinite. Creates a subtle breathing glow behind the hero text.

### 2. `title-shimmer` — Title Gradient Shift
```css
@keyframes title-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```
**Duration:** 4s, infinite. Shifts the gradient across the "SignGloss" title text.

### 3. `card-border-spin` — Card Hover Gradient Rotation
```css
@keyframes card-border-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```
**Duration:** 8s, linear, infinite. Rotates the conic gradient on card hover.

### 4. `stat-pulse` — Stats Card Glow
```css
@keyframes stat-pulse {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
```
**Duration:** 3s, infinite. Each stat card has a staggered delay (0s, 0.5s, 1s, 1.5s).

### 5. `arrow-flow` — Pipeline Arrow Movement
```css
@keyframes arrow-flow {
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(4px); }
}
```
**Duration:** 2s, infinite. Arrows between pipeline cards pulse and shift right.

### 6. `marquee` — Scrolling Text
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```
**Duration:** 30s, linear, infinite. Scrolls the feature list continuously.

### 7. `sg-pulse` — Live Indicator Dot
```css
@keyframes sg-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```
**Duration:** 2s, infinite. The green dot on the Operations page pulses.

### 8. `sg-spin` — Loading Spinner
```css
@keyframes sg-spin {
  to { transform: rotate(360deg); }
}
```
**Duration:** 0.8s, linear, infinite. Used for loading spinners on Operations page.

### 9. `tileExpand` — About Page Overlay (inline CSS)
```css
@keyframes tileExpand {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```
**Duration:** 350ms, cubic-bezier(0.16, 1, 0.3, 1).

### 10. `teamExpand` — Team Overlay (inline CSS)
Same as tileExpand — scales from 0.9 to 1 with fade-in.

---

## CSS Transitions

Transitions are used for smooth state changes (hover, class toggle):

| Element | Properties Animated | Duration | Easing |
|---|---|---|---|
| `.sg-card` | transform, box-shadow, border-color | 0.3s | cubic-bezier(0.4, 0, 0.2, 1) |
| `.sg-btn-primary` | transform, box-shadow | 0.15s / 0.2s | ease |
| `.sg-navbar .nav-link` | color | 0.25s | ease |
| `.sg-navbar .nav-link::after` | width | 0.3s | ease |
| `.animate-child` | opacity, transform | 0.5s | ease-out |
| `.sg-collage-tile` | border-color | 0.3s | ease |
| `.sg-slideshow-bg .sg-slide` | opacity | 2s | ease-in-out |
| `.sg-certainty-bar` | width | 0.3s | ease |

---

## Transform Usage

| Transform | Where Used | Purpose |
|---|---|---|
| `translateY(-2px)` | Card hover, button hover | Subtle lift effect |
| `translateY(-4px)` | Pipeline card hover, team card hover | More noticeable lift |
| `translateY(-16px)` | 2nd stat card | Offset for visual variety |
| `translateX(-50%)` | Center-positioned elements | Combined with `left: 50%` for centering |
| `translate(-50%, -50%)` | Absolute centering | Centers both horizontally and vertically |
| `scale(0.95)` | Button `:active` | Press-down effect |
| `scale(0.9) → scale(1)` | Overlay animations | Expansion effect |
| `scaleX(-1)` | Camera video/canvas | Mirrors the camera (selfie mode) |
| `rotate(90deg)` | Pipeline arrows on mobile | Points arrows downward |

---

## Z-Index Layering Map

```
z-index: 0     → .sg-world-bg (neuron background)
z-index: 0     → .sg-slideshow-bg (learn page background)
z-index: 1     → main content, .sg-collage-tile::before
z-index: 2     → .sg-collage-tile-content, camera-placeholder
z-index: 5     → Operations page UI (buttons, metrics, panels)
z-index: 9000  → .sg-tile-overlay (about page), .sg-team-overlay (team page)
z-index: 9001  → .sg-team-overlay-close button
z-index: 10    → Loading/error overlays on Operations page
z-index: 10000 → #sg-intro-overlay (intro animation)
```

---

## Responsive Design (Media Queries)

### `prefers-reduced-motion` (line 1042)
```css
@media (prefers-reduced-motion: reduce) {
  .animate-child { opacity: 1 !important; transform: none !important; }
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```
**What this does:** If the user's OS has "reduce motion" enabled, ALL animations and transitions are effectively disabled. This is an accessibility feature.

### ≤1200px (line 1055)
- Stats grid → 2 columns instead of 4
- Offset stat cards lose their vertical offset

### ≤992px (line 1066)
- Hero section height reduced, smaller title
- Section padding reduced
- Carousel buttons hidden (use drag instead)
- About cards wrap into rows
- Inference log hidden on Operations page

### ≤768px (line 1102)
- Stats grid → 1 column
- About cards stack vertically
- Pipeline goes vertical (column direction)
- Pipeline arrows rotate 90° to point down

### ≤576px (line 1130)
- Hero title: 2rem, less letter-spacing
- Stat numbers: 2.2rem
- Carousel cards: 260px minimum width
- Gloss output card: full width
- Stop button: smaller padding

---

## The Navbar Underline Effect

```css
.sg-navbar .nav-link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;                              /* Starts invisible */
  height: 1px;
  background: var(--text-primary);
  transition: width 0.3s ease;
}
.sg-navbar .nav-link:hover::after { width: 50%; }   /* Grows on hover */
.sg-navbar .nav-link.active::after { width: 50%; }  /* Always shown for active page */
```

**How it works:** A pseudo-element (invisible extra element) is positioned below the link text. Normally it has `width: 0` (invisible). On hover or when active, the width grows to 50%, centered under the text.

---

## The Glassmorphism Panel

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.03);        /* Almost transparent */
  backdrop-filter: blur(16px);                    /* Blurs what's behind */
  -webkit-backdrop-filter: blur(16px);            /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.06);  /* Faint border */
}
```

**What is `backdrop-filter: blur()`?** It blurs whatever is behind the element (like looking through frosted glass). The element itself stays clear — only the background gets blurry.

---

## Operations Page Specific Styles

### Fullscreen Container
```css
.sg-ops-fullscreen {
  position: relative;
  width: 100vw;      /* Full viewport width */
  height: 100vh;     /* Full viewport height */
  overflow: hidden;
  background: var(--bg-deep);
}
```

### Video Gradient Overlay
```css
.sg-ops-gradient {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(0deg,
    rgba(10,10,10,0.8) 0%,       /* Dark at bottom */
    transparent 40%,
    transparent 60%,
    rgba(10,10,10,0.4) 100%      /* Slightly dark at top */
  );
  pointer-events: none;            /* Clicks pass through */
  z-index: 1;
}
```

### TRANSLATE Button Hover Inversion
```css
.sg-translate-trigger:hover {
  background: #F5F5F5 !important;
  border-color: #F5F5F5 !important;
}
.sg-translate-trigger:hover * {
  color: #0A0A0A !important;         /* All children become dark */
}
```
The `*` selector targets ALL child elements — the icon, the text, everything.

### Metric Badges (Circular)
```css
.sg-metric-badge {
  width: 56px; height: 56px;
  border-radius: 50%;                /* Perfect circle */
  display: flex;
  flex-direction: column;            /* Stack label + value vertically */
  align-items: center;
  justify-content: center;
}
```

---

## About Page Collage Grid (Inline Styles)

```css
.sg-collage-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 8px;
}
```

Each tile is positioned using `nth-child`:
```
Tile 1: columns 1-2, rows 1-3 (tall left tile)
Tile 2: column 2, row 1 (top middle)
Tile 3: column 3, row 1 (top right)
Tile 4: columns 2-4, row 2 (wide middle)
Tile 5: columns 1-3, row 3 (wide bottom)
```

Each tile has the background image positioned differently (`background-position`) so the shared background image shows different portions in each tile, creating a mosaic effect.

---

## Key CSS Concepts Explained

### `position: fixed` vs `position: absolute`
- **fixed**: Stays in the same spot on screen even when you scroll (used for navbar, backgrounds).
- **absolute**: Positioned relative to its closest positioned parent (used for overlays, buttons within containers).

### `pointer-events: none`
Makes an element "transparent" to clicks — clicks pass through it to whatever is underneath. Used on decorative overlays and the canvas.

### `inset: 0`
Shorthand for `top: 0; right: 0; bottom: 0; left: 0;` — makes an absolutely positioned element fill its parent.

### `clamp(min, preferred, max)`
Used for responsive font sizes: `font-size: clamp(3rem, 7vw, 5rem)` means "use 7% of viewport width, but never less than 3rem or more than 5rem".

### `object-fit: cover`
Makes an image or video fill its container while maintaining aspect ratio. Parts that don't fit are cropped.

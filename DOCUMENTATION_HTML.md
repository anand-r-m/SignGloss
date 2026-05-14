# SignGloss — HTML Documentation

This document explains every HTML page in the project. It covers page structure, important sections, IDs, classes, and how HTML connects to CSS and JavaScript.

---

## Common Structure (All Pages Share This)

Every HTML page in SignGloss follows this pattern:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SignGloss — [Page Name]</title>
  <meta name="description" content="...">
  <!-- Bootstrap CSS from CDN -->
  <!-- Bootstrap Icons from CDN -->
  <!-- Google Fonts -->
  <!-- Local stylesheet: css/style.css -->
</head>
<body data-bs-theme="dark">

  <div class="sg-world-bg"></div>        <!-- Background image layer -->
  <div id="navbar-placeholder"></div>    <!-- JS injects navbar here -->

  <main>
    <!-- Page content goes here -->
  </main>

  <div id="footer-placeholder"></div>    <!-- JS injects footer here -->

  <!-- Scripts: Bootstrap JS, common.js, transitions.js, animations.js -->
  <!-- Page-specific scripts -->
</body>
</html>
```

### What Each Part Means

| Element | Purpose |
|---|---|
| `<!DOCTYPE html>` | Tells the browser this is HTML5 |
| `<html lang="en">` | Sets the page language to English |
| `<meta charset="UTF-8">` | Supports all characters (emoji, accents, etc.) |
| `<meta name="viewport" ...>` | Makes the page responsive on mobile |
| `<title>` | Text shown in the browser tab |
| `<meta name="description">` | SEO — search engines show this text |
| `data-bs-theme="dark"` | Tells Bootstrap to use dark theme colors |
| `sg-world-bg` | A fixed-position div showing the neuron-map background at 15% opacity |
| `navbar-placeholder` | Empty div where `common.js` injects the navigation bar |
| `footer-placeholder` | Empty div where `common.js` injects the footer |

### Why `data-bs-theme="dark"`?

Bootstrap 5.3+ supports automatic dark mode. By adding `data-bs-theme="dark"` to `<body>`, all Bootstrap components (buttons, forms, text) automatically use dark colors.

---

## 1. index.html — Homepage

### Purpose
The landing page. First thing users see. Shows what SignGloss is and why it matters.

### Page Structure (Top to Bottom)

#### Intro Overlay (lines 21–23)
```html
<div id="sg-intro-overlay">
  <canvas id="sg-intro-canvas"></canvas>
</div>
```
- **What:** A full-screen overlay with a canvas for the intro animation.
- **ID `sg-intro-overlay`:** Used by `intro-animation.js` to find and eventually remove this overlay.
- **ID `sg-intro-canvas`:** The canvas element where JavaScript draws the neural network + "SIGNGLOSS" text.
- **CSS:** `position: fixed; z-index: 10000` — covers everything, sits on top of all content.
- **After animation:** This entire div is removed from the DOM using `overlay.remove()`.

#### Background (line 25)
```html
<div class="sg-world-bg"></div>
```
- Shows `world-map-neurons.png` at 15% opacity behind all content.

#### Hero Section (lines 30–39)
```html
<section class="sg-hero">
  <div class="container text-center">
    <h1 class="sg-hero-title animate-child">SignGloss</h1>
    <p class="sg-hero-subtitle animate-child">Real-time Indian Sign Language...</p>
    <div class="d-flex gap-3 justify-content-center flex-wrap animate-child">
      <a href="operations.html" class="btn sg-btn-primary">Try It</a>
      <a href="about.html" class="btn sg-btn-outline">Info</a>
    </div>
  </div>
</section>
```

**Key classes:**
- `sg-hero` → Full viewport height, centered content, radial gradient background
- `sg-hero-title` → Large shimmer-gradient text
- `sg-hero-subtitle` → Muted descriptive text
- `animate-child` → Starts invisible, fades in when section scrolls into view
- `sg-btn-primary` → White button with dark text
- `sg-btn-outline` → Transparent button with border

**How CSS connects:**
- `.sg-hero` uses `min-height: 100vh` and `display: flex` for centering.
- `.sg-hero-title` uses `background: linear-gradient(...)` with `-webkit-background-clip: text` for the shimmer effect.
- `.sg-hero::before` creates a breathing radial gradient.

#### Stats Grid (lines 41–62)
```html
<div class="sg-stats-grid">
  <div class="sg-stat-card animate-child">
    <div class="sg-stat-number" data-value="26">0</div>
    <div class="sg-stat-label">Landmarks Tracked</div>
  </div>
  <!-- 3 more stat cards -->
</div>
```

**Key IDs/attributes:**
- `data-value="26"` → The target number for the count-up animation.
- `animations.js` reads this attribute and animates the text from 0 to 26.

**How it works:**
1. CSS Grid with 4 columns: `grid-template-columns: 1fr 1.3fr 1fr 1.2fr`
2. The 2nd card is offset upward (`translateY(-16px)`) for visual interest.
3. Each card has a pulsing radial gradient (`.sg-stat-card::after` with `stat-pulse` animation).

#### Pipeline (lines 64–96)
```html
<div class="sg-pipeline animate-child">
  <div class="sg-pipeline-node sg-pipeline-card">
    <i class="bi bi-camera-video"></i>
    <span>Camera</span>
  </div>
  <div class="sg-pipeline-arrow"><i class="bi bi-arrow-right"></i></div>
  <!-- More nodes and arrows -->
</div>
```

- Uses flexbox to arrange 5 cards with arrows between them.
- Arrows have a flowing animation (`arrow-flow` keyframes).
- Cards lift on hover (`translateY(-4px)` + glow box-shadow).

#### Marquee (lines 98–155)
```html
<div class="sg-marquee-wrap animate-child">
  <div class="sg-marquee-track">
    <span>Real-Time Translation</span>
    <span>·</span>
    <!-- More items, duplicated for seamless loop -->
  </div>
</div>
```

- Content is listed TWICE (lines 105–127 and 129–151).
- CSS moves the track by `-50%`, creating an infinite scroll effect.
- The duplication means when the first copy scrolls away, the second takes its place seamlessly.

#### Scripts (lines 160–164)
```html
<script src="js/common.js"></script>
<script src="js/intro-animation.js"></script>
<script src="js/transitions.js"></script>
<script src="js/animations.js"></script>
```
- `intro-animation.js` is ONLY loaded on this page.

---

## 2. about.html — How We Did It

### Purpose
Technical explanation of the SignGloss pipeline.

### Unique Feature: Collage Grid + Overlay System

#### Collage Tiles (lines 245–276)
```html
<div class="sg-collage-grid animate-child">
  <div class="sg-collage-tile" data-tile="pipeline">
    <div class="sg-collage-tile-content">
      <div class="sg-collage-tile-label">Pipeline</div>
      <div class="sg-collage-tile-sub">Five sequential stages, all client-side</div>
    </div>
  </div>
  <!-- 4 more tiles -->
</div>
```

**Key attribute:**
- `data-tile="pipeline"` → Links this tile to its overlay (`overlay-pipeline`).

**How CSS Grid positions tiles:**
```css
.sg-collage-tile:nth-child(1) { grid-column: 1/2; grid-row: 1/3; }  /* Tall left */
.sg-collage-tile:nth-child(2) { grid-column: 2/3; grid-row: 1/2; }  /* Top middle */
.sg-collage-tile:nth-child(3) { grid-column: 3/4; grid-row: 1/2; }  /* Top right */
.sg-collage-tile:nth-child(4) { grid-column: 2/4; grid-row: 2/3; }  /* Wide middle */
.sg-collage-tile:nth-child(5) { grid-column: 1/3; grid-row: 3/4; }  /* Wide bottom */
```

#### Overlay Modals (lines 278–365)
```html
<div class="sg-tile-overlay" id="overlay-pipeline">
  <div class="sg-tile-overlay-content">
    <button class="sg-tile-overlay-close" aria-label="Close">&times;</button>
    <div class="sg-tile-overlay-inner">
      <h3>Pipeline</h3>
      <p>The SignGloss pipeline operates in five sequential stages...</p>
      <ol>...</ol>
    </div>
  </div>
</div>
```

**How overlay opening works (inline JS, lines 376–406):**
```javascript
// 1. Find all tiles
var tiles = document.querySelectorAll('.sg-collage-tile');

// 2. When a tile is clicked:
tile.addEventListener('click', function () {
  var key = tile.getAttribute('data-tile');      // e.g., "pipeline"
  var overlay = document.getElementById('overlay-' + key);  // "overlay-pipeline"
  overlay.classList.add('active');                // Shows the overlay
  document.body.style.overflow = 'hidden';       // Prevents background scrolling
});

// 3. Close button removes 'active' class
// 4. Clicking the dark background also closes it
```

---

## 3. operations.html — Live Translation

### Purpose
The core feature page — camera + hand tracking.

### Key HTML Elements

#### Video & Canvas (lines 22–24)
```html
<video id="camera-feed" autoplay playsinline muted style="display:none"></video>
<canvas id="landmark-canvas"></canvas>
<div class="sg-ops-gradient"></div>
```

- **`camera-feed`:** Hidden video element that receives the webcam stream. `autoplay playsinline muted` ensures it plays without user interaction on mobile.
- **`landmark-canvas`:** Canvas overlaid on the video where hand landmarks are drawn. Has `pointer-events: none` so clicks pass through it.
- **`sg-ops-gradient`:** A gradient overlay that darkens the top and bottom edges of the video.

#### TRANSLATE Button (lines 29–33)
```html
<div class="sg-translate-trigger glass-panel" id="start-btn" style="z-index:5">
  <i class="bi bi-broadcast" style="font-size:64px;..."></i>
  <div style="...">TRANSLATE</div>
  <div style="...">Initialize Computational<br>Inference Engine</div>
</div>
```

- Centered via `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)`.
- The `glass-panel` class gives it a frosted glass look.
- On hover: background becomes white, text becomes black.
- `hand-tracking.js` hides this when clicked and shows it again when stopped.

#### Metric Badges (lines 35–48)
```html
<div class="sg-metric-badge">
  <span class="metric-label">FPS</span>
  <span class="metric-value" id="fps-display">0.0</span>
</div>
```

- Small circular badges positioned absolute top-left.
- `hand-tracking.js` updates `fps-display` text every second.

#### Gloss Output Card (lines 60–80)
```html
<div class="sg-gloss-output-card" id="video-panel">
  <div class="sg-certainty-bar" id="buffer-progress" style="width:0%"></div>
  <div class="sg-gloss-main-text" id="current-gloss">—</div>
  <div class="sg-confidence-grid">
    <div class="seg"></div><div class="seg"></div><div class="seg"></div>
  </div>
</div>
```

- Positioned at bottom center.
- Shows the predicted gloss text, confidence percentage, and buffer progress.

---

## 4. learn.html — Learn ISL

### Unique Feature: Slideshow Background
```html
<div class="sg-slideshow-bg" id="sg-slideshow">
  <div class="sg-slide active" style="background-image: url('assets/images/pic1.jpg')"></div>
  <div class="sg-slide" style="background-image: url('assets/images/pic2.jpg')"></div>
  <!-- 3 more slides -->
</div>
```

- Each slide is a full-screen div with a background image.
- CSS: `opacity: 0` by default, `opacity: 0.2` when `.active`.
- JS (inline): Cycles through slides every 5 seconds.

### Video Carousel
```html
<div class="sg-carousel-wrap">
  <div class="sg-carousel-track" id="video-carousel">
    <div class="sg-card sg-video-card animate-child">
      <div class="ratio ratio-16x9">
        <iframe src="https://www.youtube.com/embed/..." ...></iframe>
      </div>
      <div class="sg-video-card-info">
        <h5 class="sg-video-card-title">ISL Alphabet (A–Z)</h5>
        <p class="sg-video-card-desc">...</p>
      </div>
    </div>
    <!-- 6 more video cards -->
  </div>
  <button class="sg-carousel-btn sg-carousel-prev" id="carousel-prev">...</button>
  <button class="sg-carousel-btn sg-carousel-next" id="carousel-next">...</button>
</div>
```

- `ratio ratio-16x9` is a Bootstrap class that maintains 16:9 aspect ratio for the iframe.
- `loading="lazy"` on iframes delays loading until the card scrolls near view.
- JS handles both button clicks AND mouse drag for navigation.

---

## 5. team.html — Team & Contact

### Team Cards
```html
<div class="sg-card sg-team-card h-100 animate-child" id="card-vidyasree"
     role="button" tabindex="0" aria-label="Expand Vidyasree Jayaprasad profile">
  <div class="sg-team-photo">
    <img src="assets/images/vidyasree.jpeg" alt="Vidyasree Jayaprasad"
      onerror="this.style.display='none'; this.parentElement.innerHTML='<i ...></i>';">
  </div>
  <h3 class="sg-team-name">Vidyasree Jayaprasad</h3>
  <p class="sg-team-role">Dev A — Capture & Frontend</p>
  <div class="sg-card-expand-content">
    <!-- Hidden content: bio, skills, links -->
  </div>
</div>
```

**Accessibility attributes:**
- `role="button"` — tells screen readers this is clickable
- `tabindex="0"` — makes it focusable with keyboard
- `aria-label` — describes what clicking does

**`onerror` on img:** If the photo fails to load, it replaces the image with a person icon.

**`.sg-card-expand-content`:** Hidden by default (`display: none` in CSS). When the card is clicked, `team.js` clones this content into the overlay.

### Contact Form
```html
<form id="contact-form" novalidate>
  <input type="text" class="sg-contact-input" id="contact-name" required placeholder="Your name">
  <input type="number" class="sg-contact-input" id="contact-age" required min="1">
  <input type="text" class="sg-contact-input" id="contact-qualification" required>
  <div class="sg-star-rating" id="star-rating" role="radiogroup">
    <i class="bi bi-star" data-value="1" role="radio" tabindex="0" aria-label="1 star"></i>
    <!-- 4 more stars -->
  </div>
  <textarea class="sg-contact-input" id="contact-message" rows="4" required></textarea>
  <button type="submit" class="btn sg-btn-primary w-100">Send Message</button>
</form>
```

- `novalidate` on the form disables browser's default validation (custom JS validation is used instead).
- Each star has `data-value` — `team.js` reads this to set the rating.
- `team.js` validates each field on `input` event (real-time feedback).

---

## 6. demo.html — Demo Video

### Simplest Page
```html
<video id="demo-video" controls class="w-100 d-none">
  <source src="assets/videos/demo.mp4" type="video/mp4">
</video>
<div id="demo-placeholder" class="d-flex flex-column align-items-center...">
  <i class="bi bi-camera-reels" style="font-size: 3rem;..."></i>
  <h4>Demo Video Coming Soon</h4>
</div>
```

- Video starts with `d-none` (Bootstrap: `display: none`).
- `demo.js` listens for `canplay` event — if video can play, it shows the video and hides the placeholder.
- If video errors out, placeholder stays visible.

---

## HTML ↔ CSS ↔ JS Connection Summary

| HTML Element | CSS Class/ID | JS File | What Happens |
|---|---|---|---|
| `#sg-intro-overlay` | z-index 10000, covers screen | `intro-animation.js` | Draws animation, then removes element |
| `.animate-child` | opacity 0, translateY 20px | `animations.js` | Gets `.animate-visible` class on scroll |
| `#navbar-placeholder` | — | `common.js` | Filled with navbar HTML |
| `.sg-collage-tile` | Grid positioning | Inline JS | Click → opens overlay |
| `#camera-feed` | display none initially | `hand-tracking.js` | Receives webcam stream |
| `#landmark-canvas` | Positioned over video | `hand-tracking.js` | Landmarks drawn here |
| `#start-btn` | Centered, glass-panel | `hand-tracking.js` | Hidden on click, starts camera |
| `.sg-team-card` | Hover lift effect | `team.js` | Click → opens overlay with cloned content |
| `#contact-form` | — | `team.js` | Validates + shows success message |
| `#video-carousel` | Flex track | Inline JS + `animations.js` | Drag or button navigation |

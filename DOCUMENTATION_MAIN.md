# SignGloss — Complete Project Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Full File Structure](#full-file-structure)
3. [Architecture Overview](#architecture-overview)
4. [Data Flow](#data-flow)
5. [Page-by-Page Breakdown](#page-by-page-breakdown)
6. [Animation System](#animation-system)
7. [Styling System](#styling-system)
8. [JavaScript Logic](#javascript-logic)
9. [Important Techniques Used](#important-techniques-used)
10. [Important Design Decisions](#important-design-decisions)
11. [How To Modify The Project](#how-to-modify-the-project)

---

## Project Overview

### What Is SignGloss?

SignGloss is a **web application** that translates **Indian Sign Language (ISL)** into text (called "gloss tokens") in **real-time**, using only the user's **web browser**. No server is needed — everything runs on the user's computer.

### Main Purpose

- Help deaf and hard-of-hearing individuals communicate by converting their sign language gestures into readable text.
- Demonstrate that AI-powered sign language translation can work entirely **client-side** (in the browser), with **zero data leaving the user's device**.

### How Users Interact With It

1. **Land on the homepage** → See an animated intro spelling "SIGNGLOSS" with a neural network background, then the hero section appears.
2. **Navigate using the top navbar** → Links to Home, About, Demo, Operations, Learn, and Team pages.
3. **Go to the Operations page** → Click the "TRANSLATE" button → Camera turns on → AI tracks hand landmarks → Gloss predictions appear at the bottom.
4. **Visit About page** → Click tiles to learn about the pipeline, architecture, datasets, impact, and future scope.
5. **Visit Learn page** → Watch ISL tutorial videos in a draggable carousel.
6. **Visit Team page** → Click team member cards to see expanded profiles; fill out the contact form.
7. **Visit Demo page** → Watch a pre-recorded demo video (placeholder for now).

### Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling, animations, responsive design |
| Vanilla JavaScript | All logic, DOM manipulation, animations |
| Bootstrap 5 | Grid layout, responsive utilities, navbar |
| Google Fonts | Typography (Space Grotesk, Inter, JetBrains Mono) |
| MediaPipe | Hand landmark detection from webcam |
| ONNX Runtime Web | Running the AI model in browser |
| Web Workers | Running inference off the main thread |

---

## Full File Structure

```
UID/
├── index.html                  # Homepage — hero, stats, pipeline, marquee
├── about.html                  # "How We Did It" — collage tiles with overlays
├── demo.html                   # Demo video page (placeholder)
├── operations.html             # Live translation — camera + hand tracking
├── learn.html                  # ISL tutorial videos + resources
├── team.html                   # Team profiles + contact form
│
├── css/
│   └── style.css               # ALL styles for the entire website (1156 lines)
│
├── js/
│   ├── common.js               # Navbar + footer injection (shared by ALL pages)
│   ├── animations.js           # Scroll-triggered animations, count-up, carousel
│   ├── intro-animation.js      # Canvas-based "SIGNGLOSS" intro on homepage
│   ├── transitions.js          # Page-to-page slide transitions
│   ├── hand-tracking.js        # MediaPipe hand tracking (used on Operations page)
│   ├── team.js                 # Team card expansion + contact form validation
│   ├── demo.js                 # Demo video show/hide logic
│   ├── contract.js             # Shared constants (ES module, not currently loaded)
│   ├── bridge.js               # Web Worker bridge (ES module, not currently loaded)
│   ├── capture.js              # Camera utilities (ES module, not currently loaded)
│   ├── landmarks.js            # MediaPipe landmark extraction (ES module)
│   ├── decoder.js              # CTC decoding logic (ES module)
│   ├── inference-worker.js     # Web Worker for ONNX inference
│   ├── operations-capture.js   # Full capture pipeline (ES module)
│   ├── operations-inference.js # Inference UI updates (ES module)
│   └── paint-transition.js     # SVG paint-stroke transition (ES module, unused)
│
├── models/
│   └── signgloss_stub.onnx     # Stub ONNX model (placeholder for real model)
│
├── assets/
│   ├── background.jpg          # Textured dark background image
│   └── images/
│       ├── world-map-neurons.png  # Neuron-map background used on most pages
│       ├── anand.jpeg           # Team member photo
│       ├── vidyasree.jpeg       # Team member photo
│       ├── pic1.jpg – pic5.jpg  # Slideshow images for Learn page
│       └── end sem project guidelines.docx
│
├── scripts/
│   └── generate_stub_model.py  # Python script to create the stub ONNX model
│
├── README.md                   # Project readme
└── .gitignore                  # Git ignore rules
```

### Why Each File Exists

| File | Why It Exists |
|---|---|
| `index.html` | The landing page — first thing users see |
| `about.html` | Explains the technical pipeline to visitors |
| `demo.html` | Shows a pre-recorded demo (video coming soon) |
| `operations.html` | The core feature — live camera + hand tracking |
| `learn.html` | Educational ISL videos so users can learn signs |
| `team.html` | Shows who built it + lets visitors contact the team |
| `style.css` | Single CSS file keeps all styles in one place |
| `common.js` | Injects the same navbar/footer on every page (DRY principle) |
| `animations.js` | Makes elements animate as you scroll down |
| `intro-animation.js` | Creates the "wow" first impression on the homepage |
| `transitions.js` | Smooth slide animations when navigating between pages |
| `hand-tracking.js` | The active MediaPipe hand detection for the Operations page |
| `team.js` | Handles team card click-to-expand and contact form logic |
| `demo.js` | Simple logic to show video or placeholder |
| `inference-worker.js` | Runs AI model in background thread (Web Worker) |
| `contract.js` | Defines shared constants (landmark count, model path, etc.) |
| `bridge.js` | Connects the capture pipeline to the inference worker |
| `generate_stub_model.py` | Creates a dummy ONNX model for testing |

---

## Architecture Overview

### How The Website Is Structured

SignGloss is a **multi-page static website**. There is NO framework (no React, no Vue). Each HTML page is a separate file that loads shared resources.

```
Every page loads:
  1. Bootstrap CSS (from CDN)
  2. Bootstrap Icons (from CDN)
  3. Google Fonts (from CDN)
  4. css/style.css (local)
  5. Bootstrap JS (from CDN)
  6. js/common.js (navbar + footer)
  7. js/transitions.js (page transitions)
  8. js/animations.js (scroll animations)
```

### How Pages Connect

Pages are connected through **hyperlinks** in the **navbar**. The navbar is NOT hardcoded in each HTML file — it is **injected by JavaScript** (`common.js`). This means:

- There is ONE definition of all navigation links (the `NAV_LINKS` array in `common.js`).
- Every page has a `<div id="navbar-placeholder"></div>` where the navbar gets inserted.
- Similarly, `<div id="footer-placeholder"></div>` gets the footer.

### How Scripts Interact

```
common.js ──────► Injects navbar + footer (runs on every page)
animations.js ──► Observes scroll, triggers fade-in animations (every page)
transitions.js ─► Intercepts link clicks, plays exit/enter animations (every page)
intro-animation.js ► Canvas animation on homepage only
hand-tracking.js ──► MediaPipe hand tracking on Operations page only
team.js ───────────► Card expansion + form on Team page only
demo.js ───────────► Video toggle on Demo page only
```

### How State Is Managed

SignGloss uses **sessionStorage** (browser temporary storage) for two things:

1. **`sg-intro-played`** — Set to `'1'` after the intro animation plays. This prevents the intro from replaying when you navigate back to the homepage during the same browser session.
2. **`sg-transition-active`** — Set to `'1'` just before navigating to a new page. The new page checks this flag and plays an "enter" animation if it's set.

There is NO global state management library. Each page manages its own state through local JavaScript variables.

### How Components Communicate

Components on this site are **independent**. They don't share state directly. The only communication patterns are:

1. **CSS classes** — JavaScript adds/removes classes to trigger visual changes (e.g., `.active`, `.animate-visible`).
2. **sessionStorage** — Used to pass information across page navigations.
3. **Pipeline callbacks** (in the ES module files) — The `Pipeline` object in `contract.js` uses callback functions to pass data between capture and inference modules.

---

## Data Flow

### What Happens When User Loads The Site

```
1. Browser requests index.html
2. Browser downloads CSS + JS files from CDN and locally
3. common.js runs → injects navbar and footer HTML
4. intro-animation.js runs → checks sessionStorage
   → If first visit: plays canvas animation (neural network + "SIGNGLOSS" trace)
   → If returning: removes overlay immediately
5. animations.js runs → sets up IntersectionObservers
   → As user scrolls, elements with class "animate-child" fade in
6. transitions.js runs → checks for "sg-transition-active" in sessionStorage
   → If set: plays enter-slide animation on all .animate-child elements
```

### What Happens When User Navigates (Clicks a Link)

```
1. User clicks a link (e.g., "About")
2. transitions.js intercepts the click (prevents default navigation)
3. Exit transition plays: all .animate-child elements slide LEFT and fade out
4. After animation completes (~400ms), browser navigates to the new URL
5. New page loads → common.js injects navbar/footer
6. transitions.js detects "sg-transition-active" flag → plays enter animation
   → Elements slide in FROM RIGHT and fade in
7. animations.js sets up scroll observers for the new page
```

### What Happens On The Operations Page (Hand Tracking)

```
1. Page loads → hand-tracking.js initializes
2. User clicks the "TRANSLATE" button
3. Camera permission is requested via navigator.mediaDevices.getUserMedia()
4. If granted: video stream starts playing in a hidden <video> element
5. MediaPipe HandLandmarker model is downloaded from Google's CDN
6. A detection loop starts (runs every animation frame):
   a. handLandmarker.detectForVideo() processes the current video frame
   b. Returns landmark positions for each detected hand
   c. drawLandmarks() draws colored dots and lines on a <canvas> overlay
   d. FPS counter updates every second
7. When user clicks "TERM OPS" (stop button):
   → Loop stops, camera stops, canvas clears, UI resets
```

---

## Page-by-Page Breakdown

### 1. Homepage (`index.html`)

**Purpose:** Landing page — first impression, project overview.

**Layout:**
- Full-screen intro overlay (canvas animation, removed after playing)
- Neuron-map background image (fixed, low opacity)
- Hero section (full viewport height) with title, subtitle, buttons
- Stats grid (4 cards: Landmarks, Gloss Classes, FPS, Inference Time)
- Pipeline visualization (5 connected cards showing the data flow)
- Marquee (scrolling text showing features/tech)
- Footer

**Scripts:** common.js, intro-animation.js, transitions.js, animations.js

**Key Interactions:**
- Intro animation auto-plays once per session
- Stats numbers count up when scrolled into view
- Pipeline cards have hover effects
- Marquee scrolls continuously
- "Try It" button links to Operations page

---

### 2. About Page (`about.html`)

**Purpose:** Explains how SignGloss works technically.

**Layout:**
- Neuron-map background
- Title + description
- Collage grid (5 tiles: Pipeline, Architecture, Datasets, Impact, Future Scope)
- 5 overlay modals (one for each tile)

**Scripts:** common.js, transitions.js, animations.js + inline script

**Key Interactions:**
- Clicking a tile → opens a full-screen overlay with detailed info
- Overlay has a close button (×) and closes on background click
- Tiles have hover effects (lighter overlay, brighter border)

**Unique CSS:** This page has inline `<style>` for the collage grid layout and tile overlay system.

---

### 3. Demo Page (`demo.html`)

**Purpose:** Show a pre-recorded demo video.

**Layout:**
- Video player (hidden by default)
- Placeholder message ("Demo Video Coming Soon")
- Pipeline explanation list

**Scripts:** common.js, transitions.js, animations.js, demo.js

**Key Interactions:**
- If video file loads → show video, hide placeholder
- If video fails → show placeholder, hide video

---

### 4. Operations Page (`operations.html`)

**Purpose:** THE core feature — live ISL hand tracking.

**Layout:**
- Full-screen container (100vw × 100vh)
- Hidden `<video>` element for camera feed
- `<canvas>` for landmark drawing overlay
- Gradient overlay (darkens top/bottom edges)
- "TRANSLATE" button (center, glass panel)
- Metric badges (left side: FPS, Latency, Gloss count)
- Inference log panel (right side, desktop only)
- Gloss output card (bottom center)
- Stop button ("TERM OPS")
- Loading spinner, error states

**Scripts:** common.js, transitions.js, animations.js, hand-tracking.js

**Key Interactions:**
- Click TRANSLATE → starts camera + MediaPipe
- Hand landmarks drawn as pink dots + dark pink lines
- FPS updates in real-time
- Click TERM OPS → everything stops

---

### 5. Learn Page (`learn.html`)

**Purpose:** Teach users ISL through video tutorials.

**Layout:**
- Slideshow background (5 images cycling every 5 seconds)
- Video carousel (7 YouTube embeds) with prev/next buttons
- Learning resources section (4 cards with external links)

**Scripts:** common.js, transitions.js, animations.js + 2 inline scripts

**Key Interactions:**
- Carousel: click arrows OR drag to scroll through videos
- Background: images crossfade automatically
- Resource cards link to external websites

---

### 6. Team Page (`team.html`)

**Purpose:** Team profiles + contact form.

**Layout:**
- Two team member cards (Vidyasree, Anand)
- Expandable overlay for detailed profile view
- Contact form (name, age, qualification, star rating, message)
- Developer contact info cards

**Scripts:** common.js, transitions.js, animations.js, team.js

**Key Interactions:**
- Click a team card → overlay opens with full bio, skills, links
- Star rating: click stars to rate
- Form validation: real-time field checking
- Submit: shows success message, resets form

---

## Animation System

### 1. Intro Animation (`intro-animation.js`)

**What triggers it:** Page load on index.html (only first visit per session).

**What it does:**
1. Background neural network (120 randomly placed nodes with connecting edges) fades in
2. Letter dots (waypoints for "SIGNGLOSS") appear with glow effects
3. Each letter traces its path sequentially (like a pen drawing)
4. Holds for 2 seconds, then fades out

**How timing works:**
```
0ms      → Background nodes start appearing
800ms    → Background fully visible
1500ms   → Letter dots appear
2000ms   → First letter starts tracing
2400ms   → Second letter starts (400ms per letter)
...continues for all 9 letters
~5600ms  → All letters traced, hold begins
~7600ms  → Fade out starts
~8100ms  → Overlay removed from DOM
```

**How smoothness is achieved:** Uses `requestAnimationFrame` for 60fps rendering on a `<canvas>` element. The `performance.now()` timestamp ensures consistent timing.

**sessionStorage:** After playing, sets `sg-intro-played = '1'` so it won't replay.

---

### 2. Scroll Animations (`animations.js` → `initStaggeredEntrances`)

**What triggers it:** Elements scrolling into the viewport.

**How it works:**
- Elements with class `animate-child` start with `opacity: 0` and `transform: translateY(20px)`.
- An `IntersectionObserver` watches each section.
- When a section becomes 15% visible, all its `.animate-child` elements get the class `animate-visible`.
- Each child gets a staggered delay: child 0 = 0ms, child 1 = 120ms, child 2 = 240ms, etc.
- CSS transitions handle the actual animation (`opacity 0.5s ease-out, transform 0.5s ease-out`).

---

### 3. Page Transitions (`transitions.js`)

**What triggers it:** Clicking any internal link.

**Exit animation:**
- All `.animate-child` elements slide LEFT by 100px and fade to 0.
- Staggered: elements are sorted left-to-right, each delayed by 60ms.
- Duration: 400ms with `cubic-bezier(0.4, 0, 0.2, 1)`.

**Enter animation:**
- All `.animate-child` elements start at `translateX(100px), opacity: 0`.
- They slide to `translateX(0), opacity: 1`.
- Duration: 450ms with `cubic-bezier(0.16, 1, 0.3, 1)`.

---

### 4. Count-Up Stats (`animations.js` → `initCountUpStats`)

**What triggers it:** Stats grid scrolling into view (30% threshold).

**How it works:**
- Reads the target number from `data-value` attribute.
- Uses `requestAnimationFrame` to animate from 0 to target over 1500ms.
- Uses a cubic ease-out function: `1 - (1 - t)^3`.

---

### 5. Marquee (`style.css`)

**What triggers it:** Always running (CSS animation).

**How it works:**
- The track contains duplicated content (features listed twice).
- CSS `@keyframes marquee` moves `translateX` from `0` to `-50%`.
- Duration: 30 seconds, linear, infinite loop.
- Because content is duplicated, the loop is seamless.

---

### 6. Hero Breathe Effect (`style.css`)

A radial gradient behind the hero section that slowly pulses (scales between 1× and 1.2×) over 6 seconds.

---

### 7. Title Shimmer (`style.css`)

The "SignGloss" title uses a gradient background that shifts position, creating a shimmer effect over 4 seconds.

---

### 8. Card Hover Spin (`style.css`)

Cards have a `::before` pseudo-element with a conic gradient that rotates 360° over 8 seconds. It's invisible normally (`opacity: 0`) and appears on hover.

---

### 9. Tile Expansion (`about.html`)

When you click a collage tile, the overlay appears. The content uses `@keyframes tileExpand`:
- From: `opacity: 0, scale(0.9)`
- To: `opacity: 1, scale(1)`
- Duration: 350ms with `cubic-bezier(0.16, 1, 0.3, 1)`.

---

### 10. Slideshow Background (`learn.html`)

5 full-screen background images cycle every 5 seconds. Each slide fades in/out via CSS `opacity` transition (2 seconds, ease-in-out). JavaScript toggles the `active` class.

---

## Styling System

### CSS Organization

All styles are in ONE file: `css/style.css` (1156 lines). It is organized:

1. **Font import** (line 1)
2. **Reset** (lines 3–7)
3. **CSS Variables** (lines 9–41)
4. **Global styles** (body, scrollbar, headings, links)
5. **Utility classes** (`.animate-child`, `.sg-label`)
6. **Intro overlay** styles
7. **Navbar** styles
8. **Footer** styles
9. **Hero section** styles
10. **Button** styles
11. **Card** styles
12. **Section** styles
13. **Stats grid** styles
14. **Pipeline** styles
15. **Marquee** styles
16. **About page** styles
17. **Operations page** styles
18. **Carousel** styles
19. **Tech table** styles
20. **Media queries** (responsive breakpoints)

### CSS Variables (Design Tokens)

```css
--bg-deep: #0A0A0A          /* Darkest background */
--bg-surface-1: #111111      /* Slightly lighter */
--bg-surface-2: #1A1A1A      /* Card backgrounds */
--bg-surface-3: #222222      /* Elevated surfaces */
--border-subtle: rgba(255,255,255,0.06)
--border-default: rgba(255,255,255,0.08)
--border-hover: rgba(255,255,255,0.15)
--text-primary: #F5F5F5       /* Main text */
--text-secondary: #A0A0A0     /* Subdued text */
--text-muted: #666666         /* Very subtle text */
--color-success: #4ADE80
--color-danger: #F87171
--font-heading: 'Space Grotesk'
--font-body: 'Inter'
--font-mono: 'JetBrains Mono'
```

### Color System

The site uses a **monochromatic dark theme**:
- Background: near-black (#0A0A0A)
- Text: white-ish (#F5F5F5) with two muted levels
- Borders: white at very low opacity (6%–15%)
- Accents: only for functional purposes (green for success, red for danger)

### Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| ≤1200px | Stats grid → 2 columns |
| ≤992px | Hero shrinks, carousel buttons hidden, about cards wrap |
| ≤768px | Stats → 1 column, pipeline goes vertical |
| ≤576px | Title font shrinks, smaller buttons |

---

## JavaScript Logic

### common.js (69 lines)

**Purpose:** Injects the navbar and footer on every page.

**Key parts:**
- `NAV_LINKS` array — defines all navigation items
- `getCurrentPage()` — extracts current filename from URL
- `injectNavbar()` — builds Bootstrap navbar HTML, highlights active page
- `injectFooter()` — builds footer with current year
- `init()` — calls both functions when DOM is ready

### animations.js (174 lines)

**Purpose:** All scroll-triggered visual effects.

**Key functions:**
- `initStaggeredEntrances()` — IntersectionObserver for fade-in animations
- `initCountUpStats()` — animates stat numbers from 0 to target
- `initCarousel()` — drag/swipe carousel for any page with `.sg-carousel-track`
- `initIntroHook()` — calls the intro animation if overlay exists

### intro-animation.js (267 lines)

**Purpose:** Canvas-based intro animation on the homepage.

**How it works:** Defines letter shapes as coordinate arrays, generates background nodes, and uses `requestAnimationFrame` to draw the animation frame by frame.

### transitions.js (119 lines)

**Purpose:** Smooth page-to-page transitions.

**Key functions:**
- `animateElements()` — animates a set of elements with stagger
- `playExitTransition()` — slides elements left + fades out
- `playEnterTransition()` — slides elements in from right
- `interceptLinks()` — prevents default link behavior, triggers animations

### hand-tracking.js (241 lines)

**Purpose:** MediaPipe hand tracking for the Operations page.

**Key parts:**
- `DRAW_POINTS` — 11 landmark indices to draw
- `CONNECTIONS` — 10 finger connection pairs
- `handleStart()` — starts camera, loads MediaPipe, begins detection loop
- `loop()` — runs every frame, detects hands, draws landmarks
- `drawLandmarks()` — draws pink dots and lines on canvas
- `handleStop()` — stops everything, resets UI

### team.js (172 lines)

**Purpose:** Team page interactions.

**Two main sections:**
1. **Card expansion** (lines 1–69): Click a card → clone its content into overlay
2. **Contact form** (lines 71–172): Star rating + field validation + submit

---

## Important Techniques Used

### sessionStorage

**What it is:** A browser feature that stores data temporarily (cleared when you close the tab).

**How it's used:**
- `sessionStorage.setItem('sg-intro-played', '1')` — remembers that the intro played
- `sessionStorage.getItem('sg-intro-played')` — checks if intro already played
- `sessionStorage.setItem('sg-transition-active', '1')` — signals next page to play enter animation

### Class Toggling

**What it is:** Adding/removing CSS classes with JavaScript to change how things look.

**Examples:**
- `el.classList.add('animate-visible')` — triggers fade-in animation
- `overlay.classList.add('active')` — shows the overlay (changes `display: none` to `display: flex`)
- `star.classList.add('filled')` — fills in a star

### CSS Transitions vs CSS Animations

**Transitions:** Go from state A to state B when a property changes.
```css
transition: opacity 0.5s ease-out;  /* When opacity changes, take 0.5s */
```

**Animations:** Run automatically, can loop, have keyframes.
```css
animation: marquee 30s linear infinite;  /* Runs forever */
```

### IntersectionObserver

**What it is:** A browser API that tells you when an element scrolls into view.

**How it's used:** `animations.js` creates observers that watch sections. When a section becomes 15% visible, it triggers the fade-in animations for all `.animate-child` elements inside it.

### requestAnimationFrame

**What it is:** Asks the browser to call your function before the next screen refresh (~60 times per second).

**How it's used:** The intro animation and hand tracking loop both use it for smooth, efficient animation.

### z-index Layering

The site uses z-index to control what appears on top of what:

| z-index | Element |
|---|---|
| 0 | Background images (`.sg-world-bg`) |
| 1 | Main content |
| 5 | Operations page UI elements |
| 9000 | Tile overlays, team overlays |
| 10000 | Intro animation overlay |

---

## Important Design Decisions

### Why One CSS File?

The project uses a single `style.css` instead of per-page stylesheets. This keeps things simple and avoids duplicate code. Page-specific styles (like collage grid on About, team cards on Team) are placed in inline `<style>` blocks within those HTML files.

### Why Inject Navbar With JavaScript?

Instead of copy-pasting the navbar HTML into every page, `common.js` generates it once. This means changing a nav link only requires editing ONE array (`NAV_LINKS`).

### Why sessionStorage for Intro?

The intro animation should play once when you first visit, but not replay every time you navigate back to the homepage. `sessionStorage` is perfect because it clears when you close the tab (so next visit, the intro plays again).

### Why Canvas for the Intro?

The intro animation involves 120 moving particles with lines between them AND animated letter tracing. CSS alone can't do this — it needs pixel-level control, which `<canvas>` provides.

### Why MediaPipe Instead of ONNX for Hand Tracking?

The full ONNX inference pipeline was not ready for demo. MediaPipe provides immediate, high-quality hand landmark detection out of the box, making the project demo-ready.

### Why No Build Tools?

No Webpack, no npm, no build step. The project is pure HTML/CSS/JS that runs directly in any browser with a local server. This keeps it simple and beginner-friendly.

---

## How To Modify The Project

### How To Edit Text

Open the HTML file for the page you want to change. Find the text between HTML tags and edit it. Example: to change the hero subtitle, edit line 33 in `index.html`.

### How To Change Images

Replace image files in `assets/images/` with new ones. Keep the same filename, or update the `src` attribute in the HTML.

### How To Change Colors

Edit the CSS variables in `css/style.css` (lines 9–41). For example, change `--bg-deep: #0A0A0A` to `--bg-deep: #1a1a2e` for a blue-tinted dark background.

### How To Change Animations

- **Speed:** Change duration values (e.g., `0.5s` → `1s`).
- **Style:** Change easing functions (e.g., `ease-out` → `linear`).
- **Disable:** Add `animation: none !important;` or remove the animation property.

### How To Add a New Page

1. Copy an existing HTML file (e.g., `demo.html`).
2. Change the `<title>` and `<meta>` tags.
3. Replace the `<main>` content.
4. Add the page to the `NAV_LINKS` array in `js/common.js`.

### How To Test Changes

1. Save your files.
2. Open a terminal in the project folder.
3. Run: `python3 -m http.server 8000`
4. Open `http://localhost:8000` in your browser.
5. Hard refresh (`Ctrl+Shift+R`) to see changes.

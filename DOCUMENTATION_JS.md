# SignGloss — JavaScript Documentation

This document explains every JavaScript file, every important function, variables, event listeners, execution flow, and how JavaScript controls behavior throughout the project.

---

## Overview of All JS Files

| File | Lines | Loaded On | Type |
|---|---|---|---|
| `common.js` | 69 | ALL pages | Script tag |
| `animations.js` | 174 | ALL pages | Script tag |
| `transitions.js` | 119 | ALL pages | Script tag |
| `intro-animation.js` | 267 | Homepage only | Script tag |
| `hand-tracking.js` | 241 | Operations only | Script tag |
| `team.js` | 172 | Team only | Script tag |
| `demo.js` | 13 | Demo only | Script tag |
| `contract.js` | 19 | Not actively loaded | ES Module |
| `bridge.js` | 94 | Not actively loaded | ES Module |
| `capture.js` | 49 | Not actively loaded | ES Module |
| `landmarks.js` | 116 | Not actively loaded | ES Module |
| `decoder.js` | 69 | Not actively loaded | ES Module |
| `operations-capture.js` | 247 | Not actively loaded | ES Module |
| `operations-inference.js` | 210 | Not actively loaded | ES Module |
| `inference-worker.js` | 192 | Used as Web Worker | Worker script |
| `paint-transition.js` | 168 | Not actively loaded | ES Module |

**"Not actively loaded"** means these files exist but are NOT included in any HTML `<script>` tag currently. They were part of an earlier ONNX-based pipeline design. The active system uses `hand-tracking.js` instead.

---

## 1. common.js — Shared Navbar & Footer

### Purpose
Injects the same navbar and footer HTML into every page so you don't have to copy-paste it.

### Important Variables

```javascript
const NAV_LINKS = [
  { text: 'Home', href: 'index.html' },
  { text: 'About', href: 'about.html' },
  { text: 'Demo', href: 'demo.html' },
  { text: 'Operations', href: 'operations.html' },
  { text: 'Learn', href: 'learn.html' },
  { text: 'Team', href: 'team.html' },
];
```
This is the SINGLE SOURCE OF TRUTH for all navigation links. To add a page, add an entry here.

### Functions

#### `getCurrentPage()`
```javascript
function getCurrentPage() {
  var path = window.location.pathname;    // e.g., "/UID/about.html"
  var file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  return file;                            // returns "about.html"
}
```
Extracts the current filename from the browser URL. Used to highlight the active nav link.

#### `injectNavbar()`
1. Finds `<div id="navbar-placeholder">`.
2. Gets the current page name.
3. Loops through `NAV_LINKS`, building `<li>` elements.
4. Adds the `active` class to the link matching the current page.
5. Sets `placeholder.innerHTML` to a complete Bootstrap navbar.
6. Adds a spacer `<div>` (68px height) so content doesn't hide behind the fixed navbar.

#### `injectFooter()`
1. Finds `<div id="footer-placeholder">`.
2. Sets its innerHTML to a footer with the current year.

#### `init()` and auto-execution
```javascript
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```
**What this does:** If the page hasn't finished loading, wait for `DOMContentLoaded` event. If the page already loaded (script was deferred), run immediately. This pattern is used in almost every JS file in the project.

---

## 2. animations.js — Scroll Animations & Counters

### Purpose
Handles all scroll-triggered animations, stat counter animations, carousel behavior, and triggers the intro animation.

### Function: `initStaggeredEntrances()`

**What it does:** Makes elements fade in as you scroll down the page.

**Step-by-step:**
1. Finds all sections: `document.querySelectorAll('.sg-section, .sg-hero, section')`.
2. Creates an `IntersectionObserver` with `threshold: 0.15` (triggers when 15% visible).
3. Observes each section.
4. When a section becomes visible:
   - Finds all `.animate-child` elements inside it.
   - For each child, sets a delay: `el.style.transitionDelay = (i * 120) + 'ms'`.
   - Adds the class `animate-visible`.
   - Stops observing that section (animation only happens once).

**How the animation works:**
```css
/* Before (in style.css) */
.animate-child { opacity: 0; transform: translateY(20px); }

/* After JS adds class */
.animate-child.animate-visible { opacity: 1; transform: translateY(0); }
```
The CSS `transition` property handles the smooth change.

### Function: `initCountUpStats()`

**What it does:** Animates numbers from 0 to their target value.

**Step-by-step:**
1. Finds `.sg-stats-grid`.
2. Creates an `IntersectionObserver` with `threshold: 0.3`.
3. When 30% visible:
   - Finds all `.sg-stat-number` elements.
   - For each, reads `data-value` attribute.
   - Parses prefixes (`<`, `>`, `≈`) and suffixes (`%`, `ms`).
   - Uses `requestAnimationFrame` loop to animate from 0 to target over 1500ms.
   - Applies cubic ease-out: `1 - Math.pow(1 - t, 3)` for decelerating animation.

### Function: `initCarousel()`

**What it does:** Enables drag-to-scroll and button navigation for carousels.

**Key variables:**
```javascript
var currentIndex = 0;      // Which card is showing
var startX = 0;            // Where drag started
var isDragging = false;    // Is user currently dragging?
var dragOffset = 0;        // How far user dragged
var currentTranslate = 0;  // Current CSS translateX value
```

**How drag works:**
1. `mousedown`/`touchstart` → Records start position, sets `isDragging = true`.
2. `mousemove`/`touchmove` → If dragging, calculates offset and moves track.
3. `mouseup`/`touchend` → Snaps to nearest card based on drag distance.

**Snap logic:**
```javascript
var threshold = getCardWidth() * 0.25;  // 25% of card width
if (dragOffset < -threshold) snapTo(currentIndex + 1);       // Dragged left enough → next
else if (dragOffset > threshold) snapTo(currentIndex - 1);   // Dragged right enough → prev
else snapTo(currentIndex);                                     // Not enough → snap back
```

### Function: `initIntroHook()`
Checks if `#sg-intro-overlay` exists. If yes, calls `initIntroAnimation()` (defined in `intro-animation.js`).

---

## 3. intro-animation.js — Canvas Intro Animation

### Purpose
Creates the "SIGNGLOSS" text animation on the homepage using HTML Canvas.

### How Letters Are Defined

```javascript
var LETTER_DEFS = {
  S: [[1,0],[0,0],[0,0.5],[1,0.5],[1,1],[0,1]],
  I: [[0.5,0],[0.5,1]],
  G: [[1,0],[0,0],[0,1],[1,1],[1,0.5],[0.5,0.5]],
  N: [[0,1],[0,0],[1,1],[1,0]],
  L: [[0,0],[0,1],[1,1]],
  O: [[0,0],[1,0],[1,1],[0,1],[0,0]],
};
```

Each letter is defined as an array of `[x, y]` points where x and y range from 0 to 1. These are scaled and positioned to create the actual letter coordinates.

**Example: The letter "S"** starts at top-right `[1,0]`, goes to top-left `[0,0]`, down to middle-left `[0,0.5]`, across to middle-right `[1,0.5]`, down to bottom-right `[1,1]`, and finally to bottom-left `[0,1]`.

### Background Network

```javascript
var BG_NODE_COUNT = 120;   // 120 dots
```

- 120 nodes placed randomly with random velocities.
- Nodes slowly drift (bounce off edges).
- Lines are drawn between nodes that are within 150px of each other.
- Lines have opacity based on distance (closer = more visible).
- Each node has a "bloom" glow effect (radial gradient).

### Animation Phases (Timing)

```javascript
var PHASE_BG = 800;            // Background fully visible by 800ms
var PHASE_DOTS = 1500;         // Letter dots appear at 1500ms
var PHASE_TRACE_START = 2000;  // First letter starts tracing at 2000ms
var TRACE_PER_LETTER = 400;    // Each letter takes 400ms to trace
var TOTAL_TRACE = 2000 + 9 * 400;  // All letters done by ~5600ms
var HOLD_END = TOTAL_TRACE + 2000; // Hold for 2 seconds
var FADE_END = HOLD_END + 500;     // Fade out over 500ms
```

### Letter Tracing Logic

The `drawLetterTraces()` function:
1. For each letter, calculates how much of its total length should be drawn (based on elapsed time).
2. Iterates through the letter's line segments.
3. Draws segments up to the target length.
4. If the target falls mid-segment, interpolates to find the exact end point.
5. Uses `ctx.shadowBlur = 12` for a white glow effect.

### Session Check
```javascript
if (sessionStorage.getItem('sg-intro-played')) {
  overlay.remove();   // Skip animation if already played
  return;
}
```

After animation completes:
```javascript
sessionStorage.setItem('sg-intro-played', '1');
overlay.remove();
```

---

## 4. transitions.js — Page Transitions

### Purpose
Creates smooth sliding animations when navigating between pages.

### Global Variable
```javascript
var isTransitioning = false;   // Prevents multiple transitions at once
```

### Function: `animateElements(elements, fromX, toX, fromOpacity, toOpacity, duration, easing, staggerMs)`

This is the core animation engine. It:
1. Sorts elements by their horizontal position (left-to-right).
2. For each element, with a stagger delay:
   - Sets initial position (`fromX`, `fromOpacity`).
   - On next frame, transitions to target (`toX`, `toOpacity`).
3. Returns a Promise that resolves when ALL elements finish.

### Function: `playExitTransition()`
```javascript
// Slides all .animate-child elements LEFT 100px, fades to 0
animateElements(elements, 0, -100, 1, 0, 400, 'cubic-bezier(0.4, 0, 0.2, 1)', 60);
```

### Function: `playEnterTransition()`
```javascript
// Slides from RIGHT 100px to normal position, fades in
animateElements(elements, 100, 0, 0, 1, 450, 'cubic-bezier(0.16, 1, 0.3, 1)', 60);
```

### Function: `interceptLinks()`
Adds a click event listener to the entire document:
1. Checks if the clicked element is an `<a>` tag with an `href`.
2. Ignores external links (`http`), email links (`mailto`), hash links (`#`), and same-page links.
3. Sets `isTransitioning = true` (prevents double-clicks).
4. Prevents default navigation.
5. Sets `sg-transition-active` in sessionStorage.
6. Plays exit animation.
7. After animation, navigates to the new URL.

### Function: `initTransitions()`
```javascript
if (sessionStorage.getItem('sg-transition-active')) {
  sessionStorage.removeItem('sg-transition-active');
  playEnterTransition();    // New page plays enter animation
}
interceptLinks();
```

---

## 5. hand-tracking.js — MediaPipe Hand Tracking

### Purpose
The ACTIVE hand tracking system on the Operations page. Uses Google's MediaPipe to detect hands in webcam video and draws landmarks on a canvas.

### Wrapped in IIFE
```javascript
(function () {
  // All code is inside this
})();
```
**IIFE (Immediately Invoked Function Expression):** Runs immediately and keeps all variables private. Nothing leaks into the global scope.

### Drawing Configuration
```javascript
var DRAW_POINTS = [0, 1, 4, 5, 8, 9, 12, 13, 16, 17, 20];  // 11 landmark points
var CONNECTIONS = [
  [0, 1], [1, 4],     // Thumb
  [0, 5], [5, 8],     // Index
  [0, 9], [9, 12],    // Middle
  [0, 13], [13, 16],  // Ring
  [0, 17], [17, 20]   // Pinky
];
var POINT_COLOR = 'rgb(250, 44, 250)';   // Bright pink dots
var LINE_COLOR = 'rgb(121, 22, 76)';     // Dark pink lines
var POINT_RADIUS = 6;
var LINE_WIDTH = 2;
```

These 11 points represent: wrist (0), thumb tip (4), index tip (8), middle tip (12), ring tip (16), pinky tip (20), and key knuckle points.

### Function: `handleStart()` (async)

**Step-by-step:**
1. Hide start button, error message, placeholder.
2. Show loading overlay.
3. Request camera access:
   ```javascript
   var stream = await navigator.mediaDevices.getUserMedia({
     video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
     audio: false
   });
   ```
4. Set stream as video source, wait for metadata, play video.
5. Mirror the video (selfie mode):
   ```javascript
   videoEl.style.transform = 'scaleX(-1)';
   canvasEl.style.transform = 'scaleX(-1)';
   ```
6. Load MediaPipe:
   ```javascript
   var vision = await import(VISION_CDN + '/vision_bundle.mjs');
   handLandmarker = await vision.HandLandmarker.createFromOptions(wasmFileset, {
     baseOptions: { modelAssetPath: '...hand_landmarker.task', delegate: 'CPU' },
     runningMode: 'VIDEO',
     numHands: 2,
     minHandDetectionConfidence: 0.7,
     minTrackingConfidence: 0.5,
   });
   ```
7. Hide loading, show stop button.
8. Start the detection loop.

### Function: `loop()`

Runs every animation frame (~60fps):
1. Gets current timestamp.
2. Ensures timestamp is strictly increasing (MediaPipe requirement).
3. Calls `handLandmarker.detectForVideo(videoEl, safeTimestamp)`.
4. Passes results to `drawLandmarks()`.
5. Updates FPS counter.
6. Requests next frame.

### Function: `drawLandmarks(results)`

1. Sets canvas size to match video dimensions.
2. Clears previous frame.
3. For each detected hand:
   - Draws connections (lines between finger joints) in dark pink.
   - Draws landmark points (circles) in bright pink.
4. Coordinates are normalized (0–1), so they're multiplied by canvas width/height.

### Function: `updateFps()`
```javascript
fpsFrames++;
var now = performance.now();
if (now - fpsLastTime >= 1000) {
  var fps = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
  fpsFrames = 0;
  fpsLastTime = now;
  // Update display
}
```
Counts frames for 1 second, then calculates and displays FPS.

### Function: `handleStop()`
1. Sets `isRunning = false` → loop stops.
2. Cancels animation frame.
3. Stops all camera tracks.
4. Hides video, clears canvas.
5. Shows start button again.
6. Updates status to "OFFLINE".

### Error Handling
```javascript
function showCameraError(err) {
  var msg = 'Camera access failed.';
  if (err.name === 'NotAllowedError') msg = 'Camera permission denied...';
  else if (err.name === 'NotFoundError') msg = 'No camera detected.';
  else if (err.name === 'NotReadableError') msg = 'Camera is in use...';
  // Show error in UI
}
```

---

## 6. team.js — Team Cards & Contact Form

### Part 1: Team Card Expansion (lines 1–69)

**How clicking a card works:**
1. Finds all `.sg-team-card` elements and the overlay.
2. On click:
   - Finds `.sg-card-expand-content` inside the clicked card.
   - Clears the overlay content.
   - Clones the photo, name, and role from the card.
   - Clones the expand content (bio, skills, links).
   - Adds clones to the overlay.
   - Shows overlay (adds `active` class).
   - Prevents background scrolling (`document.body.style.overflow = 'hidden'`).

**Keyboard accessibility:**
```javascript
card.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    card.click();    // Triggers the same click handler
  }
});
```

### Part 2: Star Rating (lines 71–106)

```javascript
function setStars(value) {
  currentRating = value;
  ratingInput.value = value;    // Updates hidden input
  stars.forEach(function(star) {
    var starVal = parseInt(star.getAttribute('data-value'));
    if (starVal <= value) {
      star.classList.remove('bi-star');
      star.classList.add('bi-star-fill', 'filled');   // Filled star
    } else {
      star.classList.remove('bi-star-fill', 'filled');
      star.classList.add('bi-star');                   // Empty star
    }
  });
}
```

### Part 3: Form Validation (lines 108–172)

**Real-time validation** — each field validates on `input` event:
```javascript
function validateField(input, condition) {
  if (condition) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');      // Green border
    return true;
  }
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');      // Red border + error message
  return false;
}
```

**Validation rules:**
- Name: at least 2 characters
- Age: must be a positive number
- Qualification: not empty
- Message: at least 10 characters
- Rating: at least 1 star

**On submit:**
1. Validates all fields.
2. If all pass: shows success alert, resets form, clears stars.
3. Success message auto-hides after 5 seconds.
4. Note: form does NOT actually send data anywhere — it's client-side only.

---

## 7. demo.js — Demo Video Logic

```javascript
var video = document.getElementById('demo-video');
var placeholder = document.getElementById('demo-placeholder');

video.addEventListener('canplay', function() {
  video.classList.remove('d-none');        // Show video
  placeholder.classList.add('d-none');     // Hide placeholder
});

video.addEventListener('error', function() {
  video.classList.add('d-none');           // Hide video
  placeholder.classList.remove('d-none'); // Show placeholder
});
```

**That's it — 13 lines.** If the video file exists and loads, show it. If not, show the "Coming Soon" placeholder.

---

## 8. inference-worker.js — Web Worker for ONNX Model

### What Is A Web Worker?
A Web Worker runs JavaScript in a **background thread**. This means heavy computation (like AI model inference) doesn't freeze the user interface. The main page and the worker communicate by sending messages.

### How It Works

**Loading the model:**
```javascript
importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');

async function loadModel(modelPath) {
  session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['wasm'],     // Use WebAssembly for computation
    graphOptimizationLevel: 'all'
  });
  self.postMessage({ type: 'STATUS', status: 'ready' });
}
```

**Processing a frame:**
```javascript
function handleFrame(landmarks) {
  var features = computeVelocity(landmarks, prevFrame);  // 156 features
  prevFrame = new Float32Array(landmarks);
  buffer.push(features);

  if (buffer.length >= WINDOW_SIZE) {    // WINDOW_SIZE = 64
    runInference();
  }
}
```

**Running inference:**
```javascript
async function runInference() {
  var inputData = new Float32Array(64 * 156);  // Flatten buffer
  var tensor = new ort.Tensor('float32', inputData, [1, 64, 156]);
  var results = await session.run({ input: tensor });
  // CTC decode the output
  // Send results back to main thread
}
```

**Message protocol:**
```
Main → Worker:  { type: 'LOAD_MODEL', modelPath: '...' }
Main → Worker:  { type: 'FRAME', data: Float32Array }
Main → Worker:  { type: 'RESET' }
Worker → Main:  { type: 'STATUS', status: 'ready'|'error'|'loading' }
Worker → Main:  { type: 'GLOSS_RESULT', glosses: [...], confidence: 0.85 }
Worker → Main:  { type: 'BUFFER_PROGRESS', fill: 0.5 }
Worker → Main:  { type: 'ERROR', message: '...' }
```

---

## 9. contract.js — Shared Constants

```javascript
export const LANDMARK_COUNT = 26;
export const COORDS = 3;              // x, y, z
export const POSITION_FEATURES = 78;  // 26 × 3
export const TOTAL_FEATURES = 156;    // 78 position + 78 velocity
export const WINDOW_SIZE = 64;        // Frames per inference window
export const NUM_CLASSES = 601;       // 600 glosses + 1 blank
export const MODEL_PATH = 'models/signgloss_stub.onnx';
```

Also defines the `Pipeline` object with callback slots.

---

## 10. Remaining ES Module Files (Not Actively Loaded)

These files were part of the full ONNX pipeline but are not loaded in the current HTML:

- **bridge.js** — Creates a Web Worker, routes messages to Pipeline callbacks, handles worker crashes with auto-restart (max 3 times).
- **capture.js** — Clean camera start/stop functions with error handling.
- **landmarks.js** — Full MediaPipe setup for both hands AND pose (body shoulders/elbows).
- **decoder.js** — CTC greedy decode with confidence calculation.
- **operations-capture.js** — Complete capture loop with landmark drawing (colored by hand: blue for left, green for right).
- **operations-inference.js** — UI updates for gloss display, confidence, inference time, history log, test mode.
- **paint-transition.js** — SVG-based page transition with brush-stroke effect (never used in production).

---

## Common JavaScript Patterns in This Project

### Pattern 1: DOM Ready Check
```javascript
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```
Used in: common.js, animations.js, transitions.js, hand-tracking.js, operations-*.js

### Pattern 2: Element Show/Hide
```javascript
function hide(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
```
Used throughout hand-tracking.js and operations-capture.js.

### Pattern 3: Class Toggle for State
```javascript
overlay.classList.add('active');     // Show
overlay.classList.remove('active'); // Hide
```
CSS handles the actual visual change (`.active { display: flex; }`).

### Pattern 4: Event Delegation
```javascript
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href]');   // Find nearest link ancestor
  if (!link) return;
  // Handle the link click
});
```
Instead of adding listeners to every link, one listener on the document catches all clicks.

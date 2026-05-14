# SignGloss — Animation Documentation

A dedicated guide to EVERY animation in the project — CSS keyframes, transitions, JS triggers, timing, and sequencing.

---

## Animation Index

| # | Animation | Type | File | Trigger |
|---|---|---|---|---|
| 1 | Intro "SIGNGLOSS" trace | Canvas (JS) | intro-animation.js | Page load (first visit) |
| 2 | Scroll fade-in | CSS transition + JS | animations.js + style.css | Scroll into view |
| 3 | Page exit transition | CSS transition + JS | transitions.js | Click internal link |
| 4 | Page enter transition | CSS transition + JS | transitions.js | New page load |
| 5 | Stat count-up | JS (requestAnimationFrame) | animations.js | Scroll into view |
| 6 | Hero breathe | CSS keyframes | style.css | Always running |
| 7 | Title shimmer | CSS keyframes | style.css | Always running |
| 8 | Card border spin | CSS keyframes | style.css | Hover |
| 9 | Stat card pulse | CSS keyframes | style.css | Always running |
| 10 | Pipeline arrow flow | CSS keyframes | style.css | Always running |
| 11 | Marquee scroll | CSS keyframes | style.css | Always running |
| 12 | Live dot pulse | CSS keyframes | style.css | Always running |
| 13 | Loading spinner | CSS keyframes | operations.html | During model load |
| 14 | Tile expand | CSS keyframes | about.html | Click tile |
| 15 | Team card expand | CSS keyframes | team.html | Click card |
| 16 | Slideshow crossfade | CSS transition + JS | style.css + learn.html | Timer (5 seconds) |
| 17 | Carousel slide | CSS transition + JS | learn.html + animations.js | Click/drag |
| 18 | Navbar underline | CSS transition | style.css | Hover |
| 19 | Card hover lift | CSS transition | style.css | Hover |
| 20 | Button hover effects | CSS transition | style.css | Hover |
| 21 | Hand landmark drawing | Canvas (JS) | hand-tracking.js | Each video frame |

---

## 1. Intro "SIGNGLOSS" Trace Animation

### Overview
A full-screen canvas animation that plays when you first visit the homepage. It draws a neural network background and traces the word "SIGNGLOSS" letter by letter.

### Trigger
- Automatic on page load, BUT only if `sessionStorage.getItem('sg-intro-played')` is NOT set.
- After playing, it sets this flag so it won't replay during the session.

### Three Visual Layers

**Layer 1: Background Neural Network (0–800ms)**
```
- 120 random dots placed across the screen
- Each dot drifts slowly (random velocity)
- Lines connect dots within 150px of each other
- Line opacity = (1 - distance/150) × 0.12
- Each dot has a glow (radial gradient, radius 6-12px)
- Everything fades in over 800ms
```

**Layer 2: Letter Dots (1500ms)**
```
- Each letter is defined as coordinate points (e.g., S has 6 points)
- At 1500ms, dots appear at each point
- Each dot has two parts:
  1. A glow circle (radius 14px, 50% opacity)
  2. A solid dot (radius 4px, full opacity)
- Dots fade in over 500ms
```

**Layer 3: Letter Tracing (2000ms onward)**
```
- Starting at 2000ms, letter paths are drawn sequentially
- Each letter takes 400ms to trace
- The tracing has a white glow (shadowBlur: 12)
- Line width: 3px, white color
- Line caps and joins are rounded
```

### Timing Breakdown
```
0ms        Background starts fading in
800ms      Background at full opacity
1500ms     Letter dots start appearing
2000ms     Letter dots fully visible, 'S' starts tracing
2400ms     'I' starts tracing
2800ms     'G' starts tracing
3200ms     'N' starts tracing
3600ms     'G' starts tracing
4000ms     'L' starts tracing
4400ms     'O' starts tracing
4800ms     'S' starts tracing
5200ms     'S' starts tracing (last letter)
5600ms     All letters traced → HOLD period begins
7600ms     Fade out starts (overlay opacity decreases)
8100ms     Animation complete, overlay removed from DOM
```

### Key Technical Details

**Canvas setup (high-DPI support):**
```javascript
var dpr = window.devicePixelRatio || 1;   // e.g., 2 on Retina displays
canvas.width = W * dpr;                    // Double the pixel count
canvas.height = H * dpr;
ctx.scale(dpr, dpr);                       // Scale drawing to match
```
This prevents blurry rendering on high-resolution screens.

**Edge regeneration:**
```javascript
if (elapsed > 300) generateBgEdges();   // Recalculate connections as dots move
```
Since dots drift, their connections change. Edges are recalculated after 300ms.

**Letter path interpolation:**
When a letter is partially traced, the code finds exactly where the drawing should stop:
```javascript
var remain = targetLen - accum;       // How much length is left
var ratio = remain / segLen;          // What fraction of this segment
var ix = pts[i-1].x + dx * ratio;    // Interpolated X position
var iy = pts[i-1].y + dy * ratio;    // Interpolated Y position
```

---

## 2. Scroll Fade-In Animation

### How Elements Start (CSS)
```css
.animate-child {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
```
Every `.animate-child` element is invisible and shifted 20px down.

### How They Appear (JavaScript)
```javascript
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (!entry.isIntersecting) return;
    var children = entry.target.querySelectorAll('.animate-child');
    children.forEach(function(el, i) {
      el.style.transitionDelay = (i * 120) + 'ms';
      el.classList.add('animate-visible');
    });
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });
```

### How They Look When Visible (CSS)
```css
.animate-child.animate-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Stagger Effect
- 1st element: 0ms delay
- 2nd element: 120ms delay
- 3rd element: 240ms delay
- This creates a cascading "waterfall" appearance.

### Why `unobserve`?
Once a section's animations have triggered, `observer.unobserve(entry.target)` stops watching it. This means animations only play ONCE — they don't re-trigger if you scroll up and back down.

---

## 3 & 4. Page Transitions (Exit & Enter)

### Exit Transition
**Trigger:** Clicking any internal link.

**What happens:**
1. `transitions.js` intercepts the click.
2. All `.animate-child` elements are found.
3. They're sorted by horizontal position (left → right).
4. Each element slides left and fades out:
   - `translateX(0)` → `translateX(-100px)`
   - `opacity: 1` → `opacity: 0`
   - Duration: 400ms
   - Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth deceleration)
   - Stagger: 60ms between elements

5. After all elements finish, `window.location.href = newPage`.

### Enter Transition
**Trigger:** New page load with `sg-transition-active` in sessionStorage.

**What happens:**
1. All `.animate-child` elements start at `translateX(100px), opacity: 0`.
2. They slide to `translateX(0), opacity: 1`.
3. Duration: 450ms
4. Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (overshoots slightly — feels bouncy)
5. Stagger: 60ms

### Why Two Different Easings?
- **Exit:** `0.4, 0, 0.2, 1` — starts fast, ends slow (things leaving should feel quick)
- **Enter:** `0.16, 1, 0.3, 1` — starts slow, overshoots, settles (things arriving feel bouncy and natural)

---

## 5. Stat Count-Up Animation

### Trigger
Stats grid scrolls 30% into view (IntersectionObserver threshold: 0.3).

### How It Works
```javascript
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function step(timestamp) {
  if (!startTime) startTime = timestamp;
  var elapsed = timestamp - startTime;
  var t = Math.min(elapsed / 1500, 1);        // 0 to 1 over 1500ms
  var value = Math.round(easeOut(t) * target); // Apply easing
  el.textContent = prefix + value + suffix;
  if (t < 1) requestAnimationFrame(step);
}
```

### Easing Explanation
`easeOut(t) = 1 - (1 - t)³`

At t=0: 0 (start)
At t=0.5: 0.875 (already 87.5% of the way!)
At t=1: 1 (end)

This means the counter goes fast at first and slows down at the end — it "decelerates."

---

## 6–12. CSS-Only Animations

### 6. Hero Breathe
```css
@keyframes hero-breathe {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
}
/* Applied to: .sg-hero::before — Duration: 6s infinite */
```
A radial gradient that slowly grows and shrinks, like breathing.

### 7. Title Shimmer
```css
@keyframes title-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
/* Applied to: .sg-hero-title — Duration: 4s infinite */
```
The title has a `background-size: 200%` gradient. The animation moves the gradient position, creating a shimmer.

### 8. Card Border Spin
```css
@keyframes card-border-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
/* Applied to: .sg-card::before — Duration: 8s linear infinite */
/* Only visible on hover (opacity: 0 → 1) */
```

### 9. Stat Card Pulse
```css
@keyframes stat-pulse {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
/* Applied to: .sg-stat-card::after — Duration: 3s infinite */
/* Each card has staggered delay: 0s, 0.5s, 1s, 1.5s */
```

### 10. Pipeline Arrow Flow
```css
@keyframes arrow-flow {
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(4px); }
}
/* Applied to: .sg-pipeline-arrow — Duration: 2s infinite */
/* Staggered delays: 0s, 0.3s, 0.6s, 0.9s */
```

### 11. Marquee Scroll
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
/* Applied to: .sg-marquee-track — Duration: 30s linear infinite */
```
Content is duplicated in HTML. `-50%` moves exactly one copy's worth, creating seamless loop.

### 12. Live Dot Pulse
```css
@keyframes sg-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
/* Applied to: .sg-live-dot — Duration: 2s infinite */
```

---

## 14 & 15. Overlay Expand Animations

### Tile Expand (about.html)
```css
@keyframes tileExpand {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```
**Trigger:** JS adds `.active` class to overlay (`display: none` → `display: flex`).
**Duration:** 350ms
**Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — starts slow, slightly overshoots.

### Team Expand (team.html)
Identical animation, applied to `.sg-team-overlay-card`.

---

## 16. Slideshow Background (Learn Page)

### CSS
```css
.sg-slide {
  opacity: 0;
  transition: opacity 2s ease-in-out;
}
.sg-slide.active {
  opacity: 0.2;
}
```

### JavaScript
```javascript
setInterval(function() {
  slides[current].classList.remove('active');     // Fade out current
  current = (current + 1) % total;                // Next slide (wraps around)
  slides[current].classList.add('active');          // Fade in next
}, 5000);
```

### How It Looks
- Every 5 seconds, the current background fades out and the next fades in.
- Transition takes 2 seconds.
- Maximum opacity is only 0.2 (20%) — very subtle background effect.
- `% total` ensures it loops: after slide 5, goes back to slide 1.

---

## 17. Carousel Slide

### CSS
```css
.sg-carousel-track {
  display: flex;
  gap: 1.5rem;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
```

### JavaScript Snap
```javascript
function scrollToIndex(index) {
  var itemWidth = getItemWidth();
  track.style.transform = 'translateX(' + (-index * itemWidth) + 'px)';
}
```

When you click next/prev or finish dragging, the track slides to show the target card.

---

## 21. Hand Landmark Drawing

### Not An Animation Per Se — It's Real-Time Drawing

Every frame (~30fps):
1. Canvas is cleared.
2. For each detected hand:
   - 10 lines are drawn (connections between joints).
   - 11 dots are drawn (key landmark points).

### Drawing Code
```javascript
// Lines
ctx.strokeStyle = 'rgb(121, 22, 76)';   // Dark pink
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(hand[a].x * w, hand[a].y * h);
ctx.lineTo(hand[b].x * w, hand[b].y * h);
ctx.stroke();

// Dots
ctx.fillStyle = 'rgb(250, 44, 250)';    // Bright pink
ctx.beginPath();
ctx.arc(lm.x * w, lm.y * h, 6, 0, Math.PI * 2);
ctx.fill();
```

### Why It Looks Smooth
- `requestAnimationFrame` syncs with the browser's refresh rate.
- Canvas is cleared and redrawn every frame (no artifacts from previous frames).
- MediaPipe tracking is fast enough to keep up at ~30 FPS.

---

## Accessibility: Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .animate-child {
    opacity: 1 !important;
    transform: none !important;
  }
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

If the user has "reduce motion" enabled in their OS settings, ALL animations effectively stop. This is important for users who get motion sickness or have vestibular disorders.

---

## How To Modify Animations

### Change speed
Find the `duration` value and change it:
```css
/* Slower marquee: 30s → 60s */
animation: marquee 60s linear infinite;

/* Faster card hover: 0.3s → 0.15s */
transition: transform 0.15s ease;
```

### Change easing
Replace the easing function:
```css
/* Linear (constant speed) */
transition: transform 0.3s linear;

/* Ease-in (starts slow) */
transition: transform 0.3s ease-in;

/* Custom bounce */
transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Disable a specific animation
```css
.sg-hero-title {
  animation: none !important;   /* Stops title shimmer */
}
```

### Change scroll animation distance
In `style.css`, change the `translateY` value:
```css
.animate-child {
  transform: translateY(40px);   /* Was 20px — now elements travel further */
}
```

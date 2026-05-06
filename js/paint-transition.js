let isTransitioning = false;

const STROKE_COUNT = 4;
const BASE_COLOR = '#2a1a1e';
const ACCENT_COLOR = '#1e1a2e';
const COVER_DURATION = 380;
const TOTAL_DURATION = 750;
const STAGGER = 55;

const STROKES = [
  { dir: 1, color: BASE_COLOR, widthRatio: 0.45, curveRatio: 0.08, rotate: -2.5, delay: 0 },
  { dir: -1, color: ACCENT_COLOR, widthRatio: 0.5, curveRatio: -0.12, rotate: 3, delay: STAGGER },
  { dir: 1, color: ACCENT_COLOR, widthRatio: 0.48, curveRatio: 0.06, rotate: -1.8, delay: STAGGER * 2 },
  { dir: -1, color: BASE_COLOR, widthRatio: 0.55, curveRatio: -0.09, rotate: 2.2, delay: STAGGER * 3 },
];

function buildPath(stroke, vw, vh) {
  const w = vw * stroke.widthRatio + 60;
  const c = vh * stroke.curveRatio;
  const h = vh + 40;
  return `M 0,-20 C ${w * 0.3},${c} ${w * 0.7},${h - c} ${w},${h + 20} L ${w},${h + 20} L 0,${h + 20} Z`;
}

function createOverlay() {
  if (document.getElementById('paint-transition-overlay')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'paint-transition-overlay';
  svg.classList.add('transition-overlay-svg');
  svg.setAttribute('viewBox', `0 0 100 100`);
  svg.setAttribute('preserveAspectRatio', 'none');

  const vw = window.innerWidth || 1920;
  const vh = window.innerHeight || 1080;

  STROKES.forEach((s, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', buildPath(s, vw, vh));
    path.setAttribute('fill', s.color);
    path.classList.add('paint-stroke');
    path.dataset.index = i;
    path.dataset.dir = s.dir;
    const offX = s.dir === 1 ? -120 : 120;
    path.style.transform = `translateX(${offX}%) rotate(${s.rotate}deg)`;
    path.style.transitionDelay = '0ms';
    svg.appendChild(path);
  });

  document.body.appendChild(svg);
}

function setStrokesHidden() {
  const paths = document.querySelectorAll('.paint-stroke');
  paths.forEach((p) => {
    const i = parseInt(p.dataset.index);
    const s = STROKES[i];
    const offX = s.dir === 1 ? -120 : 120;
    p.style.transition = 'none';
    p.style.transform = `translateX(${offX}%) rotate(${s.rotate}deg)`;
  });
}

function animateCover() {
  const paths = document.querySelectorAll('.paint-stroke');
  paths.forEach((p) => {
    const i = parseInt(p.dataset.index);
    const s = STROKES[i];
    p.style.transition = `transform ${COVER_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    p.style.transitionDelay = `${s.delay}ms`;
    p.style.transform = `translateX(0%) rotate(${s.rotate}deg)`;
  });
}

function animateReveal() {
  const paths = document.querySelectorAll('.paint-stroke');
  paths.forEach((p) => {
    const i = parseInt(p.dataset.index);
    const s = STROKES[i];
    const exitX = s.dir === 1 ? 120 : -120;
    const revealDuration = TOTAL_DURATION - COVER_DURATION;
    p.style.transition = `transform ${revealDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    p.style.transitionDelay = `${s.delay * 0.5}ms`;
    p.style.transform = `translateX(${exitX}%) rotate(${s.rotate}deg)`;
  });
}

export function initPaintTransition() {
  createOverlay();
  updateViewBox();
  window.addEventListener('resize', updateViewBox);
}

function updateViewBox() {
  const svg = document.getElementById('paint-transition-overlay');
  if (!svg) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);

  const paths = document.querySelectorAll('.paint-stroke');
  paths.forEach((p) => {
    const i = parseInt(p.dataset.index);
    p.setAttribute('d', buildPath(STROKES[i], vw, vh));
  });
}

export function startPaint(url) {
  if (isTransitioning) return;
  isTransitioning = true;

  const svg = document.getElementById('paint-transition-overlay');
  if (!svg) {
    window.location.href = url;
    return;
  }

  updateViewBox();
  setStrokesHidden();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animateCover();

      const maxDelay = STROKES[STROKES.length - 1].delay;
      const navTime = COVER_DURATION + maxDelay + 20;

      setTimeout(() => {
        sessionStorage.setItem('sg-paint-active', '1');
        window.location.href = url;
      }, navTime);
    });
  });

  setTimeout(() => {
    if (isTransitioning) {
      window.location.href = url;
    }
  }, TOTAL_DURATION + 500);
}

export function playPaintArrival() {
  const svg = document.getElementById('paint-transition-overlay');
  if (!svg) return;

  updateViewBox();

  const paths = document.querySelectorAll('.paint-stroke');
  paths.forEach((p) => {
    const i = parseInt(p.dataset.index);
    const s = STROKES[i];
    p.style.transition = 'none';
    p.style.transform = `translateX(0%) rotate(${s.rotate}deg)`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animateReveal();
    });
  });

  const maxDelay = STROKES[STROKES.length - 1].delay * 0.5;
  const revealDuration = TOTAL_DURATION - COVER_DURATION;

  setTimeout(() => {
    setStrokesHidden();
    isTransitioning = false;
  }, revealDuration + maxDelay + 50);
}

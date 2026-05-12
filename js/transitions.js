const STROKE_COLOR = '#E8734A';
const WIPE_DURATION = 0.55;
const WIPE_EASE = [0.76, 0, 0.24, 1];

let overlay = null;
let strokePath = null;
let pathLength = 0;
let isTransitioning = false;

function ensureOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.id = 'transition-overlay';
  overlay.innerHTML = `
    <svg viewBox="0 0 1600 100" preserveAspectRatio="none"
         style="width:100%;height:100%;position:absolute;top:0;left:0">
      <path d="M-100,50 Q200,20 500,55 Q800,85 1100,45 Q1400,15 1700,50"
            stroke="${STROKE_COLOR}"
            stroke-width="120"
            stroke-linecap="round"
            fill="none"
            id="wipe-stroke"/>
    </svg>`;
  document.body.appendChild(overlay);
  strokePath = document.getElementById('wipe-stroke');
  pathLength = strokePath.getTotalLength();
  strokePath.style.strokeDasharray = pathLength;
  strokePath.style.strokeDashoffset = pathLength;
}

function playExitStroke() {
  return new Promise(resolve => {
    ensureOverlay();
    overlay.classList.add('active');
    strokePath.style.strokeDashoffset = pathLength;

    const { animate } = Motion;
    animate(strokePath, {
      strokeDashoffset: [pathLength, 0]
    }, {
      duration: WIPE_DURATION,
      easing: WIPE_EASE
    }).finished.then(resolve);
  });
}

function playEnterStroke() {
  ensureOverlay();
  overlay.classList.add('active');
  strokePath.style.strokeDashoffset = 0;

  const { animate } = Motion;
  animate(strokePath, {
    strokeDashoffset: [0, -pathLength]
  }, {
    duration: WIPE_DURATION,
    easing: WIPE_EASE
  }).finished.then(() => {
    overlay.classList.remove('active');
    strokePath.style.strokeDashoffset = pathLength;
  });
}

function interceptLinks() {
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('javascript')) return;

    const currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html';
    if (href === currentPage) return;

    if (isTransitioning) return;
    isTransitioning = true;

    e.preventDefault();
    sessionStorage.setItem('sg-transition-active', '1');
    await playExitStroke();
    window.location.href = href;
  });
}

function initTransitions() {
  ensureOverlay();

  if (sessionStorage.getItem('sg-transition-active')) {
    sessionStorage.removeItem('sg-transition-active');
    playEnterStroke();
  }

  interceptLinks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransitions);
} else {
  initTransitions();
}

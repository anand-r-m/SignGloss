const STAR_COUNT = 200;
const ACCEL_DURATION = 600;
const FLASH_DURATION = 300;
const TOTAL_DURATION = ACCEL_DURATION + FLASH_DURATION;
const ARRIVAL_DURATION = 200;

let canvas, ctx;
let stars = [];
let animationId = null;
let startTime = 0;
let targetUrl = '';
let isWarping = false;

function createStars() {
  stars = [];
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 50 + 10;
    stars.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      angle: angle,
      speed: Math.random() * 2 + 0.5,
      size: Math.random() * 1.5 + 0.5,
      hue: 210 + Math.random() * 30,
    });
  }
}

function drawWarpFrame(elapsed) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const progress = Math.min(elapsed / ACCEL_DURATION, 1);
  const eased = progress * progress * progress;

  ctx.fillStyle = `rgba(2, 2, 8, ${0.3 + eased * 0.7})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const speedMultiplier = 1 + eased * 60;
    const dx = Math.cos(s.angle) * s.speed * speedMultiplier;
    const dy = Math.sin(s.angle) * s.speed * speedMultiplier;

    s.x += dx * 0.016;
    s.y += dy * 0.016;

    const trailLength = eased * 40;
    const tx = s.x - Math.cos(s.angle) * trailLength * s.speed;
    const ty = s.y - Math.sin(s.angle) * trailLength * s.speed;

    const brightness = 0.6 + eased * 0.4;
    const sat = 30 + eased * 70;
    ctx.strokeStyle = `hsla(${s.hue}, ${sat}%, ${70 + eased * 30}%, ${brightness})`;
    ctx.lineWidth = s.size * (1 + eased * 2);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
  }

  if (elapsed > ACCEL_DURATION) {
    const flashProgress = (elapsed - ACCEL_DURATION) / FLASH_DURATION;
    const flashEased = flashProgress * flashProgress;
    const radius = Math.max(canvas.width, canvas.height) * flashEased;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${flashEased})`);
    gradient.addColorStop(0.5, `rgba(200, 220, 255, ${flashEased * 0.6})`);
    gradient.addColorStop(1, `rgba(100, 150, 255, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function warpLoop(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;

  drawWarpFrame(elapsed);

  if (elapsed >= TOTAL_DURATION) {
    window.location.href = targetUrl;
    return;
  }

  animationId = requestAnimationFrame(warpLoop);
}

export function startWarp(url) {
  if (isWarping) return;
  isWarping = true;
  targetUrl = url;

  canvas = document.getElementById('warp-overlay');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');

  createStars();
  canvas.classList.add('active');
  startTime = 0;
  animationId = requestAnimationFrame(warpLoop);
}

export function playArrival() {
  canvas = document.getElementById('warp-overlay');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');

  canvas.classList.add('active');
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const arrivalStart = performance.now();

  function fadeOut(ts) {
    const elapsed = ts - arrivalStart;
    const progress = Math.min(elapsed / ARRIVAL_DURATION, 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (progress < 1) {
      requestAnimationFrame(fadeOut);
    } else {
      canvas.classList.remove('active');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      isWarping = false;
    }
  }

  requestAnimationFrame(fadeOut);
}

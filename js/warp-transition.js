let isTransitioning = false;

export function startWarp(url) {
  if (isTransitioning) return;
  isTransitioning = true;

  const overlay = document.getElementById('warp-overlay');
  if (!overlay) {
    window.location.href = url;
    return;
  }

  overlay.classList.add('active');
  setTimeout(() => {
    sessionStorage.setItem('sg-warp-active', '1');
    window.location.href = url;
  }, 350);
}

export function playArrival() {
  const overlay = document.getElementById('warp-overlay');
  if (!overlay) return;

  overlay.style.opacity = '1';
  overlay.classList.add('active');

  requestAnimationFrame(() => {
    overlay.style.transition = 'opacity 0.4s ease-out';
    overlay.style.opacity = '0';
  });

  setTimeout(() => {
    overlay.classList.remove('active');
    overlay.style.transition = '';
    isTransitioning = false;
  }, 420);
}

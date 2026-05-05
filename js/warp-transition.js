let isTransitioning = false;

export function startWarp(url) {
  if (isTransitioning) return;
  isTransitioning = true;

  const overlay = document.getElementById('sg-transition-overlay');
  const content = document.body;

  if (!overlay) {
    window.location.href = url;
    return;
  }

  content.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  content.style.transform = 'translateX(-2%) scale(0.98)';
  content.style.opacity = '0';

  overlay.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
  overlay.style.transform = 'scaleX(1)';

  setTimeout(() => {
    sessionStorage.setItem('sg-transition-dir', 'enter');
    window.location.href = url;
  }, 420);
}

export function playArrival() {
  const overlay = document.getElementById('sg-transition-overlay');
  const content = document.body;

  if (!overlay) return;

  content.style.transform = 'translateX(2%) scale(0.98)';
  content.style.opacity = '0';
  overlay.style.transform = 'scaleX(1)';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      overlay.style.transform = 'scaleX(0)';
      overlay.style.transformOrigin = 'right';

      content.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      content.style.transform = 'translateX(0) scale(1)';
      content.style.opacity = '1';
    });
  });

  setTimeout(() => {
    content.style.transition = '';
    content.style.transform = '';
    content.style.opacity = '';
    overlay.style.transition = '';
    overlay.style.transform = 'scaleX(0)';
    overlay.style.transformOrigin = 'left';
    isTransitioning = false;
  }, 500);
}

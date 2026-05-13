var isTransitioning = false;

function animateElements(elements, fromX, toX, fromOpacity, toOpacity, duration, easing, staggerMs) {
  return new Promise(function(resolve) {
    if (elements.length === 0) {
      resolve();
      return;
    }

    var completed = 0;
    var total = elements.length;

    var sorted = Array.from(elements).sort(function(a, b) {
      return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });

    sorted.forEach(function(el, i) {
      var delay = i * staggerMs;

      setTimeout(function() {
        el.style.transition = 'transform ' + duration + 'ms ' + easing + ', opacity ' + duration + 'ms ' + easing;
        el.style.transform = 'translateX(' + fromX + 'px)';
        el.style.opacity = fromOpacity;

        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            el.style.transform = 'translateX(' + toX + 'px)';
            el.style.opacity = toOpacity;
          });
        });

        setTimeout(function() {
          completed++;
          if (completed === total) {
            resolve();
          }
        }, duration + 20);
      }, delay);
    });
  });
}

function playExitTransition() {
  var elements = document.querySelectorAll('.animate-child');
  elements.forEach(function(el) {
    el.style.transform = 'translateX(0)';
    el.style.opacity = '1';
  });
  return animateElements(
    elements,
    0, -100,
    1, 0,
    400,
    'cubic-bezier(0.4, 0, 0.2, 1)',
    60
  );
}

function playEnterTransition() {
  var elements = document.querySelectorAll('.animate-child');
  elements.forEach(function(el) {
    el.style.transform = 'translateX(100px)';
    el.style.opacity = '0';
  });

  requestAnimationFrame(function() {
    animateElements(
      elements,
      100, 0,
      0, 1,
      450,
      'cubic-bezier(0.16, 1, 0.3, 1)',
      60
    ).then(function() {
      elements.forEach(function(el) {
        el.style.transition = '';
        el.style.transform = '';
      });
    });
  });
}

function interceptLinks() {
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('javascript')) return;

    var currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html';
    if (href === currentPage) return;
    if (isTransitioning) return;

    isTransitioning = true;
    e.preventDefault();
    sessionStorage.setItem('sg-transition-active', '1');

    playExitTransition().then(function() {
      window.location.href = href;
    });
  });
}

function initTransitions() {
  if (sessionStorage.getItem('sg-transition-active')) {
    sessionStorage.removeItem('sg-transition-active');
    playEnterTransition();
  }

  interceptLinks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTransitions);
} else {
  initTransitions();
}

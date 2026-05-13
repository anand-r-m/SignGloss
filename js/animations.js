function initStaggeredEntrances() {
  var sections = document.querySelectorAll('.sg-section, .sg-hero, section');

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

  sections.forEach(function(section) {
    var children = section.querySelectorAll('.animate-child');
    if (children.length > 0) {
      observer.observe(section);
    }
  });
}

function initCountUpStats() {
  var statsGrid = document.querySelector('.sg-stats-grid');
  if (!statsGrid) return;

  var triggered = false;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting || triggered) return;
      triggered = true;

      var statEls = statsGrid.querySelectorAll('.sg-stat-number');

      statEls.forEach(function(el) {
        var raw = el.getAttribute('data-value') || el.textContent;
        var prefix = (raw.match(/^[<>≈~]*/) || [''])[0];
        var suffix = (raw.match(/[%+xms]*$/) || [''])[0];
        var numStr = raw.replace(/[^0-9.]/g, '');
        var target = parseFloat(numStr) || 0;
        var duration = 1500;
        var startTime = null;

        el.textContent = prefix + '0' + suffix;

        function easeOut(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var t = Math.min(elapsed / duration, 1);
          var value = Math.round(easeOut(t) * target);
          el.textContent = prefix + value + suffix;

          if (t < 1) {
            requestAnimationFrame(step);
          }
        }

        requestAnimationFrame(step);
      });

      observer.unobserve(statsGrid);
    });
  }, { threshold: 0.3 });

  observer.observe(statsGrid);
}

function initCarousel() {
  var track = document.querySelector('.sg-carousel-track');
  if (!track) return;

  var cards = Array.from(track.children);
  if (cards.length === 0) return;

  var prevBtn = document.querySelector('.sg-carousel-prev');
  var nextBtn = document.querySelector('.sg-carousel-next');

  var currentIndex = 0;
  var startX = 0;
  var isDragging = false;
  var dragOffset = 0;
  var currentTranslate = 0;

  function getCardWidth() {
    return cards[0].offsetWidth + 24;
  }

  function getMaxIndex() {
    var cardW = getCardWidth();
    var visible = Math.floor(track.parentElement.offsetWidth / cardW);
    return Math.max(0, cards.length - visible);
  }

  function snapTo(index) {
    var cardW = getCardWidth();
    currentIndex = Math.max(0, Math.min(index, getMaxIndex()));
    currentTranslate = -(currentIndex * cardW);
    track.style.transition = 'transform 0.3s ease-out';
    track.style.transform = 'translateX(' + currentTranslate + 'px)';
  }

  function handleDragStart(e) {
    isDragging = true;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    track.style.cursor = 'grabbing';
    track.style.transition = 'none';
  }

  function handleDragMove(e) {
    if (!isDragging) return;
    var x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    dragOffset = x - startX;
    track.style.transform = 'translateX(' + (currentTranslate + dragOffset) + 'px)';
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';

    var threshold = getCardWidth() * 0.25;
    if (dragOffset < -threshold) {
      snapTo(currentIndex + 1);
    } else if (dragOffset > threshold) {
      snapTo(currentIndex - 1);
    } else {
      snapTo(currentIndex);
    }
    dragOffset = 0;
  }

  track.addEventListener('mousedown', handleDragStart);
  track.addEventListener('touchstart', handleDragStart, { passive: true });
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('touchmove', handleDragMove, { passive: true });
  window.addEventListener('mouseup', handleDragEnd);
  window.addEventListener('touchend', handleDragEnd);

  if (prevBtn) prevBtn.addEventListener('click', function() { snapTo(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function() { snapTo(currentIndex + 1); });

  snapTo(0);
}

function initIntroHook() {
  var overlay = document.getElementById('sg-intro-overlay');
  if (!overlay) return;

  if (typeof initIntroAnimation === 'function') {
    initIntroAnimation();
  }
}

function initAnimations() {
  initStaggeredEntrances();
  initCountUpStats();
  initCarousel();
  initIntroHook();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

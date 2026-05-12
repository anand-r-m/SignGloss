function initStaggeredEntrances() {
  const { animate, inView, stagger } = Motion;

  document.querySelectorAll('.sg-section, .sg-hero, section').forEach(section => {
    const children = section.querySelectorAll('.animate-child');
    if (children.length === 0) return;

    inView(section, () => {
      animate(children, {
        opacity: [0, 1],
        y: [24, 0]
      }, {
        duration: 0.5,
        delay: stagger(0.12),
        easing: 'ease-out'
      });
    }, { amount: 0.15 });
  });
}

function initCountUpStats() {
  const { animate, inView, stagger } = Motion;

  const statsSection = document.querySelector('.sg-stats-grid');
  if (!statsSection) return;

  let triggered = false;

  inView(statsSection, () => {
    if (triggered) return;
    triggered = true;

    const statEls = statsSection.querySelectorAll('.sg-stat-number');

    statEls.forEach((el, i) => {
      const raw = el.dataset.value || el.textContent;
      const prefix = raw.match(/^[<>≈~]*/)?.[0] || '';
      const suffix = raw.match(/[%+xms]*$/)?.[0] || '';
      const numStr = raw.replace(/[^0-9.]/g, '');
      const target = parseFloat(numStr) || 0;

      el.textContent = prefix + '0' + suffix;

      setTimeout(() => {
        animate(0, target, {
          duration: 1.5,
          easing: 'ease-out',
          onUpdate: v => {
            el.textContent = prefix + Math.round(v) + suffix;
          }
        });
      }, i * 200);
    });
  }, { amount: 0.3 });
}

function initCarousel() {
  const track = document.querySelector('.sg-carousel-track');
  if (!track) return;

  const cards = Array.from(track.children);
  if (cards.length === 0) return;

  const prevBtn = document.querySelector('.sg-carousel-prev');
  const nextBtn = document.querySelector('.sg-carousel-next');

  let currentIndex = 0;
  let startX = 0;
  let isDragging = false;
  let dragOffset = 0;

  function getCardWidth() {
    return cards[0].offsetWidth + 24;
  }

  function snapTo(index) {
    const { animate } = Motion;
    const cardW = getCardWidth();
    const maxIndex = Math.max(0, cards.length - Math.floor(track.parentElement.offsetWidth / cardW));
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    animate(track, {
      x: -(currentIndex * cardW)
    }, {
      type: 'spring',
      stiffness: 300,
      damping: 30
    });

    cards.forEach((card, i) => {
      const isActive = i >= currentIndex && i < currentIndex + Math.ceil(track.parentElement.offsetWidth / cardW);
      card.style.opacity = isActive ? '1' : '0.5';
      card.style.transform = isActive ? 'scale(1)' : 'scale(0.95)';
    });
  }

  function handleDragStart(e) {
    isDragging = true;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    track.style.cursor = 'grabbing';
  }

  function handleDragMove(e) {
    if (!isDragging) return;
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    dragOffset = x - startX;
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';

    const threshold = getCardWidth() * 0.25;
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

  if (prevBtn) prevBtn.addEventListener('click', () => snapTo(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => snapTo(currentIndex + 1));

  snapTo(0);
}

function initIntroReveal() {
  const overlay = document.getElementById('sg-intro-overlay');
  if (!overlay) return;

  const wordEl = document.getElementById('sg-intro-word');
  if (!wordEl) return;

  const { animate } = Motion;

  animate(wordEl, {
    fontSize: ['8px', '72px'],
    rotate: [720, 0]
  }, {
    duration: 1.4,
    easing: [0.16, 1, 0.3, 1]
  }).finished.then(() => {
    setTimeout(() => {
      animate(overlay, { opacity: [1, 0] }, { duration: 0.5, easing: 'ease-out' }).finished.then(() => {
        overlay.remove();
      });
    }, 1200);
  });
}

function initTypewriterGloss() {
  const outputEl = document.getElementById('current-gloss');
  if (!outputEl) return;

  let currentAnimation = null;

  const origOnGlossResult = window.__sgOrigGlossResult;

  window.__sgTypewriterHook = function(glosses) {
    if (currentAnimation) {
      currentAnimation.stop();
      currentAnimation = null;
    }

    if (!glosses || glosses.length === 0) {
      outputEl.innerHTML = '<span style="color:var(--text-muted)">No signs detected</span>';
      return;
    }

    const glossText = glosses.join(' · ');
    outputEl.innerHTML = '<span id="typewriter-text"></span><span class="sg-gloss-cursor">|</span>';
    const textEl = document.getElementById('typewriter-text');

    const { animate } = Motion;
    currentAnimation = animate(0, glossText.length, {
      duration: glossText.length * 0.045,
      easing: 'linear',
      onUpdate: v => {
        textEl.textContent = glossText.slice(0, Math.round(v));
      },
      onComplete: () => {
        const cursor = outputEl.querySelector('.sg-gloss-cursor');
        if (cursor) {
          setTimeout(() => cursor.remove(), 1500);
        }
        currentAnimation = null;
      }
    });
  };
}

function initAnimations() {
  initStaggeredEntrances();
  initCountUpStats();
  initCarousel();
  initTypewriterGloss();

  if (document.getElementById('sg-intro-overlay')) {
    initIntroReveal();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}

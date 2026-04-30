import { Pipeline, POSITION_FEATURES } from './contract.js';
import { InferenceBridge } from './bridge.js';

let bridge = null;
let mockInterval = null;
let glossHistory = [];

function init() {
  bridge = new InferenceBridge();

  Pipeline.onGlossResult = (glosses, confidence, inferenceTimeMs) => {
    updateCurrentGloss(glosses);
    updateConfidence(confidence);
    updateInferenceTime(inferenceTimeMs);
    appendHistory(glosses, confidence);
  };

  Pipeline.onBufferProgress = (fill) => {
    updateBufferProgress(fill);
  };

  Pipeline.onStatusChange = (status) => {
    updateModelStatus(status);
  };

  Pipeline.onError = (errorMsg) => {
    showError(errorMsg);
  };

  const origOnLandmarks = Pipeline.onLandmarks;
  Pipeline.onLandmarks = (landmarks, frameId, timestamp) => {
    if (origOnLandmarks) origOnLandmarks(landmarks, frameId, timestamp);
    if (bridge) bridge.sendFrame(landmarks);
  };

  bridge.loadModel();

  const testBtn = document.getElementById('test-mode-btn');
  if (testBtn) {
    testBtn.addEventListener('click', toggleTestMode);
  }
}

function updateCurrentGloss(glosses) {
  const el = document.getElementById('current-gloss');
  if (!el) return;

  if (glosses.length === 0) {
    el.innerHTML = '<span class="text-secondary">No signs detected</span>';
    return;
  }

  el.innerHTML = glosses.map(g =>
    '<span class="badge bg-info text-dark me-1 mb-1">' + g + '</span>'
  ).join('');
}

function updateConfidence(confidence) {
  const el = document.getElementById('confidence-display');
  if (!el) return;
  const pct = (confidence * 100).toFixed(1);
  el.textContent = pct + '%';
}

function updateInferenceTime(ms) {
  const el = document.getElementById('inference-time');
  if (!el) return;
  el.textContent = ms + 'ms';
}

function updateBufferProgress(fill) {
  const bar = document.getElementById('buffer-progress');
  if (!bar) return;
  const pct = Math.round(fill * 100);
  bar.style.width = pct + '%';
  bar.setAttribute('aria-valuenow', pct);
  bar.textContent = pct + '%';
}

function updateModelStatus(status) {
  const dot = document.getElementById('status-dot');
  const label = document.getElementById('status-label');
  if (!dot || !label) return;

  dot.className = 'status-dot';

  switch (status) {
    case 'loading':
      dot.classList.add('status-loading');
      label.textContent = 'Loading model...';
      break;
    case 'ready':
      dot.classList.add('status-ready');
      label.textContent = 'Model ready';
      break;
    case 'error':
      dot.classList.add('status-error');
      label.textContent = 'Model error';
      break;
    case 'restarting':
      dot.classList.add('status-loading');
      label.textContent = 'Restarting pipeline...';
      break;
    case 'fatal':
      dot.classList.add('status-error');
      label.textContent = 'Please refresh the page';
      break;
    default:
      label.textContent = status;
  }
}

function showError(message) {
  const el = document.getElementById('error-display');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('d-none');
  setTimeout(() => {
    el.classList.add('d-none');
  }, 8000);
}

function appendHistory(glosses, confidence) {
  if (glosses.length === 0) return;

  const entry = {
    glosses: glosses.join(', '),
    confidence: (confidence * 100).toFixed(1) + '%',
    time: new Date().toLocaleTimeString()
  };
  glossHistory.unshift(entry);

  if (glossHistory.length > 50) {
    glossHistory = glossHistory.slice(0, 50);
  }

  const list = document.getElementById('gloss-history');
  if (!list) return;

  const item = document.createElement('li');
  item.className = 'list-group-item bg-dark border-secondary d-flex justify-content-between';
  item.innerHTML =
    '<span>' + entry.glosses + '</span>' +
    '<small class="text-secondary">' + entry.confidence + ' · ' + entry.time + '</small>';

  if (list.firstChild) {
    list.insertBefore(item, list.firstChild);
  } else {
    list.appendChild(item);
  }

  while (list.children.length > 50) {
    list.removeChild(list.lastChild);
  }
}

function toggleTestMode() {
  const btn = document.getElementById('test-mode-btn');

  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
    if (btn) btn.textContent = 'Start Test Mode';
    if (bridge) bridge.reset();
    return;
  }

  if (btn) btn.textContent = 'Stop Test Mode';

  let frameId = 0;
  mockInterval = setInterval(() => {
    const landmarks = new Float32Array(POSITION_FEATURES);
    for (let i = 0; i < POSITION_FEATURES; i++) {
      landmarks[i] = Math.random();
    }
    Pipeline.onLandmarks(landmarks, frameId++, performance.now());
  }, 1000 / 30);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

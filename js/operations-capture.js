import { Pipeline, POSITION_FEATURES } from './contract.js';
import { startCamera, stopCamera, getStream } from './capture.js';
import { initMediaPipe, processFrame, isReady } from './landmarks.js';

const HAND_SUBSET = [0, 2, 4, 5, 8, 9, 12, 13, 16, 17, 20];
const POSE_SUBSET = [11, 12, 13, 14];

let videoEl, canvasEl, ctx;
let animFrameId = null;
let frameId = 0;
let isRunning = false;
let fpsFrames = 0;
let fpsLastTime = performance.now();
let currentFps = 0;
let lastTimestamp = -1;

function getElements() {
  videoEl = document.getElementById('camera-feed');
  canvasEl = document.getElementById('landmark-canvas');
  if (canvasEl) ctx = canvasEl.getContext('2d');
}

function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function showError(message) {
  hideElement('camera-placeholder');
  hideElement('mediapipe-loading');
  const errEl = document.getElementById('camera-error');
  const msgEl = document.getElementById('camera-error-message');
  if (errEl) errEl.style.display = '';
  if (msgEl) msgEl.textContent = message;
}

function updateFps() {
  fpsFrames++;
  const now = performance.now();
  const delta = now - fpsLastTime;
  if (delta >= 1000) {
    currentFps = Math.round((fpsFrames * 1000) / delta);
    fpsFrames = 0;
    fpsLastTime = now;
    const fpsEl = document.getElementById('fps-display');
    if (fpsEl) fpsEl.textContent = currentFps + ' FPS';
  }
}

function drawLandmarkOverlay(handResults, poseResults) {
  if (!ctx || !canvasEl) return;

  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  const w = canvasEl.width;
  const h = canvasEl.height;

  if (handResults && handResults.landmarks) {
    for (let hi = 0; hi < handResults.landmarks.length; hi++) {
      const hand = handResults.landmarks[hi];
      const handedness = handResults.handedness[hi][0].categoryName;
      const color = handedness === 'Left' ? '#4fc3f7' : '#66bb6a';
      const colorFaded = handedness === 'Left' ? 'rgba(79,195,247,0.4)' : 'rgba(102,187,106,0.4)';

      const connections = [
        [0, 5], [5, 9], [9, 13], [13, 17], [0, 17],
        [0, 1], [1, 2], [2, 3], [3, 4],
        [5, 6], [6, 7], [7, 8],
        [9, 10], [10, 11], [11, 12],
        [13, 14], [14, 15], [15, 16],
        [17, 18], [18, 19], [19, 20],
      ];

      ctx.strokeStyle = colorFaded;
      ctx.lineWidth = 2;
      for (const [a, b] of connections) {
        ctx.beginPath();
        ctx.moveTo(hand[a].x * w, hand[a].y * h);
        ctx.lineTo(hand[b].x * w, hand[b].y * h);
        ctx.stroke();
      }

      for (let i = 0; i < HAND_SUBSET.length; i++) {
        const lm = hand[HAND_SUBSET[i]];
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }

  if (poseResults && poseResults.landmarks && poseResults.landmarks.length > 0) {
    const pose = poseResults.landmarks[0];
    const poseColor = '#ffd54f';
    const poseColorFaded = 'rgba(255,213,79,0.4)';

    const poseConnections = [[11, 13], [12, 14], [11, 12]];
    ctx.strokeStyle = poseColorFaded;
    ctx.lineWidth = 2;
    for (const [a, b] of poseConnections) {
      ctx.beginPath();
      ctx.moveTo(pose[a].x * w, pose[a].y * h);
      ctx.lineTo(pose[b].x * w, pose[b].y * h);
      ctx.stroke();
    }

    for (let i = 0; i < POSE_SUBSET.length; i++) {
      const lm = pose[POSE_SUBSET[i]];
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 6, 0, Math.PI * 2);
      ctx.fillStyle = poseColor;
      ctx.fill();
    }
  }
}

function loop() {
  if (!isRunning) return;

  const timestampMs = performance.now();

  if (timestampMs === lastTimestamp) {
    animFrameId = requestAnimationFrame(loop);
    return;
  }
  lastTimestamp = timestampMs;

  const { landmarks, handResults, poseResults } = processFrame(videoEl, timestampMs);

  drawLandmarkOverlay(handResults, poseResults);
  updateFps();

  if (Pipeline.onLandmarks) {
    Pipeline.onLandmarks(landmarks, frameId++, timestampMs);
  }

  animFrameId = requestAnimationFrame(loop);
}

async function handleStart() {
  getElements();
  if (!videoEl) return;

  hideElement('camera-placeholder');
  hideElement('camera-error');
  showElement('mediapipe-loading');

  const camResult = await startCamera(videoEl);
  if (!camResult.success) {
    hideElement('mediapipe-loading');
    showError(camResult.error);
    return;
  }

  videoEl.style.display = '';

  try {
    await initMediaPipe();
  } catch (err) {
    showError('Failed to load MediaPipe AI model. Please refresh and try again.');
    return;
  }

  hideElement('mediapipe-loading');
  showElement('video-controls');
  showElement('fps-display');

  const stream = getStream();
  if (stream) {
    const tracks = stream.getVideoTracks();
    if (tracks.length > 0) {
      tracks[0].addEventListener('ended', () => {
        handleStop();
        showError('Camera disconnected.');
      });
    }
  }

  isRunning = true;
  frameId = 0;
  fpsFrames = 0;
  lastTimestamp = -1;
  fpsLastTime = performance.now();
  animFrameId = requestAnimationFrame(loop);
}

function handleStop() {
  isRunning = false;
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }

  stopCamera();

  if (videoEl) videoEl.style.display = 'none';
  if (ctx && canvasEl) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  hideElement('video-controls');
  hideElement('fps-display');
  showElement('camera-placeholder');
}

function handleVisibilityChange() {
  if (!isRunning) return;
  if (document.hidden) {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  } else {
    if (!animFrameId) {
      lastTimestamp = -1;
      animFrameId = requestAnimationFrame(loop);
    }
  }
}

function init() {
  getElements();

  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.addEventListener('click', handleStart);

  const stopBtn = document.getElementById('stop-btn');
  if (stopBtn) stopBtn.addEventListener('click', handleStop);

  const retryBtn = document.getElementById('retry-camera-btn');
  if (retryBtn) retryBtn.addEventListener('click', handleStart);

  document.addEventListener('visibilitychange', handleVisibilityChange);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

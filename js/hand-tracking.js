(function () {
  // Landmark drawing spec — matches Python reference exactly
  var DRAW_POINTS = [0, 1, 4, 5, 8, 9, 12, 13, 16, 17, 20];
  var CONNECTIONS = [
    [0, 1], [1, 4],     // Thumb
    [0, 5], [5, 8],     // Index finger
    [0, 9], [9, 12],    // Middle finger
    [0, 13], [13, 16],  // Ring finger
    [0, 17], [17, 20]   // Pinky
  ];
  var POINT_COLOR = 'rgb(250, 44, 250)';
  var LINE_COLOR = 'rgb(121, 22, 76)';
  var POINT_RADIUS = 6;
  var LINE_WIDTH = 2;

  var VISION_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

  var videoEl, canvasEl, ctx;
  var handLandmarker = null;
  var isRunning = false;
  var animFrameId = null;
  var currentStream = null;
  var lastTimestamp = -1;
  var fpsFrames = 0;
  var fpsLastTime = performance.now();

  function hide(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  function init() {
    videoEl = document.getElementById('camera-feed');
    canvasEl = document.getElementById('landmark-canvas');
    if (canvasEl) ctx = canvasEl.getContext('2d');

    var startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.addEventListener('click', handleStart);

    var stopBtn = document.getElementById('stop-btn');
    if (stopBtn) stopBtn.addEventListener('click', handleStop);

    var retryBtn = document.getElementById('retry-camera-btn');
    if (retryBtn) retryBtn.addEventListener('click', handleStart);

    var statusLabel = document.getElementById('status-label');
    if (statusLabel) statusLabel.textContent = 'STANDBY';
  }

  async function handleStart() {
    if (!videoEl || !canvasEl) return;

    hide('start-btn');
    hide('camera-error');
    hide('camera-placeholder');

    // Show loading overlay
    var loadingEl = document.getElementById('mediapipe-loading');
    if (loadingEl) loadingEl.style.display = 'flex';

    // Start camera
    try {
      var stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      currentStream = stream;
      videoEl.srcObject = stream;
      await new Promise(function (resolve, reject) {
        videoEl.onloadedmetadata = resolve;
        videoEl.onerror = reject;
      });
      await videoEl.play();
    } catch (err) {
      if (loadingEl) loadingEl.style.display = 'none';
      showCameraError(err);
      return;
    }

    videoEl.style.display = '';
    // Mirror camera feed
    videoEl.style.transform = 'scaleX(-1)';
    canvasEl.style.transform = 'scaleX(-1)';

    // Load MediaPipe tasks-vision (WASM backend, no WebGL needed)
    try {
      var vision = await import(VISION_CDN + '/vision_bundle.mjs');
      var wasmFileset = await vision.FilesetResolver.forVisionTasks(
        VISION_CDN + '/wasm'
      );
      handLandmarker = await vision.HandLandmarker.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });
    } catch (err) {
      if (loadingEl) loadingEl.style.display = 'none';
      showAppError('Failed to load hand tracking model: ' + err.message);
      return;
    }

    // Hide loading, show stop button
    if (loadingEl) loadingEl.style.display = 'none';
    var stopBtn = document.getElementById('stop-btn');
    if (stopBtn) stopBtn.style.display = '';

    // Update status
    var statusLabel = document.getElementById('status-label');
    if (statusLabel) statusLabel.textContent = 'LIVE SCANNING';

    // Start tracking loop
    isRunning = true;
    fpsFrames = 0;
    fpsLastTime = performance.now();
    lastTimestamp = -1;
    animFrameId = requestAnimationFrame(loop);
  }

  function loop() {
    if (!isRunning || !handLandmarker || !videoEl) return;

    var timestampMs = performance.now();
    if (timestampMs === lastTimestamp) {
      animFrameId = requestAnimationFrame(loop);
      return;
    }

    var safeTimestamp = Math.max(Math.round(timestampMs), lastTimestamp + 1);
    lastTimestamp = safeTimestamp;

    var results = handLandmarker.detectForVideo(videoEl, safeTimestamp);
    drawLandmarks(results);
    updateFps();

    animFrameId = requestAnimationFrame(loop);
  }

  function drawLandmarks(results) {
    if (!ctx || !canvasEl || !videoEl) return;

    var w = videoEl.videoWidth;
    var h = videoEl.videoHeight;
    canvasEl.width = w;
    canvasEl.height = h;
    ctx.clearRect(0, 0, w, h);

    if (!results || !results.landmarks || results.landmarks.length === 0) return;

    for (var hi = 0; hi < results.landmarks.length; hi++) {
      var hand = results.landmarks[hi];

      // Draw connections first (behind points)
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = LINE_WIDTH;
      for (var ci = 0; ci < CONNECTIONS.length; ci++) {
        var a = CONNECTIONS[ci][0];
        var b = CONNECTIONS[ci][1];
        ctx.beginPath();
        ctx.moveTo(hand[a].x * w, hand[a].y * h);
        ctx.lineTo(hand[b].x * w, hand[b].y * h);
        ctx.stroke();
      }

      // Draw landmark points
      ctx.fillStyle = POINT_COLOR;
      for (var pi = 0; pi < DRAW_POINTS.length; pi++) {
        var lm = hand[DRAW_POINTS[pi]];
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function updateFps() {
    fpsFrames++;
    var now = performance.now();
    if (now - fpsLastTime >= 1000) {
      var fps = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
      fpsFrames = 0;
      fpsLastTime = now;
      var fpsEl = document.getElementById('fps-display');
      if (fpsEl) fpsEl.textContent = fps + '.0';
    }
  }

  function handleStop() {
    isRunning = false;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (currentStream) {
      currentStream.getTracks().forEach(function (t) { t.stop(); });
      currentStream = null;
    }
    if (videoEl) videoEl.style.display = 'none';
    if (ctx && canvasEl) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    hide('stop-btn');
    var startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.style.display = '';

    var statusLabel = document.getElementById('status-label');
    if (statusLabel) statusLabel.textContent = 'OFFLINE';
    var fpsEl = document.getElementById('fps-display');
    if (fpsEl) fpsEl.textContent = '0.0';
  }

  function showCameraError(err) {
    var msg = 'Camera access failed.';
    if (err.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access and try again.';
    else if (err.name === 'NotFoundError') msg = 'No camera detected.';
    else if (err.name === 'NotReadableError') msg = 'Camera is in use by another app.';

    var errEl = document.getElementById('camera-error');
    var msgEl = document.getElementById('camera-error-message');
    if (errEl) errEl.style.display = '';
    if (msgEl) msgEl.textContent = msg;
  }

  function showAppError(message) {
    var el = document.getElementById('error-display');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('d-none');
    setTimeout(function () { el.classList.add('d-none'); }, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

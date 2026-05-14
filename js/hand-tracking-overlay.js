/**
 * hand-tracking-overlay.js
 *
 * Draws hand tracking landmarks on the overlay canvas using the
 * EXISTING MediaPipe detection results from operations-capture.js.
 *
 * Instead of loading a second MediaPipe instance, this script hooks
 * into the existing landmark-canvas by observing its drawing state
 * and accessing the shared video element.
 *
 * Replicates the exact drawing behavior from the Python reference:
 *   - 11 landmark points: [0, 1, 4, 5, 8, 9, 12, 13, 16, 17, 20]
 *   - 10 connections: thumb, index, middle, ring, pinky
 *   - Point color: rgb(250, 44, 250) (magenta), radius 6px
 *   - Line color: rgb(121, 22, 76) (dark purple), width 2px
 *   - Horizontally mirrored (like cv2.flip(frame, 1))
 *
 * This script works by monkey-patching the CanvasRenderingContext2D
 * of the existing landmark-canvas so it can intercept the hand
 * results being drawn, and replicate them with the correct style
 * on the overlay canvas.
 */

(function () {
  'use strict';

  // ── Landmark subset (11 specific points) ──
  var DRAW_LANDMARKS = [0, 1, 4, 5, 8, 9, 12, 13, 16, 17, 20];

  // ── Connection pairs (10 specific lines) ──
  var DRAW_CONNECTIONS = [
    [0, 1], [1, 4],     // Thumb
    [0, 5], [5, 8],     // Index finger
    [0, 9], [9, 12],    // Middle finger
    [0, 13], [13, 16],  // Ring finger
    [0, 17], [17, 20],  // Pinky
  ];

  // ── Drawing styles ──
  var POINT_COLOR = 'rgb(250, 44, 250)';
  var POINT_RADIUS = 6;
  var LINE_COLOR = 'rgb(121, 22, 76)';
  var LINE_WIDTH = 2;

  // Store for hand landmarks received from the global hook
  var latestHands = null;

  var overlayCanvas, overlayCtx;
  var animFrameId = null;
  var isDrawing = false;

  /**
   * Draw the 11 landmarks and 10 connections for all detected hands
   * onto the overlay canvas.
   */
  function drawOverlay() {
    if (!overlayCtx || !overlayCanvas || !latestHands) return;

    var w = overlayCanvas.width;
    var h = overlayCanvas.height;

    overlayCtx.clearRect(0, 0, w, h);

    if (!latestHands.landmarks || latestHands.landmarks.length === 0) return;

    for (var hi = 0; hi < latestHands.landmarks.length; hi++) {
      var hand = latestHands.landmarks[hi];

      // ── Connections (lines) first, points on top ──
      overlayCtx.strokeStyle = LINE_COLOR;
      overlayCtx.lineWidth = LINE_WIDTH;

      for (var ci = 0; ci < DRAW_CONNECTIONS.length; ci++) {
        var a = DRAW_CONNECTIONS[ci][0];
        var b = DRAW_CONNECTIONS[ci][1];
        if (!hand[a] || !hand[b]) continue;

        // Mirror horizontally
        var ax = (1 - hand[a].x) * w;
        var ay = hand[a].y * h;
        var bx = (1 - hand[b].x) * w;
        var by = hand[b].y * h;

        overlayCtx.beginPath();
        overlayCtx.moveTo(ax, ay);
        overlayCtx.lineTo(bx, by);
        overlayCtx.stroke();
      }

      // ── Landmark points ──
      overlayCtx.fillStyle = POINT_COLOR;

      for (var li = 0; li < DRAW_LANDMARKS.length; li++) {
        var idx = DRAW_LANDMARKS[li];
        if (!hand[idx]) continue;

        var cx = (1 - hand[idx].x) * w;
        var cy = hand[idx].y * h;

        overlayCtx.beginPath();
        overlayCtx.arc(cx, cy, POINT_RADIUS, 0, Math.PI * 2);
        overlayCtx.fill();
      }
    }
  }

  /**
   * Expose a global function that the existing pipeline can call
   * to pass hand results to this overlay.
   */
  window.__handTrackingOverlay = function (handResults, videoWidth, videoHeight) {
    if (!overlayCanvas || !overlayCtx) return;

    // Sync canvas size
    if (overlayCanvas.width !== videoWidth || overlayCanvas.height !== videoHeight) {
      overlayCanvas.width = videoWidth;
      overlayCanvas.height = videoHeight;
    }

    latestHands = handResults;
    drawOverlay();
  };

  /**
   * Clear the overlay (called when tracking stops).
   */
  window.__handTrackingOverlayClear = function () {
    latestHands = null;
    if (overlayCtx && overlayCanvas) {
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
  };

  function init() {
    overlayCanvas = document.getElementById('hand-tracking-canvas');
    if (!overlayCanvas) return;
    overlayCtx = overlayCanvas.getContext('2d');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

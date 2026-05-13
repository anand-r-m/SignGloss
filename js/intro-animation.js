function initIntroAnimation() {
  var overlay = document.getElementById('sg-intro-overlay');
  var canvas = document.getElementById('sg-intro-canvas');
  if (!overlay || !canvas) return;

  if (sessionStorage.getItem('sg-intro-played')) {
    overlay.remove();
    return;
  }

  var ctx = canvas.getContext('2d');
  var W = window.innerWidth;
  var H = window.innerHeight;
  var dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  var textPoints = buildTextPoints(W, H);
  var textMask = buildTextMask(W, H);
  var nodes = [];
  var edges = [];
  var pathSegments = [];
  var startTime = performance.now();

  var NODE_COUNT = 160;
  var HUB_RATIO = 0.12;
  var CONNECT_RADIUS = 400;
  var MAX_CONNECTIONS = 6;

  function buildTextMask(w, h) {
    var offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    var octx = offscreen.getContext('2d');
    var fontSize = Math.min(w * 0.12, 160);
    octx.font = '700 ' + fontSize + 'px Space Grotesk, sans-serif';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = '#FFFFFF';
    octx.fillText('SignGloss', w / 2, h / 2);
    return octx.getImageData(0, 0, w, h);
  }

  function buildTextPoints(w, h) {
    var offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    var octx = offscreen.getContext('2d');
    var fontSize = Math.min(w * 0.12, 160);
    octx.font = '700 ' + fontSize + 'px Space Grotesk, sans-serif';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = '#FFFFFF';
    octx.fillText('SignGloss', w / 2, h / 2);
    var imageData = octx.getImageData(0, 0, w, h);
    var pts = [];
    var step = 6;
    for (var y = 0; y < h; y += step) {
      for (var x = 0; x < w; x += step) {
        var idx = (y * w + x) * 4;
        if (imageData.data[idx + 3] > 128) {
          pts.push({ x: x, y: y });
        }
      }
    }
    return pts;
  }

  function isInsideText(x, y) {
    var px = Math.floor(x);
    var py = Math.floor(y);
    if (px < 0 || px >= W || py < 0 || py >= H) return false;
    var idx = (py * W + px) * 4;
    return textMask.data[idx + 3] > 128;
  }

  function distToTextEdge(x, y) {
    var minDist = Infinity;
    var step = 4;
    for (var dx = -60; dx <= 60; dx += step) {
      for (var dy = -60; dy <= 60; dy += step) {
        var tx = x + dx;
        var ty = y + dy;
        if (isInsideText(tx, ty)) {
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < minDist) minDist = d;
        }
      }
    }
    return minDist;
  }

  function generateNodes() {
    var attempts = 0;
    while (nodes.length < NODE_COUNT && attempts < 5000) {
      attempts++;
      var x = Math.random() * W;
      var y = Math.random() * H;

      if (isInsideText(x, y)) continue;

      var edgeDist = distToTextEdge(x, y);
      var nearEdge = edgeDist < 50;

      if (!nearEdge && Math.random() > 0.6) continue;
      if (nearEdge && Math.random() > 0.9) continue;

      var isHub = Math.random() < HUB_RATIO;
      nodes.push({
        x: x,
        y: y,
        coreR: isHub ? 3 + Math.random() * 2 : 2 + Math.random() * 1,
        bloomR: isHub ? 14 + Math.random() * 6 : 8 + Math.random() * 4,
        isHub: isHub,
        connections: 0,
        depth: 0.3 + Math.random() * 0.7,
        spawnWave: 0,
        visible: false
      });
    }
  }

  function generateEdges() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var maxConn = n.isHub ? 8 : 2 + Math.floor(Math.random() * 4);
      var candidates = [];

      for (var j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        var dx = nodes[j].x - n.x;
        var dy = nodes[j].y - n.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var radius = n.isHub ? 500 : CONNECT_RADIUS;
        if (dist < radius) {
          candidates.push({ idx: j, dist: dist });
        }
      }

      candidates.sort(function(a, b) { return a.dist - b.dist; });

      for (var k = 0; k < candidates.length && n.connections < maxConn; k++) {
        var target = nodes[candidates[k].idx];
        if (target.connections >= MAX_CONNECTIONS) continue;

        var exists = false;
        for (var e = 0; e < edges.length; e++) {
          if ((edges[e].a === i && edges[e].b === candidates[k].idx) ||
              (edges[e].b === i && edges[e].a === candidates[k].idx)) {
            exists = true;
            break;
          }
        }
        if (exists) continue;

        var avgDepth = (n.depth + target.depth) / 2;
        edges.push({
          a: i,
          b: candidates[k].idx,
          opacity: 0.08 + avgDepth * 0.32,
          visible: false
        });
        n.connections++;
        target.connections++;
      }
    }
  }

  function assignWaves() {
    var cx = W / 2;
    var cy = H / 2;
    var maxDist = 0;
    nodes.forEach(function(n) {
      var d = Math.sqrt((n.x - cx) * (n.x - cx) + (n.y - cy) * (n.y - cy));
      if (d > maxDist) maxDist = d;
    });
    nodes.forEach(function(n) {
      var d = Math.sqrt((n.x - cx) * (n.x - cx) + (n.y - cy) * (n.y - cy));
      n.spawnWave = d / maxDist;
    });
  }

  function buildTextPath() {
    if (textPoints.length < 2) return;
    var sorted = textPoints.slice().sort(function(a, b) {
      return a.x === b.x ? a.y - b.y : a.x - b.x;
    });
    var step = Math.max(1, Math.floor(sorted.length / 80));
    var sampled = [];
    for (var i = 0; i < sorted.length; i += step) {
      sampled.push(sorted[i]);
    }
    pathSegments = sampled;
  }

  generateNodes();
  generateEdges();
  assignWaves();
  buildTextPath();

  function render(timestamp) {
    var elapsed = timestamp - startTime;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    if (elapsed < 500) {
      requestAnimationFrame(render);
      return;
    }

    if (elapsed >= 500 && elapsed < 1000) {
      var t = (elapsed - 500) / 500;
      var cx = W / 2;
      var cy = H / 2;
      var bloomR = 20 * t;
      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
      grad.addColorStop(0, 'rgba(255,255,255,' + (0.3 * t) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,' + t + ')';
      ctx.beginPath();
      ctx.arc(cx, cy, 3 * t, 0, Math.PI * 2);
      ctx.fill();
    }

    var networkStart = 1000;
    var networkEnd = 3500;
    var networkProgress = Math.max(0, Math.min(1, (elapsed - networkStart) / (networkEnd - networkStart)));

    if (elapsed >= networkStart) {
      nodes.forEach(function(n) {
        if (n.spawnWave <= networkProgress) {
          n.visible = true;
        }
      });
      edges.forEach(function(e) {
        if (nodes[e.a].visible && nodes[e.b].visible) {
          e.visible = true;
        }
      });
    }

    edges.forEach(function(e) {
      if (!e.visible) return;
      var na = nodes[e.a];
      var nb = nodes[e.b];
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = 'rgba(255,255,255,' + e.opacity + ')';
      ctx.lineWidth = 0.5 + e.opacity * 0.5;
      ctx.stroke();
    });

    nodes.forEach(function(n) {
      if (!n.visible) return;
      var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.bloomR);
      grad.addColorStop(0, 'rgba(255,255,255,0.3)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.bloomR, 0, Math.PI * 2);
      ctx.fill();
    });

    nodes.forEach(function(n) {
      if (!n.visible) return;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.coreR, 0, Math.PI * 2);
      ctx.fill();
    });

    var pathStart = 2000;
    var pathEnd = 4500;
    if (elapsed >= pathStart && pathSegments.length > 1) {
      var pathProgress = Math.min(1, (elapsed - pathStart) / (pathEnd - pathStart));
      var revealCount = Math.floor(pathProgress * pathSegments.length);

      ctx.beginPath();
      ctx.moveTo(pathSegments[0].x, pathSegments[0].y);
      for (var i = 1; i < revealCount && i < pathSegments.length; i++) {
        ctx.lineTo(pathSegments[i].x, pathSegments[i].y);
      }
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      for (var j = 0; j < revealCount && j < pathSegments.length; j++) {
        var pt = pathSegments[j];
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fill();

        var glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 10);
        glow.addColorStop(0, 'rgba(255,255,255,0.4)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (elapsed >= 5000) {
      var fadeT = Math.min(1, (elapsed - 5000) / 500);
      overlay.style.opacity = 1 - fadeT;
      if (fadeT >= 1) {
        sessionStorage.setItem('sg-intro-played', '1');
        overlay.remove();
        return;
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

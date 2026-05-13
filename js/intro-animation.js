function initIntroAnimation() {
  var overlay = document.getElementById('sg-intro-overlay');
  var canvas = document.getElementById('sg-intro-canvas');
  if (!overlay || !canvas) return;

  var ctx = canvas.getContext('2d');
  var W = window.innerWidth;
  var H = window.innerHeight;
  var dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  var textMask = buildTextMask(W, H);
  var nodes = [];
  var edges = [];
  var dijkstraPath = [];
  var startTime = performance.now();

  var NODE_COUNT = 150;
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
        visible: false,
        bloomPulse: 0
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

  function buildDijkstraPath() {
    if (nodes.length < 2) return;

    var startIdx = 0;
    var endIdx = 0;
    var minStartDist = Infinity;
    var minEndDist = Infinity;

    for (var i = 0; i < nodes.length; i++) {
      var dStart = Math.sqrt(nodes[i].x * nodes[i].x + nodes[i].y * nodes[i].y);
      var dEnd = Math.sqrt((nodes[i].x - W) * (nodes[i].x - W) + (nodes[i].y - H) * (nodes[i].y - H));
      if (dStart < minStartDist) { minStartDist = dStart; startIdx = i; }
      if (dEnd < minEndDist) { minEndDist = dEnd; endIdx = i; }
    }

    var adj = [];
    for (var i = 0; i < nodes.length; i++) adj.push([]);
    edges.forEach(function(e, idx) {
      var dx = nodes[e.a].x - nodes[e.b].x;
      var dy = nodes[e.a].y - nodes[e.b].y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      adj[e.a].push({ node: e.b, dist: dist, edge: idx });
      adj[e.b].push({ node: e.a, dist: dist, edge: idx });
    });

    var dist = [];
    var prev = [];
    var prevEdge = [];
    var visited = [];
    for (var i = 0; i < nodes.length; i++) {
      dist.push(Infinity);
      prev.push(-1);
      prevEdge.push(-1);
      visited.push(false);
    }
    dist[startIdx] = 0;

    for (var step = 0; step < nodes.length; step++) {
      var u = -1;
      var minD = Infinity;
      for (var i = 0; i < nodes.length; i++) {
        if (!visited[i] && dist[i] < minD) {
          minD = dist[i];
          u = i;
        }
      }
      if (u === -1) break;
      visited[u] = true;

      adj[u].forEach(function(neighbor) {
        var alt = dist[u] + neighbor.dist;
        if (alt < dist[neighbor.node]) {
          dist[neighbor.node] = alt;
          prev[neighbor.node] = u;
          prevEdge[neighbor.node] = neighbor.edge;
        }
      });
    }

    var path = [];
    var cur = endIdx;
    while (cur !== -1 && cur !== startIdx) {
      path.push({ node: cur, edge: prevEdge[cur] });
      cur = prev[cur];
    }
    if (cur === startIdx) {
      path.push({ node: startIdx, edge: -1 });
    }
    path.reverse();
    dijkstraPath = path;
  }

  generateNodes();
  generateEdges();
  assignWaves();
  buildDijkstraPath();

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

    var djStart = 2000;
    var djEnd = 4500;
    if (elapsed >= djStart && dijkstraPath.length > 1) {
      var djProgress = Math.min(1, (elapsed - djStart) / (djEnd - djStart));
      var pathLen = dijkstraPath.length;
      var revealCount = Math.floor(djProgress * pathLen);

      for (var i = 0; i < revealCount && i < pathLen - 1; i++) {
        var edgeIdx = dijkstraPath[i + 1].edge;
        if (edgeIdx < 0) continue;
        var e = edges[edgeIdx];
        var na = nodes[e.a];
        var nb = nodes[e.b];

        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        var nodeIdx = dijkstraPath[i].node;
        var pn = nodes[nodeIdx];
        var pulseR = pn.bloomR * (1 + 0.1 * Math.sin(elapsed * 0.005));
        var grad = ctx.createRadialGradient(pn.x, pn.y, 0, pn.x, pn.y, pulseR);
        grad.addColorStop(0, 'rgba(255,255,255,0.5)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pn.x, pn.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (elapsed >= 4500 && elapsed < 5000) {
      var breathT = Math.sin(elapsed * 0.006) * 0.1;
      nodes.forEach(function(n) {
        if (!n.visible) return;
        n.bloomPulse = breathT;
      });
    }

    if (elapsed >= 5000) {
      var fadeT = Math.min(1, (elapsed - 5000) / 500);
      overlay.style.opacity = 1 - fadeT;
      if (fadeT >= 1) {
        overlay.remove();
        return;
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

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

  var LETTER_DEFS = {
    S: [[1,0],[0,0],[0,0.5],[1,0.5],[1,1],[0,1]],
    I: [[0.5,0],[0.5,1]],
    G: [[1,0],[0,0],[0,1],[1,1],[1,0.5],[0.5,0.5]],
    N: [[0,1],[0,0],[1,1],[1,0]],
    L: [[0,0],[0,1],[1,1]],
    O: [[0,0],[1,0],[1,1],[0,1],[0,0]],
    _S2: [[1,0],[0,0],[0,0.5],[1,0.5],[1,1],[0,1]]
  };

  var WORD = ['S','I','G','N','G','L','O','S','S'];

  var BG_NODE_COUNT = 120;
  var bgNodes = [];
  var bgEdges = [];

  var letterScale = Math.min(W * 0.08, 80);
  var letterGap = letterScale * 0.4;
  var totalWidth = WORD.length * letterScale + (WORD.length - 1) * letterGap;
  var startX = (W - totalWidth) / 2;
  var startY = (H - letterScale) / 2;

  var letters = [];

  for (var li = 0; li < WORD.length; li++) {
    var ch = WORD[li];
    var def = LETTER_DEFS[ch] || LETTER_DEFS['_S2'];
    var ox = startX + li * (letterScale + letterGap);
    var oy = startY;
    var pts = [];
    var totalLen = 0;

    for (var pi = 0; pi < def.length; pi++) {
      var px = ox + def[pi][0] * letterScale;
      var py = oy + def[pi][1] * letterScale;
      pts.push({ x: px, y: py });
      if (pi > 0) {
        var dx = pts[pi].x - pts[pi - 1].x;
        var dy = pts[pi].y - pts[pi - 1].y;
        totalLen += Math.sqrt(dx * dx + dy * dy);
      }
    }

    letters.push({
      points: pts,
      totalLength: totalLen,
      drawn: 0
    });
  }

  function generateBgNodes() {
    for (var i = 0; i < BG_NODE_COUNT; i++) {
      bgNodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1 + Math.random() * 1.5,
        bloomR: 6 + Math.random() * 6,
        depth: 0.2 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15
      });
    }
  }

  function generateBgEdges() {
    bgEdges = [];
    for (var i = 0; i < bgNodes.length; i++) {
      for (var j = i + 1; j < bgNodes.length; j++) {
        var dx = bgNodes[j].x - bgNodes[i].x;
        var dy = bgNodes[j].y - bgNodes[i].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          bgEdges.push({ a: i, b: j, dist: dist });
        }
      }
    }
  }

  generateBgNodes();
  generateBgEdges();

  var startTime = performance.now();
  var PHASE_BG = 800;
  var PHASE_DOTS = 1500;
  var PHASE_TRACE_START = 2000;
  var TRACE_PER_LETTER = 400;
  var TOTAL_TRACE = PHASE_TRACE_START + WORD.length * TRACE_PER_LETTER;
  var HOLD_END = TOTAL_TRACE + 2000;
  var FADE_END = HOLD_END + 500;

  function drawBg(elapsed) {
    var bgAlpha = Math.min(1, elapsed / PHASE_BG);

    bgNodes.forEach(function(n) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    if (elapsed > 300) generateBgEdges();

    bgEdges.forEach(function(e) {
      var na = bgNodes[e.a];
      var nb = bgNodes[e.b];
      var op = (1 - e.dist / 150) * 0.12 * bgAlpha;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = 'rgba(255,255,255,' + op + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    bgNodes.forEach(function(n) {
      var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.bloomR);
      grad.addColorStop(0, 'rgba(255,255,255,' + (0.15 * bgAlpha) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.bloomR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * bgAlpha) + ')';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawLetterDots(elapsed) {
    if (elapsed < PHASE_DOTS) return;
    var dotAlpha = Math.min(1, (elapsed - PHASE_DOTS) / 500);

    letters.forEach(function(letter) {
      letter.points.forEach(function(pt) {
        var grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 14);
        grad.addColorStop(0, 'rgba(255,255,255,' + (0.5 * dotAlpha) + ')');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,' + dotAlpha + ')';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  function drawLetterTraces(elapsed) {
    if (elapsed < PHASE_TRACE_START) return;

    for (var li = 0; li < letters.length; li++) {
      var letterStart = PHASE_TRACE_START + li * TRACE_PER_LETTER;
      if (elapsed < letterStart) continue;

      var letter = letters[li];
      var t = Math.min(1, (elapsed - letterStart) / TRACE_PER_LETTER);
      var pts = letter.points;
      if (pts.length < 2) continue;

      var targetLen = t * letter.totalLength;
      var accum = 0;

      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,0.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      for (var i = 1; i < pts.length; i++) {
        var dx = pts[i].x - pts[i - 1].x;
        var dy = pts[i].y - pts[i - 1].y;
        var segLen = Math.sqrt(dx * dx + dy * dy);

        if (accum + segLen <= targetLen) {
          ctx.lineTo(pts[i].x, pts[i].y);
          accum += segLen;
        } else {
          var remain = targetLen - accum;
          var ratio = remain / segLen;
          var ix = pts[i - 1].x + dx * ratio;
          var iy = pts[i - 1].y + dy * ratio;
          ctx.lineTo(ix, iy);
          break;
        }
      }

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      accum = 0;
      for (var i = 1; i < pts.length; i++) {
        var dx = pts[i].x - pts[i - 1].x;
        var dy = pts[i].y - pts[i - 1].y;
        var segLen = Math.sqrt(dx * dx + dy * dy);
        if (accum + segLen <= targetLen) {
          ctx.lineTo(pts[i].x, pts[i].y);
          accum += segLen;
        } else {
          var remain = targetLen - accum;
          var ratio = remain / segLen;
          ctx.lineTo(pts[i - 1].x + dx * ratio, pts[i - 1].y + dy * ratio);
          break;
        }
      }
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }

  function render(timestamp) {
    var elapsed = timestamp - startTime;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    drawBg(elapsed);
    drawLetterDots(elapsed);
    drawLetterTraces(elapsed);

    if (elapsed >= HOLD_END) {
      var fadeT = Math.min(1, (elapsed - HOLD_END) / 500);
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

const LABELS = buildLabels();

function buildLabels() {
  const labels = ['<blank>'];
  for (let i = 0; i < 600; i++) {
    labels.push('GLOSS_' + i);
  }
  return labels;
}

export function ctcGreedyDecode(outputFloat32, timeSteps, numClasses) {
  const indices = [];

  for (let t = 0; t < timeSteps; t++) {
    let maxIdx = 0;
    let maxVal = outputFloat32[t * numClasses];
    for (let c = 1; c < numClasses; c++) {
      const val = outputFloat32[t * numClasses + c];
      if (val > maxVal) {
        maxVal = val;
        maxIdx = c;
      }
    }
    indices.push(maxIdx);
  }

  const collapsed = [];
  let prev = -1;
  for (const idx of indices) {
    if (idx !== 0 && idx !== prev) {
      collapsed.push(idx);
    }
    prev = idx;
  }

  const glosses = collapsed.map(idx => LABELS[idx] || 'UNKNOWN');

  let totalConf = 0;
  let confCount = 0;
  for (let t = 0; t < timeSteps; t++) {
    let maxVal = -Infinity;
    let sumExp = 0;
    for (let c = 0; c < numClasses; c++) {
      const val = outputFloat32[t * numClasses + c];
      if (val > maxVal) maxVal = val;
    }
    for (let c = 0; c < numClasses; c++) {
      sumExp += Math.exp(outputFloat32[t * numClasses + c] - maxVal);
    }
    let maxIdx = 0;
    let maxV = outputFloat32[t * numClasses];
    for (let c = 1; c < numClasses; c++) {
      if (outputFloat32[t * numClasses + c] > maxV) {
        maxV = outputFloat32[t * numClasses + c];
        maxIdx = c;
      }
    }
    const prob = Math.exp(maxV - maxVal) / sumExp;
    if (maxIdx !== 0) {
      totalConf += prob;
      confCount++;
    }
  }

  const confidence = confCount > 0 ? totalConf / confCount : 0;

  return { glosses, confidence };
}

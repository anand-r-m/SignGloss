importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');

const POSITION_FEATURES = 78;
const TOTAL_FEATURES = 156;
const WINDOW_SIZE = 64;
const HOP_SIZE = 48;
const OVERLAP = 16;
const NUM_CLASSES = 601;

let session = null;
let buffer = [];
let prevFrame = null;
let frameCount = 0;
let lastProgressUpdate = 0;

function buildLabels() {
  const labels = ['<blank>'];
  for (let i = 0; i < 600; i++) {
    labels.push('GLOSS_' + i);
  }
  return labels;
}

const LABELS = buildLabels();

function ctcGreedyDecode(outputData, timeSteps, numClasses) {
  const indices = [];
  for (let t = 0; t < timeSteps; t++) {
    let maxIdx = 0;
    let maxVal = outputData[t * numClasses];
    for (let c = 1; c < numClasses; c++) {
      const val = outputData[t * numClasses + c];
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
    for (let c = 0; c < numClasses; c++) {
      const val = outputData[t * numClasses + c];
      if (val > maxVal) maxVal = val;
    }
    let sumExp = 0;
    for (let c = 0; c < numClasses; c++) {
      sumExp += Math.exp(outputData[t * numClasses + c] - maxVal);
    }
    let topIdx = 0;
    let topVal = outputData[t * numClasses];
    for (let c = 1; c < numClasses; c++) {
      if (outputData[t * numClasses + c] > topVal) {
        topVal = outputData[t * numClasses + c];
        topIdx = c;
      }
    }
    const prob = Math.exp(topVal - maxVal) / sumExp;
    if (topIdx !== 0) {
      totalConf += prob;
      confCount++;
    }
  }

  return {
    glosses,
    confidence: confCount > 0 ? totalConf / confCount : 0
  };
}

function computeVelocity(current, previous) {
  const features = new Float32Array(TOTAL_FEATURES);
  for (let i = 0; i < POSITION_FEATURES; i++) {
    features[i] = current[i];
  }
  if (previous) {
    for (let i = 0; i < POSITION_FEATURES; i++) {
      features[POSITION_FEATURES + i] = current[i] - previous[i];
    }
  }
  return features;
}

async function loadModel(modelPath) {
  try {
    self.postMessage({ type: 'STATUS', status: 'loading' });
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all'
    });
    self.postMessage({ type: 'STATUS', status: 'ready' });
  } catch (err) {
    self.postMessage({ type: 'STATUS', status: 'error' });
    self.postMessage({ type: 'ERROR', message: 'Model load failed: ' + err.message });
  }
}

async function runInference() {
  if (!session || buffer.length < WINDOW_SIZE) return;

  const inputData = new Float32Array(WINDOW_SIZE * TOTAL_FEATURES);
  for (let i = 0; i < WINDOW_SIZE; i++) {
    inputData.set(buffer[i], i * TOTAL_FEATURES);
  }

  const startTime = performance.now();

  try {
    const tensor = new ort.Tensor('float32', inputData, [1, WINDOW_SIZE, TOTAL_FEATURES]);
    const inputName = session.inputNames[0];
    const feeds = {};
    feeds[inputName] = tensor;

    const results = await session.run(feeds);
    const outputName = session.outputNames[0];
    const outputData = results[outputName].data;

    const inferenceTime = performance.now() - startTime;

    const { glosses, confidence } = ctcGreedyDecode(outputData, WINDOW_SIZE, NUM_CLASSES);

    self.postMessage({
      type: 'GLOSS_RESULT',
      glosses,
      confidence,
      inferenceTimeMs: Math.round(inferenceTime)
    });

    buffer = buffer.slice(buffer.length - OVERLAP);

  } catch (err) {
    self.postMessage({ type: 'ERROR', message: 'Inference failed: ' + err.message });
  }
}

function handleFrame(landmarks) {
  const features = computeVelocity(landmarks, prevFrame);
  prevFrame = new Float32Array(landmarks);
  buffer.push(features);
  frameCount++;

  const now = performance.now();
  if (now - lastProgressUpdate > 100) {
    const fill = Math.min(buffer.length / WINDOW_SIZE, 1);
    self.postMessage({ type: 'BUFFER_PROGRESS', fill });
    lastProgressUpdate = now;
  }

  if (buffer.length >= WINDOW_SIZE) {
    runInference();
  }
}

function resetState() {
  buffer = [];
  prevFrame = null;
  frameCount = 0;
  self.postMessage({ type: 'BUFFER_PROGRESS', fill: 0 });
}

self.onmessage = function(e) {
  const { type, data, modelPath } = e.data;

  switch (type) {
    case 'LOAD_MODEL':
      loadModel(modelPath);
      break;
    case 'FRAME':
      handleFrame(data);
      break;
    case 'RESET':
      resetState();
      break;
  }
};

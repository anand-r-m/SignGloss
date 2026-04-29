const GLOSS_LABELS: string[] = [
  "<blank>",
  ...Array.from({ length: 600 }, (_, i) => `GLOSS_${i}`),
];

export interface DecodedResult {
  glosses: string[];
  rawIndices: number[];
  confidence: number;
}

export function ctcGreedyDecode(
  output: Float32Array,
  numTimeSteps: number = 64,
  numClasses: number = 601
): DecodedResult {
  const BLANK_INDEX = 0;
  const rawIndices: number[] = [];
  let totalConfidence = 0;

  for (let t = 0; t < numTimeSteps; t++) {
    let maxIdx = 0;
    let maxVal = -Infinity;
    const offset = t * numClasses;

    for (let c = 0; c < numClasses; c++) {
      if (output[offset + c] > maxVal) {
        maxVal = output[offset + c];
        maxIdx = c;
      }
    }

    rawIndices.push(maxIdx);
    totalConfidence += maxVal;
  }

  const collapsed: number[] = [];
  let prevIdx = -1;

  for (const idx of rawIndices) {
    if (idx === BLANK_INDEX) {
      prevIdx = -1;
      continue;
    }
    if (idx !== prevIdx) {
      collapsed.push(idx);
    }
    prevIdx = idx;
  }

  const glosses = collapsed.map((idx) =>
    idx < GLOSS_LABELS.length ? GLOSS_LABELS[idx] : `UNKNOWN_${idx}`
  );

  return {
    glosses,
    rawIndices: collapsed,
    confidence: totalConfidence / numTimeSteps,
  };
}

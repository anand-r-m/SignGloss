import { LANDMARK_COUNT, COORDS, POSITION_FEATURES } from './contract.js';

const HAND_SUBSET = [0, 2, 4, 5, 8, 9, 12, 13, 16, 17, 20];
const POSE_SUBSET = [11, 12, 13, 14];

const VISION_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

let handLandmarker = null;
let poseLandmarker = null;
let visionModule = null;

async function loadVisionModule() {
  if (visionModule) return visionModule;
  const mod = await import(VISION_CDN + '/vision_bundle.mjs');
  visionModule = mod;
  return visionModule;
}

export async function initMediaPipe() {
  const { FilesetResolver, HandLandmarker, PoseLandmarker } = await loadVisionModule();

  const wasmFileset = await FilesetResolver.forVisionTasks(
    VISION_CDN + '/wasm'
  );

  handLandmarker = await HandLandmarker.createFromOptions(wasmFileset, {
    baseOptions: {
      modelAssetPath: VISION_CDN + '/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
  });

  poseLandmarker = await PoseLandmarker.createFromOptions(wasmFileset, {
    baseOptions: {
      modelAssetPath: VISION_CDN + '/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
  });

  return true;
}

let lastMpTimestamp = 0;

export function processFrame(videoElement, timestampMs) {
  const safeTimestamp = Math.max(Math.round(timestampMs), lastMpTimestamp + 1);
  lastMpTimestamp = safeTimestamp;

  const landmarks = new Float32Array(POSITION_FEATURES);
  landmarks.fill(0);

  let handResults = null;
  let poseResults = null;
  let leftHand = null;
  let rightHand = null;

  if (handLandmarker) {
    handResults = handLandmarker.detectForVideo(videoElement, safeTimestamp);

    if (handResults.landmarks && handResults.landmarks.length > 0) {
      for (let i = 0; i < handResults.landmarks.length; i++) {
        const handedness = handResults.handedness[i][0].categoryName;
        if (handedness === 'Left' && !leftHand) {
          leftHand = handResults.landmarks[i];
        } else if (handedness === 'Right' && !rightHand) {
          rightHand = handResults.landmarks[i];
        }
      }
    }
  }

  if (leftHand) {
    for (let i = 0; i < HAND_SUBSET.length; i++) {
      const lm = leftHand[HAND_SUBSET[i]];
      const offset = i * COORDS;
      landmarks[offset] = lm.x;
      landmarks[offset + 1] = lm.y;
      landmarks[offset + 2] = lm.z;
    }
  }

  if (rightHand) {
    for (let i = 0; i < HAND_SUBSET.length; i++) {
      const lm = rightHand[HAND_SUBSET[i]];
      const offset = (11 + i) * COORDS;
      landmarks[offset] = lm.x;
      landmarks[offset + 1] = lm.y;
      landmarks[offset + 2] = lm.z;
    }
  }

  if (poseLandmarker) {
    poseResults = poseLandmarker.detectForVideo(videoElement, safeTimestamp);

    if (poseResults.landmarks && poseResults.landmarks.length > 0) {
      const pose = poseResults.landmarks[0];
      for (let i = 0; i < POSE_SUBSET.length; i++) {
        const lm = pose[POSE_SUBSET[i]];
        const offset = (22 + i) * COORDS;
        landmarks[offset] = lm.x;
        landmarks[offset + 1] = lm.y;
        landmarks[offset + 2] = lm.z;
      }
    }
  }

  return { landmarks, handResults, poseResults };
}

export function isReady() {
  return handLandmarker !== null && poseLandmarker !== null;
}

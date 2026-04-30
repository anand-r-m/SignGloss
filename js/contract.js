export const LANDMARK_COUNT = 26;
export const COORDS = 3;
export const POSITION_FEATURES = 78;
export const TOTAL_FEATURES = 156;
export const WINDOW_SIZE = 64;
export const HOP_SIZE = 48;
export const OVERLAP = 16;
export const NUM_CLASSES = 601;
export const TARGET_FPS = 30;
export const MODEL_PATH = 'models/signgloss_stub.onnx';

export const Pipeline = {
  onLandmarks: null,
  onGlossResult: null,
  onBufferProgress: null,
  onStatusChange: null,
  onError: null,
};

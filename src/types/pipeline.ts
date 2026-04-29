export const LANDMARK_SIZE = 78;
export const FEATURE_SIZE = 156;
export const WINDOW_SIZE = 64;
export const HOP_SIZE = 48;
export const NUM_CLASSES = 601;

export interface FramePayload {
  frameId: number;
  timestamp: number;
  landmarks: Float32Array;
}

export interface WorkerInMessage {
  type: "frame" | "reset";
  payload?: FramePayload;
}

export interface GlossResult {
  tokens: string[];
  confidence: number;
  inferenceTimeMs: number;
  bufferFill: number;
}

export interface WorkerOutMessage {
  type: "result" | "status" | "error";
  payload: GlossResult | { message: string };
}

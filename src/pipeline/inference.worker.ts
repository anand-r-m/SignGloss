import * as ort from "onnxruntime-web";
import { ctcGreedyDecode } from "./glossDecoder";

const WINDOW_SIZE = 64;
const OVERLAP = 16;
const POS_FEATURES = 78;
const TOTAL_FEATURES = 156;
const NUM_CLASSES = 601;

let session: ort.InferenceSession | null = null;
let buffer = new Float32Array(WINDOW_SIZE * TOTAL_FEATURES);
let frameCount = 0;
let prevFrame: Float32Array | null = null;

self.onmessage = async (event: MessageEvent) => {
  const { type, data } = event.data;

  switch (type) {
    case "LOAD_MODEL":
      await handleLoadModel(data.modelPath);
      break;
    case "FRAME":
      await handleFrame(new Float32Array(data));
      break;
    case "RESET":
      handleReset();
      break;
  }
};

async function handleLoadModel(modelPath: string) {
  try {
    self.postMessage({ type: "STATUS", status: "loading" });

    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["wasm"],
    });

    const warmupInput = new ort.Tensor(
      "float32",
      new Float32Array(1 * WINDOW_SIZE * TOTAL_FEATURES),
      [1, WINDOW_SIZE, TOTAL_FEATURES]
    );
    await session.run({ input: warmupInput });

    self.postMessage({ type: "STATUS", status: "ready" });
  } catch (err: any) {
    const message = err.message?.includes("404")
      ? `Model file not found at ${modelPath}.`
      : err.message?.includes("protobuf")
        ? "Invalid ONNX model file."
        : `Failed to load model: ${err.message}`;

    self.postMessage({ type: "ERROR", error: message });
  }
}

async function handleFrame(positionFrame: Float32Array) {
  const velocity = new Float32Array(POS_FEATURES);
  if (prevFrame) {
    for (let i = 0; i < POS_FEATURES; i++) {
      velocity[i] = positionFrame[i] - prevFrame[i];
    }
  }
  prevFrame = positionFrame.slice();

  const combined = new Float32Array(TOTAL_FEATURES);
  combined.set(positionFrame, 0);
  combined.set(velocity, POS_FEATURES);

  buffer.set(combined, frameCount * TOTAL_FEATURES);
  frameCount++;

  self.postMessage({
    type: "BUFFER_PROGRESS",
    progress: frameCount / WINDOW_SIZE,
  });

  if (frameCount >= WINDOW_SIZE) {
    await runInference();
    slide();
  }
}

async function runInference() {
  if (!session) {
    self.postMessage({
      type: "ERROR",
      error: "Model not loaded. Cannot run inference.",
    });
    return;
  }

  try {
    const startTime = performance.now();

    const tensor = new ort.Tensor("float32", buffer.slice(), [
      1,
      WINDOW_SIZE,
      TOTAL_FEATURES,
    ]);
    const results = await session.run({ input: tensor });
    const outputTensor = results[Object.keys(results)[0]];
    const outputData = outputTensor.data as Float32Array;

    const decoded = ctcGreedyDecode(outputData, WINDOW_SIZE, NUM_CLASSES);
    const inferenceTime = performance.now() - startTime;

    self.postMessage({
      type: "GLOSS_RESULT",
      glosses: decoded.glosses,
      confidence: decoded.confidence,
      inferenceTimeMs: inferenceTime,
    });
  } catch (err: any) {
    self.postMessage({
      type: "ERROR",
      error: `Inference failed: ${err.message}`,
    });
  }
}

function slide() {
  const keepStart = (WINDOW_SIZE - OVERLAP) * TOTAL_FEATURES;
  const keep = buffer.slice(keepStart);
  buffer.fill(0);
  buffer.set(keep, 0);
  frameCount = OVERLAP;
}

function handleReset() {
  buffer.fill(0);
  frameCount = 0;
  prevFrame = null;
  self.postMessage({ type: "STATUS", status: "reset" });
}

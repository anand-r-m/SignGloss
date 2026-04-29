import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;

export async function loadModel(modelPath: string): Promise<void> {
  const startTime = performance.now();

  session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ["wasm"],
  });

  const loadTime = performance.now() - startTime;
  console.log(`[ModelLoader] Loaded in ${loadTime.toFixed(0)}ms`);

  await runInference(new Float32Array(1 * 64 * 156));
  console.log("[ModelLoader] Warmup complete");
}

export async function runInference(
  inputData: Float32Array
): Promise<Float32Array> {
  if (!session) throw new Error("Model not loaded");

  const tensor = new ort.Tensor("float32", inputData, [1, 64, 156]);
  const feeds = { input: tensor };
  const results = await session.run(feeds);

  const outputTensor = results[Object.keys(results)[0]];
  return outputTensor.data as Float32Array;
}

export function isModelLoaded(): boolean {
  return session !== null;
}

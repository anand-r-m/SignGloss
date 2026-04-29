export interface GlossResult {
  glosses: string[];
  confidence: number;
  inferenceTimeMs: number;
}

export type WorkerStatus = "loading" | "ready" | "reset" | "error";

interface WorkerCallbacks {
  onGlossResult: (result: GlossResult) => void;
  onStatusChange: (status: WorkerStatus) => void;
  onBufferProgress: (progress: number) => void;
  onError: (error: string) => void;
}

export class InferenceBridge {
  private worker: Worker;
  private callbacks: WorkerCallbacks;
  private restartCount = 0;
  private maxRestarts = 3;
  private lastModelPath = "";

  constructor(callbacks: WorkerCallbacks) {
    this.callbacks = callbacks;
    this.worker = this.createWorker();
  }

  private createWorker(): Worker {
    const worker = new Worker(
      new URL("./inference.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event) => {
      const { type } = event.data;
      switch (type) {
        case "GLOSS_RESULT":
          this.callbacks.onGlossResult({
            glosses: event.data.glosses,
            confidence: event.data.confidence,
            inferenceTimeMs: event.data.inferenceTimeMs,
          });
          break;
        case "STATUS":
          this.callbacks.onStatusChange(event.data.status);
          break;
        case "BUFFER_PROGRESS":
          this.callbacks.onBufferProgress(event.data.progress);
          break;
        case "ERROR":
          this.callbacks.onError(event.data.error);
          break;
      }
    };

    worker.onerror = (err) => {
      if (this.restartCount < this.maxRestarts) {
        this.restartCount++;
        this.worker.terminate();
        this.worker = this.createWorker();
        if (this.lastModelPath) {
          this.loadModel(this.lastModelPath);
        }
      } else {
        this.callbacks.onError(
          "Pipeline crashed repeatedly. Please refresh the page."
        );
      }
    };

    return worker;
  }

  loadModel(modelPath: string): void {
    this.lastModelPath = modelPath;
    this.worker.postMessage({ type: "LOAD_MODEL", data: { modelPath } });
  }

  sendFrame(landmarks: Float32Array): void {
    this.worker.postMessage(
      { type: "FRAME", data: landmarks },
      [landmarks.buffer]
    );
  }

  reset(): void {
    this.worker.postMessage({ type: "RESET" });
  }

  terminate(): void {
    this.worker.terminate();
  }
}

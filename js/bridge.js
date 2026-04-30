import { Pipeline, MODEL_PATH } from './contract.js';

export class InferenceBridge {
  constructor() {
    this.worker = null;
    this.restartCount = 0;
    this.maxRestarts = 3;
    this.isTerminated = false;
    this.createWorker();
  }

  createWorker() {
    this.worker = new Worker('js/inference-worker.js');

    this.worker.onmessage = (e) => {
      const msg = e.data;

      switch (msg.type) {
        case 'GLOSS_RESULT':
          if (Pipeline.onGlossResult) {
            Pipeline.onGlossResult(msg.glosses, msg.confidence, msg.inferenceTimeMs);
          }
          break;

        case 'BUFFER_PROGRESS':
          if (Pipeline.onBufferProgress) {
            Pipeline.onBufferProgress(msg.fill);
          }
          break;

        case 'STATUS':
          if (Pipeline.onStatusChange) {
            Pipeline.onStatusChange(msg.status);
          }
          break;

        case 'ERROR':
          if (Pipeline.onError) {
            Pipeline.onError(msg.message);
          }
          break;
      }
    };

    this.worker.onerror = (err) => {
      console.error('Worker error:', err.message);

      if (this.isTerminated) return;

      if (this.restartCount < this.maxRestarts) {
        this.restartCount++;
        if (Pipeline.onStatusChange) {
          Pipeline.onStatusChange('restarting');
        }
        this.worker.terminate();
        this.createWorker();
        this.loadModel();
      } else {
        if (Pipeline.onStatusChange) {
          Pipeline.onStatusChange('fatal');
        }
        if (Pipeline.onError) {
          Pipeline.onError('Worker crashed too many times. Please refresh the page.');
        }
      }
    };
  }

  loadModel(path) {
    const modelPath = new URL(path || MODEL_PATH, window.location.href).href;
    this.worker.postMessage({ type: 'LOAD_MODEL', modelPath });
  }

  sendFrame(landmarks) {
    const copy = new Float32Array(landmarks);
    this.worker.postMessage(
      { type: 'FRAME', data: copy },
      [copy.buffer]
    );
  }

  reset() {
    this.worker.postMessage({ type: 'RESET' });
  }

  terminate() {
    this.isTerminated = true;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

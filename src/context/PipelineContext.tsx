import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  InferenceBridge,
  type GlossResult,
  type WorkerStatus,
} from "../pipeline/workerBridge";

interface PipelineState {
  status: WorkerStatus | "idle";
  currentGloss: string[];
  confidence: number;
  bufferFill: number;
  inferenceTimeMs: number;
  errorMessage: string | null;
  history: { tokens: string[]; confidence: number; timestamp: number }[];
}

interface PipelineActions {
  initPipeline: (modelPath: string) => void;
  sendFrame: (landmarks: Float32Array) => void;
  reset: () => void;
  shutdown: () => void;
}

const PipelineCtx = createContext<(PipelineState & PipelineActions) | null>(
  null
);

export function PipelineProvider({ children }: { children: ReactNode }) {
  const bridgeRef = useRef<InferenceBridge | null>(null);
  const lastProgressUpdate = useRef(0);
  const [state, setState] = useState<PipelineState>({
    status: "idle",
    currentGloss: [],
    confidence: 0,
    bufferFill: 0,
    inferenceTimeMs: 0,
    errorMessage: null,
    history: [],
  });

  const initPipeline = useCallback((modelPath: string) => {
    if (bridgeRef.current) bridgeRef.current.terminate();

    bridgeRef.current = new InferenceBridge({
      onGlossResult: (result: GlossResult) => {
        setState((prev) => ({
          ...prev,
          currentGloss: result.glosses,
          confidence: result.confidence,
          inferenceTimeMs: result.inferenceTimeMs,
          history: [
            ...prev.history,
            {
              tokens: result.glosses,
              confidence: result.confidence,
              timestamp: Date.now(),
            },
          ],
        }));
      },
      onStatusChange: (s) =>
        setState((prev) => ({ ...prev, status: s, errorMessage: null })),
      onBufferProgress: (p) => {
        const now = Date.now();
        if (now - lastProgressUpdate.current > 100) {
          setState((prev) => ({ ...prev, bufferFill: p }));
          lastProgressUpdate.current = now;
        }
      },
      onError: (err) => {
        setState((prev) => ({
          ...prev,
          status: "error",
          errorMessage: err,
        }));
      },
    });

    bridgeRef.current.loadModel(modelPath);
  }, []);

  const sendFrame = useCallback((landmarks: Float32Array) => {
    bridgeRef.current?.sendFrame(landmarks);
  }, []);

  const reset = useCallback(() => {
    bridgeRef.current?.reset();
    setState((prev) => ({
      ...prev,
      currentGloss: [],
      confidence: 0,
      bufferFill: 0,
      errorMessage: null,
      history: [],
    }));
  }, []);

  const shutdown = useCallback(() => {
    bridgeRef.current?.terminate();
    bridgeRef.current = null;
    setState({
      status: "idle",
      currentGloss: [],
      confidence: 0,
      bufferFill: 0,
      inferenceTimeMs: 0,
      errorMessage: null,
      history: [],
    });
  }, []);

  return (
    <PipelineCtx.Provider
      value={{ ...state, initPipeline, sendFrame, reset, shutdown }}
    >
      {children}
    </PipelineCtx.Provider>
  );
}

export function usePipeline() {
  const ctx = useContext(PipelineCtx);
  if (!ctx)
    throw new Error("usePipeline must be used within PipelineProvider");
  return ctx;
}

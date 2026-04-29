interface MetricsBarProps {
  bufferFill: number;
  inferenceTimeMs: number;
  fps: number;
  modelStatus: "loading" | "ready" | "error" | "idle";
}

export default function MetricsBar({
  bufferFill,
  inferenceTimeMs,
  fps,
  modelStatus,
}: MetricsBarProps) {
  const statusColors: Record<string, string> = {
    loading: "text-yellow-400",
    ready: "text-green-400",
    error: "text-destructive",
    idle: "text-muted-foreground",
  };

  const dotColors: Record<string, string> = {
    loading: "bg-yellow-400 animate-pulse",
    ready: "bg-green-400",
    error: "bg-red-400",
    idle: "bg-muted-foreground",
  };

  return (
    <div className="glass p-4 flex flex-wrap items-center gap-6 text-xs">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotColors[modelStatus]}`} />
        <span className={statusColors[modelStatus]}>
          {modelStatus.charAt(0).toUpperCase() + modelStatus.slice(1)}
        </span>
      </div>

      <div className="flex-1 min-w-[120px]">
        <div className="flex justify-between mb-1">
          <span className="text-muted-foreground">Buffer</span>
          <span>{(bufferFill * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-150"
            style={{ width: `${bufferFill * 100}%` }}
          />
        </div>
      </div>

      <div className="text-muted-foreground">
        Inference:{" "}
        <span className="text-foreground font-mono">
          {inferenceTimeMs.toFixed(0)}ms
        </span>
      </div>

      <div className="text-muted-foreground">
        FPS: <span className="text-foreground font-mono">{fps}</span>
      </div>
    </div>
  );
}

interface GlossEntry {
  tokens: string[];
  confidence: number;
  timestamp: number;
}

interface GlossHistoryProps {
  history: GlossEntry[];
  maxEntries?: number;
}

export default function GlossHistory({
  history,
  maxEntries = 10,
}: GlossHistoryProps) {
  const visible = history.slice(-maxEntries).reverse();

  return (
    <div className="glass p-6">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        History
      </h3>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No predictions yet.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {visible.map((entry, i) => (
            <div
              key={entry.timestamp}
              className="flex items-center justify-between py-1.5 px-3 rounded-md bg-secondary/50 text-sm"
              style={{ opacity: 1 - i * 0.08 }}
            >
              <span className="font-medium">{entry.tokens.join(" ")}</span>
              <span className="text-xs text-muted-foreground">
                {(entry.confidence * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

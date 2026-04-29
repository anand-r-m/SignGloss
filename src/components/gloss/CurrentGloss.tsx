interface CurrentGlossProps {
  tokens: string[];
  confidence: number;
}

export default function CurrentGloss({ tokens, confidence }: CurrentGlossProps) {
  if (tokens.length === 0) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-muted-foreground text-sm italic">
          Waiting for signs...
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Current
        </span>
        <span className="text-xs text-muted-foreground">
          {(confidence * 100).toFixed(0)}% confidence
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tokens.map((token, i) => (
          <span
            key={`${token}-${i}`}
            className="px-4 py-2 rounded-lg bg-primary/15 text-primary font-semibold text-lg border border-primary/20"
          >
            {token}
          </span>
        ))}
      </div>
    </div>
  );
}

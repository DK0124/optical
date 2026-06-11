export function LoadingSpinner({ text = "載入中…" }: { text?: string }) {
  return (
    <div className="loading-page">
      <span className="spinner" />
      {text}
    </div>
  );
}

export function LoadingSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "16px",
            borderRadius: "6px",
            background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            width: i % 3 === 2 ? "60%" : "100%",
          }}
        />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

/** Screen title, one-line explanation, and an optional count pill on the right. */
export function PageHeader({ title, lede, stat, statTone = "neutral" }: { title: string; lede: string; stat?: string; statTone?: "neutral" | "ok" }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h1 className="page-title">{title}</h1>
        <p className="page-lede">{lede}</p>
      </div>
      {stat ? (
        <span
          className="chip chip--pill"
          style={
            statTone === "ok"
              ? { height: 28, color: "var(--ok-fg)", background: "var(--ok-soft)", borderColor: "var(--ok-border)" }
              : { height: 28, color: "var(--fg-4)", background: "var(--panel)", borderColor: "var(--border-2)" }
          }
        >
          <span className="chip__dot" aria-hidden />
          {stat}
        </span>
      ) : null}
    </div>
  );
}

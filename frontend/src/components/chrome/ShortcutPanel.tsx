"use client";

import { useIncidentStore } from "@/lib/store/useIncidentStore";

const GROUPS = [
  {
    title: "Moving around",
    rows: [
      { keys: ["Tab"], what: "Next control. The first stop is a skip-to-main-content link." },
      { keys: ["Shift", "Tab"], what: "Previous control." },
      { keys: ["←", "→"], what: "Switch screen, from anywhere on the page." },
      { keys: ["Alt", "1–6"], what: "Jump straight to Map, Dispatch Order, Manual Review, Archive, Resolved or Submit Image." },
    ],
  },
  {
    title: "Acting",
    rows: [
      { keys: ["Enter"], what: "Activate the focused control." },
      { keys: ["Space"], what: "Same as Enter." },
      { keys: ["Esc"], what: "Close this panel." },
    ],
  },
  { title: "Help", rows: [{ keys: ["?"], what: "Open or close this shortcut list." }] },
];

export function ShortcutPanel() {
  const keysOpen = useIncidentStore((s) => s.keysOpen);
  const setKeysOpen = useIncidentStore((s) => s.setKeysOpen);

  if (!keysOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgb(0 0 0 / 50%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 90,
      }}
      onClick={() => setKeysOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          maxWidth: "90vw",
          background: "var(--panel)",
          border: "1px solid var(--border-2)",
          boxShadow: "0 20px 60px var(--shadow-color)",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2
            style={{
              font: "600 14px/1 var(--font-plex-sans)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--fg)",
            }}
          >
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setKeysOpen(false)}
            aria-label="Close"
            style={{ font: "600 12px/1 var(--font-plex-mono)", color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>
        {GROUPS.map((group) => (
          <div key={group.title} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                font: "600 10px/1 var(--font-plex-mono)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              {group.title}
            </div>
            {group.rows.map((row) => (
              <div
                key={row.what}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div style={{ display: "flex", gap: 4, flex: "0 0 120px" }}>
                  {row.keys.map((k) => (
                    <kbd
                      key={k}
                      style={{
                        font: "600 10px/1 var(--font-plex-mono)",
                        color: "var(--fg)",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border-3)",
                        padding: "3px 6px",
                      }}
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
                <span style={{ font: "400 12.5px/1.4 var(--font-plex-sans)", color: "var(--fg-4)" }}>
                  {row.what}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { liveDispatched } from "@/lib/store/selectors";

export function Header() {
  const theme = useIncidentStore((s) => s.theme);
  const toggleTheme = useIncidentStore((s) => s.toggleTheme);
  const notesOn = useIncidentStore((s) => s.notesOn);
  const toggleNotes = useIncidentStore((s) => s.toggleNotes);
  const keysOpen = useIncidentStore((s) => s.keysOpen);
  const setKeysOpen = useIncidentStore((s) => s.setKeysOpen);
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const liveCount = liveDispatched(incidents, order).length;

  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const update = () =>
      setNow(new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      style={{
        height: 52,
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 0,
        background: "var(--bg-header)",
        borderBottom: "1px solid var(--border)",
        padding: "0 16px",
        color: "var(--header-fg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 16 }}>
        <div
          style={{
            width: 20,
            height: 20,
            background: "var(--header-accent)",
            flex: "none",
          }}
          aria-hidden
        />
        <span
          style={{
            font: "600 13px/1 var(--font-plex-mono)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Fori
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <div className="header-live" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {now ? (
          <span
            style={{
              font: "500 11px/1 var(--font-plex-mono)",
              color: "var(--muted)",
              borderRight: "1px solid var(--border-6)",
              paddingRight: 14,
            }}
          >
            {now} AEST
          </span>
        ) : null}
        {liveCount > 0 ? (
          <span
            style={{
              font: "600 10px/1 var(--font-plex-mono)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ok-fg)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRight: "1px solid var(--border-6)",
              paddingRight: 14,
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok-fg)" }}
            />
            {liveCount} LIVE
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 14 }}>
        <button
          type="button"
          onClick={toggleNotes}
          title="Toggle prototype change notes"
          style={{
            font: "600 10px/1 var(--font-plex-mono)",
            letterSpacing: "0.1em",
            color: notesOn ? "var(--accent)" : "var(--muted)",
            background: notesOn ? "var(--acc-08)" : "transparent",
            border: "1px solid var(--border-3)",
            padding: "6px 9px",
          }}
        >
          Δ {notesOn ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          onClick={() => setKeysOpen(!keysOpen)}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
          style={{
            font: "600 12px/1 var(--font-plex-mono)",
            color: "var(--muted)",
            border: "1px solid var(--border-3)",
            padding: "6px 9px",
          }}
        >
          ⌨
        </button>

        <div style={{ display: "flex", border: "1px solid var(--border-3)" }}>
          <button
            type="button"
            onClick={() => theme !== "dark" && toggleTheme()}
            style={{
              font: "600 10px/1 var(--font-plex-mono)",
              letterSpacing: "0.08em",
              padding: "6px 10px",
              background: theme === "dark" ? "var(--accent)" : "transparent",
              color: theme === "dark" ? "var(--on-accent)" : "var(--muted)",
            }}
          >
            DARK
          </button>
          <button
            type="button"
            onClick={() => theme !== "light" && toggleTheme()}
            style={{
              font: "600 10px/1 var(--font-plex-mono)",
              letterSpacing: "0.08em",
              padding: "6px 10px",
              background: theme === "light" ? "var(--accent)" : "transparent",
              color: theme === "light" ? "var(--on-accent)" : "var(--muted)",
            }}
          >
            LIGHT
          </button>
        </div>

        <div
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--surface-3)",
            border: "1px solid var(--border-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "600 10px/1 var(--font-plex-mono)",
            color: "var(--fg-4)",
            marginLeft: 4,
          }}
        >
          EC
        </div>
      </div>
    </header>
  );
}

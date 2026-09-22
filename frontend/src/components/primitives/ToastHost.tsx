"use client";

import { SeverityDot } from "@/components/primitives/SeverityDot";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

/** Fixed top-right, 5s auto-clear with a visible countdown, dismiss early with ✕. Non-blocking —
 * the page underneath stays fully interactive. */
export function ToastHost() {
  const toasts = useIncidentStore((s) => s.toasts);
  const dismissToast = useIncidentStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        top: 64,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          style={{
            position: "relative",
            maxWidth: 460,
            background: "var(--panel)",
            border: "1px solid var(--border-2)",
            borderLeft: `3px solid ${
              toast.severityBand === "not_a_fire" ? "var(--border-7)" : "var(--accent)"
            }`,
            padding: "14px 18px",
            boxShadow: "0 8px 30px var(--shadow-color)",
          }}
        >
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismissToast(toast.id)}
            style={{
              position: "absolute",
              top: -11,
              left: -11,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--panel)",
              border: "1px solid var(--border-2)",
              color: "var(--muted)",
              font: "400 11px/1 var(--font-plex-mono)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <SeverityDot band={toast.severityBand} size={33} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
              <div
                style={{
                  font: "600 11px/1.3 var(--font-plex-mono)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--fg)",
                }}
              >
                {toast.title}
              </div>
              <div style={{ font: "400 12.5px/1.4 var(--font-plex-sans)", color: "var(--muted)" }}>
                {toast.body}
              </div>
              {toast.cta !== "none" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 2 }}>
                  {toast.cta === "undo" && toast.onUndo ? (
                    <button
                      type="button"
                      onClick={() => {
                        toast.onUndo?.();
                        dismissToast(toast.id);
                      }}
                      style={{
                        font: "600 10px/1 var(--font-plex-mono)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                      }}
                    >
                      Undo
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          {toast.cta !== "none" ? (
            <div style={{ marginTop: 10, height: 2, background: "var(--border-2)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "var(--accent)",
                  transformOrigin: "left",
                  animation: "toastBar 5s linear forwards",
                }}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

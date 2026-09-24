"use client";

import { SeverityDot } from "@/components/primitives/SeverityDot";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

/** Fixed top right, 5 s auto-clear with a visible countdown, dismiss early with the close button.
 * Non-blocking: the page underneath stays fully interactive. */
export function ToastHost() {
  const toasts = useIncidentStore((s) => s.toasts);
  const dismissToast = useIncidentStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        right: "var(--space-5)",
        top: 72,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="card"
          style={{
            position: "relative",
            width: 400,
            maxWidth: "calc(100vw - 32px)",
            padding: "var(--space-4)",
            boxShadow: "var(--shadow-pop)",
            overflow: "hidden",
            animation: "toastIn var(--dur) var(--ease)",
          }}
        >
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
            <SeverityDot band={toast.severityBand} size={32} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ font: "600 var(--text-sm)/1.35 var(--font-plex-sans)", color: "var(--fg)" }}>
                {toast.title}
              </span>
              <span className="caption">{toast.body}</span>
              {toast.cta === "undo" && toast.onUndo ? (
                <button
                  type="button"
                  className="btn btn--link"
                  style={{ alignSelf: "flex-start", marginTop: 6, fontSize: "var(--text-xs)" }}
                  onClick={() => {
                    toast.onUndo?.();
                    dismissToast(toast.id);
                  }}
                >
                  Undo
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className="icon-btn icon-btn--bare"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              style={{ width: 28, height: 28, marginTop: -4, marginRight: -6 }}
            >
              ✕
            </button>
          </div>
          {toast.cta !== "none" ? (
            <div
              aria-hidden
              style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "var(--surface-2)" }}
            >
              <div
                style={{
                  height: "100%",
                  background: "var(--grad-primary)",
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

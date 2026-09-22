"use client";

import { useEffect, type ReactNode } from "react";
import { Header } from "@/components/chrome/Header";
import { TabBar } from "@/components/chrome/TabBar";
import { ShortcutPanel } from "@/components/chrome/ShortcutPanel";
import { SkipLink } from "@/components/chrome/SkipLink";
import { ToastHost } from "@/components/primitives/ToastHost";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { useClock } from "@/lib/hooks/useClock";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const init = useIncidentStore((s) => s.init);
  const initialized = useIncidentStore((s) => s.initialized);

  useEffect(() => {
    init();
  }, [init]);

  useClock();
  useKeyboardShortcuts();

  return (
    <div
      style={{
        height: "100dvh",
        minHeight: "100vh",
        maxHeight: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <SkipLink />
      <Header />
      <TabBar />
      <main
        id="main"
        tabIndex={-1}
        style={{ flex: 1, overflow: "auto", outline: "none" }}
      >
        {initialized ? (
          children
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              font: "500 12px/1 var(--font-plex-mono)",
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Loading incident data…
          </div>
        )}
      </main>
      <ShortcutPanel />
      <ToastHost />
    </div>
  );
}

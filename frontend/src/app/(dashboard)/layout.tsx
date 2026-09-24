"use client";

import { useEffect, type ReactNode } from "react";
import { Header } from "@/components/chrome/Header";
import { ShortcutPanel } from "@/components/chrome/ShortcutPanel";
import { SkipLink } from "@/components/chrome/SkipLink";
import { ToastHost } from "@/components/primitives/ToastHost";
import { RouteSkeleton } from "@/components/primitives/RouteSkeleton";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { useClock } from "@/lib/hooks/useClock";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { useTrackLastTabPath } from "@/lib/hooks/useTrackLastTabPath";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const init = useIncidentStore((s) => s.init);
  const initialized = useIncidentStore((s) => s.initialized);
  const syncThemeFromDocument = useIncidentStore((s) => s.syncThemeFromDocument);

  useEffect(() => {
    syncThemeFromDocument();
    init();
  }, [init, syncThemeFromDocument]);

  useClock();
  useKeyboardShortcuts();
  useTrackLastTabPath();

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
      <main
        id="main"
        tabIndex={-1}
        style={{ flex: 1, overflow: "auto", outline: "none" }}
      >
        {initialized ? children : <RouteSkeleton />}
      </main>
      <ShortcutPanel />
      <ToastHost />
    </div>
  );
}

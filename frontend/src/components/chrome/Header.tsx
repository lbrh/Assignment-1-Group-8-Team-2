"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { liveDispatched, reviewQueue } from "@/lib/store/selectors";
import { TABS } from "@/lib/constants/nav";

export function Header() {
  const theme = useIncidentStore((s) => s.theme);
  const toggleTheme = useIncidentStore((s) => s.toggleTheme);
  const keysOpen = useIncidentStore((s) => s.keysOpen);
  const setKeysOpen = useIncidentStore((s) => s.setKeysOpen);
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const liveCount = liveDispatched(incidents, order).length;
  const flaggedCount = reviewQueue(incidents, order).length;

  const lastTabPath = useIncidentStore((s) => s.lastTabPath);
  const pathname = usePathname();
  // Incident Detail is reached by click-through, not a tab: whichever tab the user came from
  // stays marked as current there.
  const activeHref = pathname?.startsWith("/incident/") ? lastTabPath : pathname;

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
        position: "relative",
        zIndex: 20,
        height: 56,
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "0 var(--space-4)",
        background: "var(--bg-header)",
        backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }} aria-label="EMBERA home, map">
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-md)",
            background: "var(--grad-primary)",
            boxShadow: "var(--shadow-btn)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "700 15px/1 var(--font-plex-sans)",
            color: "var(--on-primary)",
          }}
        >
          E
        </span>
        <span
          style={{
            font: "700 var(--text-base)/1 var(--font-plex-sans)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--fg)",
          }}
        >
          EMBERA
        </span>
      </Link>

      <nav
        aria-label="Screens"
        style={{
          display: "flex",
          alignItems: "stretch",
          alignSelf: "stretch",
          flex: "0 1 auto",
          minWidth: 0,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        {TABS.map((tab) => {
          const active = activeHref === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              id={`tab-${tab.short.toLowerCase()}`}
              className="nav-tab chrome-tab"
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
              {tab.short === "Review" && flaggedCount > 0 ? (
                <span
                  className="chip chip--pill data"
                  aria-label={`${flaggedCount} waiting`}
                  style={{
                    height: 18,
                    padding: "0 7px",
                    fontSize: 11,
                    color: "var(--on-primary)",
                    background: "var(--grad-primary)",
                  }}
                >
                  {flaggedCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: "none" }}>
        {now ? (
          <span className="data" style={{ font: "500 var(--text-xs)/1 var(--font-plex-mono)", color: "var(--muted)" }}>
            {now} AEST
          </span>
        ) : null}
        {liveCount > 0 ? (
          <span
            className="chip chip--pill"
            style={{ color: "var(--ok-fg)", background: "var(--ok-soft)", borderColor: "var(--ok-border)" }}
          >
            <span className="chip__dot" aria-hidden />
            {liveCount} live
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flex: "none" }}>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setKeysOpen(!keysOpen)}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
          style={{ fontWeight: 700 }}
        >
          ?
        </button>

        <div className="seg" role="group" aria-label="Colour theme">
          <button type="button" className="seg__btn" aria-pressed={theme === "light"} onClick={() => theme !== "light" && toggleTheme()}>
            Light
          </button>
          <button type="button" className="seg__btn" aria-pressed={theme === "dark"} onClick={() => theme !== "dark" && toggleTheme()}>
            Dark
          </button>
        </div>

        <span
          aria-label="Signed in as Emergency Coordinator"
          role="img"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "600 12px/1 var(--font-plex-sans)",
            color: "var(--accent-fg)",
            marginLeft: 4,
          }}
        >
          EC
        </span>
      </div>
    </header>
  );
}

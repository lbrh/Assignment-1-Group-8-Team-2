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
  const notesOn = useIncidentStore((s) => s.notesOn);
  const toggleNotes = useIncidentStore((s) => s.toggleNotes);
  const keysOpen = useIncidentStore((s) => s.keysOpen);
  const setKeysOpen = useIncidentStore((s) => s.setKeysOpen);
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const liveCount = liveDispatched(incidents, order).length;
  const flaggedCount = reviewQueue(incidents, order).length;

  const lastTabPath = useIncidentStore((s) => s.lastTabPath);
  const pathname = usePathname();
  // Incident Detail is reached by click-through, not a tab — whichever tab the user came
  // from (map, dispatch order, ...) stays visually active there.
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
        height: 52,
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 0,
        background: "var(--bg-header)",
        borderBottom: "1px solid var(--header-border)",
        padding: "0 12px",
        color: "var(--header-fg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 12, flex: "none" }}>
        <div
          style={{
            width: 20,
            height: 20,
            background: "var(--header-accent)",
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "700 11px/1 var(--font-plex-mono)",
            color: "var(--header-on-accent)",
          }}
          aria-hidden
        >
          F
        </div>
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

      <nav
        role="tablist"
        aria-label="Screens"
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
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
              role="tab"
              aria-selected={active}
              id={`tab-${tab.short.toLowerCase()}`}
              className="chrome-tab"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flex: "none",
                whiteSpace: "nowrap",
                padding: "0 14px",
                height: "100%",
                font: "600 11px/1 var(--font-plex-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? "var(--header-fg)" : "var(--header-muted)",
                background: active ? "var(--header-surface)" : "transparent",
                boxShadow: active ? "inset 0 -2px 0 var(--header-accent)" : undefined,
              }}
            >
              {tab.label}
              {tab.short === "Review" && flaggedCount > 0 ? (
                <span
                  style={{
                    font: "700 9px/1 var(--font-plex-mono)",
                    color: "var(--header-accent)",
                    background: "var(--acc-12)",
                    border: "1px solid var(--header-accent)",
                    padding: "2px 5px",
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

      <div className="header-live" style={{ display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
        {now ? (
          <span
            style={{
              font: "500 11px/1 var(--font-plex-mono)",
              color: "var(--header-muted)",
              borderRight: "1px solid var(--header-border)",
              paddingRight: 10,
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
              color: "var(--header-ok-fg)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRight: "1px solid var(--header-border)",
              paddingRight: 10,
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--header-ok-fg)" }}
            />
            {liveCount} LIVE
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 10, flex: "none" }}>
        <button
          type="button"
          onClick={toggleNotes}
          title="Toggle prototype change notes"
          style={{
            font: "600 10px/1 var(--font-plex-mono)",
            letterSpacing: "0.1em",
            color: notesOn ? "var(--header-accent)" : "var(--header-muted)",
            background: notesOn ? "var(--acc-08)" : "transparent",
            border: "1px solid var(--header-border)",
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
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "700 11px/1 var(--font-plex-mono)",
            color: "var(--header-muted)",
            border: "1px solid var(--header-border)",
            padding: 0,
          }}
        >
          K
        </button>

        <div style={{ display: "flex", border: "1px solid var(--header-border)" }}>
          <button
            type="button"
            onClick={() => theme !== "dark" && toggleTheme()}
            style={{
              font: "600 10px/1 var(--font-plex-mono)",
              letterSpacing: "0.08em",
              padding: "6px 10px",
              background: theme === "dark" ? "var(--header-accent)" : "transparent",
              color: theme === "dark" ? "var(--header-on-accent)" : "var(--header-muted)",
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
              background: theme === "light" ? "var(--header-accent)" : "transparent",
              color: theme === "light" ? "var(--header-on-accent)" : "var(--header-muted)",
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
            background: "var(--header-surface)",
            border: "1px solid var(--header-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "600 10px/1 var(--font-plex-mono)",
            color: "var(--header-muted)",
            marginLeft: 4,
          }}
        >
          EC
        </div>
      </div>
    </header>
  );
}

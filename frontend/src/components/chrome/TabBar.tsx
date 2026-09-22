"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { reviewQueue } from "@/lib/store/selectors";

const TABS = [
  { href: "/", label: "Map", short: "Map" },
  { href: "/dispatch", label: "Dispatch Order", short: "Order" },
  { href: "/review", label: "Manual Review", short: "Review" },
  { href: "/archive", label: "Archive", short: "Archive" },
  { href: "/resolved", label: "Resolved", short: "Resolved" },
  { href: "/submit", label: "Submit Image", short: "Submit" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const flaggedCount = reviewQueue(incidents, order).length;

  // Incident Detail is reached by click-through, not a tab — Map stays visually active there.
  const activeHref = pathname?.startsWith("/incident/") ? "/" : pathname;

  return (
    <nav
      role="tablist"
      aria-label="Screens"
      style={{
        flex: "none",
        display: "flex",
        borderBottom: "1px solid var(--border)",
        background: "var(--panel)",
        overflow: "hidden",
      }}
    >
      {TABS.map((tab, i) => {
        const active = activeHref === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            id={`tab-${tab.short.toLowerCase()}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              padding: "0 14px",
              height: 40,
              font: "600 11px/1 var(--font-plex-mono)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: active ? "var(--fg)" : "var(--muted)",
              background: active ? "var(--surface-2)" : "transparent",
              borderRight: i < TABS.length - 1 ? "1px solid var(--border)" : "none",
              boxShadow: active ? "inset 0 -2px 0 var(--accent)" : undefined,
            }}
          >
            {tab.label}
            {tab.short === "Review" && flaggedCount > 0 ? (
              <span
                style={{
                  font: "700 9px/1 var(--font-plex-mono)",
                  color: "var(--accent)",
                  background: "var(--acc-12)",
                  border: "1px solid var(--accent-border)",
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
  );
}

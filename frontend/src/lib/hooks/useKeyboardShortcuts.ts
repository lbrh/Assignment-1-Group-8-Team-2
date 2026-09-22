"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

const ROUTES = ["/", "/dispatch", "/review", "/archive", "/resolved", "/submit"] as const;

/** Alt/Option+1-6 jump to a tab, ←/→ step between tabs, ? opens the shortcut panel, Esc closes
 * it — matches the redline's keyboard model (section: Geometry, spacing, motion > Focus). */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const keysOpen = useIncidentStore((s) => s.keysOpen);
  const setKeysOpen = useIncidentStore((s) => s.setKeysOpen);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        setKeysOpen(false);
        return;
      }
      if (typing) return;

      if (e.key === "?") {
        setKeysOpen(!keysOpen);
        return;
      }
      if (e.altKey && /^[1-6]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (ROUTES[idx]) router.push(ROUTES[idx]);
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const currentIdx = ROUTES.findIndex((r) => r === pathname);
        const base = currentIdx === -1 ? 0 : currentIdx;
        const nextIdx =
          e.key === "ArrowRight"
            ? Math.min(ROUTES.length - 1, base + 1)
            : Math.max(0, base - 1);
        router.push(ROUTES[nextIdx]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, pathname, keysOpen, setKeysOpen]);
}

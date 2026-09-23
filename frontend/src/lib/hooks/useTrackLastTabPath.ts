"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { isTabPath } from "@/lib/constants/nav";

/** Records the last top-level tab route visited. Click-through pages (incident detail) read
 * this to show the right tab as active and to send "back" to wherever the user came from,
 * instead of assuming Map. */
export function useTrackLastTabPath() {
  const pathname = usePathname();
  const setLastTabPath = useIncidentStore((s) => s.setLastTabPath);

  useEffect(() => {
    if (pathname && isTabPath(pathname)) setLastTabPath(pathname);
  }, [pathname, setLastTabPath]);
}

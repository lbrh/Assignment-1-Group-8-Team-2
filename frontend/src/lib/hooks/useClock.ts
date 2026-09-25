"use client";

import { useEffect } from "react";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

/** Ticks the store's single clockTick field every 10s so every relative-time display
 * ("N min ago") stays live without each row running its own interval. */
export function useClock() {
  const tickClock = useIncidentStore((s) => s.tickClock);
  useEffect(() => {
    const id = setInterval(tickClock, 10_000);
    return () => clearInterval(id);
  }, [tickClock]);
}

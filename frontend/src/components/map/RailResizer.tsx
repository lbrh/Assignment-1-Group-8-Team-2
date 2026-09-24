"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";

const DEFAULT_WIDTH = 384;
const MIN_WIDTH = 320;
const MAX_WIDTH = 1100;
const MIN_MAP_WIDTH = 320; // the map never gets squeezed below this
const STEP = 32;
const STORAGE_KEY = "embera.railWidth";

function clampWidth(width: number, containerWidth: number) {
  return Math.round(Math.max(MIN_WIDTH, Math.min(width, MAX_WIDTH, containerWidth - MIN_MAP_WIDTH)));
}

/** The incidents list's width, remembered per browser (a viewer convenience, fine to lose). */
export function useRailWidth() {
  const [width, setWidth] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      return saved >= MIN_WIDTH ? saved : DEFAULT_WIDTH;
    } catch {
      return DEFAULT_WIDTH;
    }
  });
  const save = (next: number) => {
    setWidth(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // storage blocked: the width still applies for this visit
    }
  };
  return [width, save] as const;
}

/** Drag handle between the map and the incidents list (the list sits to its right). Arrow keys
 * resize by 32px, Home/End jump to the limits, double-click resets. */
export function RailResizer({ width, onChange }: { width: number; onChange: (width: number) => void }) {
  const [dragging, setDragging] = useState(false);
  const containerWidth = (el: Element) => el.parentElement?.getBoundingClientRect().width ?? window.innerWidth;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const right = e.currentTarget.parentElement?.getBoundingClientRect().right ?? window.innerWidth;
    onChange(clampWidth(right - e.clientX, containerWidth(e.currentTarget)));
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const max = containerWidth(e.currentTarget);
    const next =
      e.key === "ArrowLeft" ? width + STEP :
      e.key === "ArrowRight" ? width - STEP :
      e.key === "Home" ? MIN_WIDTH :
      e.key === "End" ? MAX_WIDTH :
      null;
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation(); // arrows here resize, they don't switch tabs
    onChange(clampWidth(next, max));
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize incidents list"
      aria-valuenow={width}
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      tabIndex={0}
      className={dragging ? "rail-resizer is-dragging" : "rail-resizer"}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onDoubleClick={(e) => onChange(clampWidth(DEFAULT_WIDTH, containerWidth(e.currentTarget)))}
      onKeyDown={onKeyDown}
    />
  );
}

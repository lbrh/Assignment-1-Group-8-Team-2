import type { SeverityBand } from "@/lib/types";

/** Team-confirmed: applied to the aggregated confidence_score (min() across indicators). */
export const CONFIDENCE_THRESHOLD = 0.75;

/** Addendum's real auto-grouping rule (proposed starting point, tune during Core Build). */
export const GROUPING_RADIUS_KM = 2;
export const GROUPING_WINDOW_HOURS = 6;

export interface SeverityMeta {
  level: SeverityBand;
  label: string;
  abbr: string;
  fillVar: string;
  textVar: string;
  ringVar: string;
  ringWidth: number;
  dotDiameter: number;
  numeralFont: number;
  sumRange: [number, number];
}

export const SEVERITY: Record<SeverityBand, SeverityMeta> = {
  1: {
    level: 1,
    label: "Moderate",
    abbr: "MOD",
    fillVar: "var(--sev1-fill)",
    textVar: "var(--sev1-text)",
    ringVar: "var(--sev1-ring)",
    ringWidth: 2,
    dotDiameter: 26,
    numeralFont: 12,
    sumRange: [4, 7],
  },
  2: {
    level: 2,
    label: "High",
    abbr: "HIGH",
    fillVar: "var(--sev2-fill)",
    textVar: "var(--sev2-text)",
    ringVar: "var(--sev2-ring)",
    ringWidth: 2,
    dotDiameter: 34,
    numeralFont: 15,
    sumRange: [8, 10],
  },
  3: {
    level: 3,
    label: "Extreme",
    abbr: "EXT",
    fillVar: "var(--sev3-fill)",
    textVar: "var(--sev3-text)",
    ringVar: "var(--sev3-ring)",
    ringWidth: 3,
    dotDiameter: 42,
    numeralFont: 18,
    sumRange: [11, 13],
  },
  4: {
    level: 4,
    label: "Catastrophic",
    abbr: "CAT",
    fillVar: "var(--sev4-fill)",
    textVar: "var(--sev4-text)",
    ringVar: "var(--sev4-ring)",
    ringWidth: 4,
    dotDiameter: 50,
    numeralFont: 21,
    sumRange: [14, 16],
  },
};

export const SEVERITY_ORDER: SeverityBand[] = [4, 3, 2, 1];

export function bandFromSum(sum: number): SeverityBand {
  if (sum <= 7) return 1;
  if (sum <= 10) return 2;
  if (sum <= 13) return 3;
  return 4;
}

export const ELEMENT_LABELS = {
  smoke: "Smoke level",
  flame: "Flame visibility",
  damage: "Damage / impact",
  people: "People proximity",
} as const;

/** Rubric wording per element per level (1-4), from the BA's severity rubric. */
export const ELEMENT_RUBRIC: Record<keyof typeof ELEMENT_LABELS, string[]> = {
  smoke: [
    "Visible haze or smoke",
    "Moderate smoke density",
    "Dense and dark smoke",
    "Very dense smoke, blocking vision",
  ],
  flame: [
    "No visible flame",
    "Some flame visible",
    "Visible high flames and embers",
    "Large flame wall front with embers flying everywhere",
  ],
  damage: [
    "No vegetation at risk",
    "Vegetation scorching",
    "Noticeable vegetation impact",
    "Extensive burnt area including vegetation and infrastructure",
  ],
  people: [
    "No people in range",
    "Visible at a distance",
    "Near the fire, evacuation required",
    "Direct proximity, immediate help required",
  ],
};

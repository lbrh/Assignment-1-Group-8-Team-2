import type { AssignmentStatus, CrewType } from "@/lib/types";

export const CREW_TYPE_LABEL: Record<CrewType, string> = { light: "Light", heavy: "Heavy", aerial: "Aerial" };

export const ASSIGNMENT_LABEL: Record<AssignmentStatus, string> = {
  dispatched: "Dispatched",
  en_route: "En route",
  on_scene: "On scene",
  cleared: "Cleared",
};

"use client";

import { create } from "zustand";
import { dataSource, getSeedDecisionLog, getSeedGroup } from "@/lib/data-source";
import type { SubmitImagePayload } from "@/lib/data-source";
import { SEVERITY, bandFromSum } from "@/lib/constants/severity";
import type {
  DecisionLogEntry,
  DispatchState,
  Incident,
  IncidentGroup,
  SeverityBand,
} from "@/lib/types";

export interface Toast {
  id: string;
  title: string;
  body: string;
  severityBand: SeverityBand | 0 | "not_a_fire";
  cta: "undo" | "dismiss" | "none";
  onUndo?: () => void;
  createdAt: number;
}

export type MapFilter = "all" | "sev34" | "extinguished";
export type DispatchFilter = "all" | "awaiting" | "live";
export type ZoomTier = 1 | 2 | 3;

/** Last Leaflet viewport on the Map tab, so returning to it restores where the coordinator was
 * looking instead of re-fitting to every marker. */
export interface MapView {
  center: [number, number];
  zoom: number;
}

interface IncidentStoreState {
  incidents: Record<string, Incident>;
  order: string[]; // insertion order, for stable iteration
  decisionLogs: Record<string, DecisionLogEntry[]>;
  group: IncidentGroup | null;
  toasts: Toast[];

  theme: "dark" | "light";
  notesOn: boolean;
  clockTick: number;
  keysOpen: boolean;
  /** Coarse zoom tier (regional / district / site), derived from the Leaflet zoom level. */
  zoom: ZoomTier;
  mapView: MapView | null;
  /** Incident hovered/focused on either the map or the Active Incidents rail — each side
   * highlights it so the two stay visually linked. */
  mapHoverId: string | null;
  mapFilter: MapFilter;
  dispatchFilter: DispatchFilter;
  alertsPanelOpen: boolean;
  reviewSelectedId: string | null;
  newIncidentId: string | null;
  /** Last top-level tab route visited — lets pages reached by click-through (incident detail)
   * know which tab to show as active and where "back" should go, instead of assuming Map. */
  lastTabPath: string;

  initialized: boolean;
  loading: boolean;

  init: () => Promise<void>;
  toggleTheme: () => void;
  toggleNotes: () => void;
  tickClock: () => void;
  setKeysOpen: (open: boolean) => void;
  setZoom: (zoom: ZoomTier) => void;
  setMapView: (view: MapView) => void;
  setMapHoverId: (id: string | null) => void;
  setMapFilter: (f: MapFilter) => void;
  setDispatchFilter: (f: DispatchFilter) => void;
  setAlertsPanelOpen: (open: boolean) => void;
  setLastTabPath: (path: string) => void;
  selectReview: (id: string | null) => void;
  dismissToast: (id: string) => void;

  confirmReview: (id: string) => Promise<void>;
  changeReview: (id: string, level: SeverityBand) => Promise<void>;
  discardReview: (id: string) => Promise<void>;
  overrideSeverity: (id: string, level: SeverityBand) => Promise<void>;
  dispatchCrew: (id: string) => Promise<void>;
  cancelDispatch: (id: string) => Promise<void>;
  markExtinguished: (id: string) => Promise<void>;
  reopenIncident: (id: string) => Promise<void>;
  sendToManualReview: (id: string) => Promise<void>;
  restoreFromArchive: (id: string) => Promise<void>;
  confirmGrouping: () => Promise<void>;
  keepGroupSeparate: () => Promise<void>;
  submitImage: (payload: SubmitImagePayload) => Promise<{ ref: string; incidentId: string }>;
}

function bandLabel(band: SeverityBand | 0): string {
  if (!band) return "no severity";
  return `${SEVERITY[band].label} (${band})`;
}

let toastCounter = 0;
let logCounter = 0;

export const useIncidentStore = create<IncidentStoreState>((set, get) => {
  function pushLog(incidentId: string, summary: string) {
    const entry: DecisionLogEntry = {
      id: `log-${++logCounter}`,
      incidentId,
      summary,
      who: "EC · Emergency Coordinator",
      whenIso: new Date().toISOString(),
    };
    set((s) => ({
      decisionLogs: {
        ...s.decisionLogs,
        [incidentId]: [entry, ...(s.decisionLogs[incidentId] ?? [])],
      },
    }));
  }

  function pushToast(toast: Omit<Toast, "id" | "createdAt">) {
    const id = `toast-${++toastCounter}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id, createdAt: Date.now() }] }));
    if (toast.cta !== "none") {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 5000);
    }
    return id;
  }

  function patchIncident(id: string, patch: Partial<Incident>) {
    set((s) => ({
      incidents: { ...s.incidents, [id]: { ...s.incidents[id], ...patch } },
    }));
  }

  function snapshot(id: string): Incident {
    return { ...get().incidents[id] };
  }

  return {
    incidents: {},
    order: [],
    decisionLogs: {},
    group: null,
    toasts: [],

    theme: "dark",
    notesOn: true,
    clockTick: 0,
    keysOpen: false,
    zoom: 2,
    mapView: null,
    mapHoverId: null,
    mapFilter: "all",
    dispatchFilter: "all",
    alertsPanelOpen: false,
    reviewSelectedId: null,
    newIncidentId: null,
    lastTabPath: "/",

    initialized: false,
    loading: false,

    init: async () => {
      if (get().initialized || get().loading) return;
      set({ loading: true });
      const list = await dataSource.listIncidents();
      const incidents: Record<string, Incident> = {};
      const order: string[] = [];
      for (const incident of list) {
        incidents[incident.id] = incident;
        order.push(incident.id);
      }
      const decisionLogs: Record<string, DecisionLogEntry[]> = {};
      for (const entry of getSeedDecisionLog()) {
        decisionLogs[entry.incidentId] = [
          ...(decisionLogs[entry.incidentId] ?? []),
          entry,
        ].sort((a, b) => (a.whenIso < b.whenIso ? 1 : -1));
      }
      const seedGroup = getSeedGroup();
      set({
        incidents,
        order,
        decisionLogs,
        group: {
          id: seedGroup.id,
          memberIds: seedGroup.memberIds,
          state: seedGroup.state,
          proximityKm: seedGroup.proximityKm,
          windowHours: seedGroup.windowHours,
        },
        initialized: true,
        loading: false,
      });
      // seed dispatch/overlay state that mockApi's listIncidents() doesn't carry
      const { seedOverlay } = await import("@/lib/data-source/mock/seed");
      set((s) => {
        const next = { ...s.incidents };
        for (const [id, overlay] of Object.entries(seedOverlay)) {
          if (!next[id]) continue;
          next[id] = {
            ...next[id],
            dispatch: overlay.dispatch as DispatchState,
            reviewReason: overlay.reviewReason ?? next[id].reviewReason,
            reviewReasonNote: overlay.reviewReasonNote ?? next[id].reviewReasonNote,
            dismissedReason: overlay.dismissedReason ?? next[id].dismissedReason,
            dismissedBy: overlay.dismissedBy ?? next[id].dismissedBy,
            dismissedAtIso: overlay.dismissedAtIso ?? next[id].dismissedAtIso,
            extinguishedNote: overlay.extinguishedNote ?? next[id].extinguishedNote,
            extinguishedBy: overlay.extinguishedBy ?? next[id].extinguishedBy,
            extinguishedAtIso: overlay.extinguishedAtIso ?? next[id].extinguishedAtIso,
            reasonBullets: overlay.reasonBullets ?? next[id].reasonBullets,
            recommendedAction: overlay.recommendedAction ?? next[id].recommendedAction,
            groupId: seedGroup.memberIds.includes(id) ? seedGroup.id : null,
          };
        }
        return { incidents: next };
      });
    },

    toggleTheme: () =>
      set((s) => {
        const next = s.theme === "dark" ? "light" : "dark";
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", next);
        }
        return { theme: next };
      }),
    toggleNotes: () => set((s) => ({ notesOn: !s.notesOn })),
    tickClock: () => set((s) => ({ clockTick: s.clockTick + 1 })),
    setKeysOpen: (open) => set({ keysOpen: open }),
    setZoom: (zoom) => set({ zoom }),
    setMapView: (mapView) => set({ mapView }),
    setMapHoverId: (mapHoverId) => set({ mapHoverId }),
    setMapFilter: (mapFilter) => set({ mapFilter }),
    setDispatchFilter: (dispatchFilter) => set({ dispatchFilter }),
    setAlertsPanelOpen: (alertsPanelOpen) => set({ alertsPanelOpen }),
    setLastTabPath: (lastTabPath) => set({ lastTabPath }),
    selectReview: (id) => set({ reviewSelectedId: id }),
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    confirmReview: async (id) => {
      const prev = snapshot(id);
      const incident = get().incidents[id];
      const patch = await dataSource.confirmReview(id);
      // mockApi's patch doesn't know the incident's provisional sum — apply the band the AI
      // provisionally read (elements/sum were already computed in normalizeIncident) now that
      // the coordinator has confirmed it.
      const provisionalBand = incident.sum ? bandFromSum(incident.sum) : incident.band;
      patchIncident(id, { ...patch, band: provisionalBand, dispatch: "awaiting" });
      pushLog(
        id,
        `AI provisional tag confirmed: ${bandLabel(incident.band)}, scored ${incident.sum ?? "—"} of 16`
      );
      pushToast({
        title: `AI tag confirmed · ${id}`,
        body: "Promoted to an active incident with the provisional score applied.",
        severityBand: incident.band,
        cta: "undo",
        onUndo: () => {
          patchIncident(id, prev);
          pushLog(id, "Reverted to the AI assessment (undo)");
        },
      });
    },

    changeReview: async (id, level) => {
      const prev = snapshot(id);
      const patch = await dataSource.changeReview(id, level);
      patchIncident(id, { ...patch, dispatch: "awaiting" });
      pushLog(id, `Severity assigned manually: ${bandLabel(level)} — no AI tag had been applied`);
      pushToast({
        title: `Severity assigned manually · ${id}`,
        body: "Now on the dispatch order, labelled as coordinator-assigned.",
        severityBand: level,
        cta: "undo",
        onUndo: () => {
          patchIncident(id, prev);
          pushLog(id, "Reverted to the AI assessment (undo)");
        },
      });
    },

    discardReview: async (id) => {
      const prev = snapshot(id);
      const patch = await dataSource.discardReview(id);
      patchIncident(id, patch);
      pushLog(id, "Discarded as not a fire — no fire present in the image.");
      pushToast({
        title: `Discarded as not a fire · ${id}`,
        body: "Off the map and the dispatch order, retrievable in the Archive.",
        severityBand: "not_a_fire",
        cta: "undo",
        onUndo: () => {
          patchIncident(id, prev);
          pushLog(id, "Restored from the archive to manual review");
        },
      });
      // advance the reviewer to the next queued item, mirroring the prototype's flow
      const remainingFlagged = get().order.filter(
        (oid) => oid !== id && get().incidents[oid]?.flag === "flagged_review"
      );
      set({ reviewSelectedId: remainingFlagged[0] ?? null });
    },

    overrideSeverity: async (id, level) => {
      const prev = snapshot(id);
      const patch = await dataSource.overrideSeverity(id, level);
      patchIncident(id, patch);
      pushLog(id, `Severity changed from ${bandLabel(prev.band)} to ${bandLabel(level)}`);
      pushToast({
        title: `Severity overridden · ${id}`,
        body: "Applied and logged as a coordinator decision. The ranking has been recalculated.",
        severityBand: level,
        cta: "undo",
        onUndo: () => {
          patchIncident(id, prev);
          pushLog(id, "Reverted to the AI assessment (undo)");
        },
      });
    },

    dispatchCrew: async (id) => {
      const patch = await dataSource.dispatchCrew(id);
      patchIncident(id, patch);
      pushLog(id, `Crew dispatched to ${id} — Tanker 12 en route.`);
      pushToast({
        title: `Crew dispatched · ${id}`,
        body: `Crew dispatched to ${id} — Tanker 12 en route.`,
        severityBand: get().incidents[id]?.band ?? 0,
        cta: "dismiss",
      });
    },

    cancelDispatch: async (id) => {
      const patch = await dataSource.cancelDispatch(id);
      patchIncident(id, patch);
      pushLog(id, "Dispatch cancelled — crew stood down, back on the ranked queue.");
      pushToast({
        title: `Dispatch cancelled · ${id}`,
        body: "Crew stood down. Back on the ranked dispatch queue.",
        severityBand: get().incidents[id]?.band ?? 0,
        cta: "dismiss",
      });
    },

    markExtinguished: async (id) => {
      const prev = snapshot(id);
      const patch = await dataSource.markExtinguished(id);
      patchIncident(id, patch);
      pushLog(id, "Marked extinguished — crew reported the fire out.");
      pushToast({
        title: `Marked extinguished · ${id}`,
        body: "Crew reported the fire out. Moved to Resolved.",
        severityBand: get().incidents[id]?.band ?? 0,
        cta: "undo",
        onUndo: () => {
          patchIncident(id, prev);
          pushLog(id, "Reopened — back on the dispatch order under Live / Dispatched");
        },
      });
    },

    reopenIncident: async (id) => {
      const patch = await dataSource.reopenIncident(id);
      patchIncident(id, patch);
      pushLog(id, "Reopened — back on the dispatch order under Live / Dispatched");
      pushToast({
        title: `Reopened · ${id}`,
        body: "Back on the dispatch order under Live / Dispatched.",
        severityBand: get().incidents[id]?.band ?? 0,
        cta: "undo",
        onUndo: async () => {
          const p = await dataSource.markExtinguished(id);
          patchIncident(id, p);
          pushLog(id, "Marked extinguished — crew reported the fire out.");
        },
      });
    },

    sendToManualReview: async (id) => {
      const prev = snapshot(id);
      const patch = await dataSource.sendToManualReview(id);
      patchIncident(id, patch);
      pushLog(id, "Sent to manual review by coordinator — AI tag withdrawn.");
      pushToast({
        title: `Sent for a human check · ${id}`,
        body: "Withdrawn from the map and the dispatch order until reviewed.",
        severityBand: 0,
        cta: "undo",
        onUndo: () => {
          patchIncident(id, prev);
          pushLog(id, "Reverted to the AI assessment (undo)");
        },
      });
      set({ reviewSelectedId: id });
    },

    restoreFromArchive: async (id) => {
      const patch = await dataSource.restoreFromArchive(id);
      patchIncident(id, patch);
      pushLog(id, "Restored from the archive to manual review");
      pushToast({
        title: `Restored for re-check · ${id}`,
        body: "Back in the manual review queue with its provisional tag intact.",
        severityBand: 0,
        cta: "dismiss",
      });
      set({ reviewSelectedId: id });
    },

    confirmGrouping: async () => {
      const group = get().group;
      if (!group) return;
      await dataSource.setGrouping(group.id, "confirmed");
      set((s) => ({ group: s.group ? { ...s.group, state: "confirmed" } : s.group }));
      pushLog(
        group.memberIds[0],
        `Grouping confirmed — ${group.memberIds.length} images treated as one incident (${group.id})`
      );
      pushToast({
        title: `Grouping confirmed · ${group.id}`,
        body: `${group.memberIds.length} images now treated as one incident.`,
        severityBand: 0,
        cta: "undo",
        onUndo: async () => {
          await dataSource.setGrouping(group.id, "kept_separate");
          set((s) => ({ group: s.group ? { ...s.group, state: "suggested" } : s.group }));
        },
      });
    },

    keepGroupSeparate: async () => {
      const group = get().group;
      if (!group) return;
      await dataSource.setGrouping(group.id, "kept_separate");
      set((s) => ({ group: s.group ? { ...s.group, state: "kept_separate" } : s.group }));
      pushLog(
        group.memberIds[0],
        `Grouping rejected — images kept as separate incidents (${group.id})`
      );
      pushToast({
        title: `Kept separate · ${group.id}`,
        body: "Images kept as separate incidents.",
        severityBand: 0,
        cta: "dismiss",
      });
    },

    submitImage: async (payload) => {
      const { ref, record } = await dataSource.submitImage(payload);
      const { normalizeIncident } = await import("@/lib/normalize");
      const incident = normalizeIncident(record, {});
      set((s) => ({
        incidents: { ...s.incidents, [incident.id]: incident },
        order: [incident.id, ...s.order],
        newIncidentId: incident.id,
      }));
      return { ref, incidentId: incident.id };
    },
  };
});

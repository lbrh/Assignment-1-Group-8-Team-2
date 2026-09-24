"use client";

import { create } from "zustand";
import { COORDINATOR_NAME, dataSource, getSeedDecisionLog, getSeedGroup, useMock } from "@/lib/data-source";
import type { SubmitImagePayload } from "@/lib/data-source";
import { SEVERITY, bandFromSum } from "@/lib/constants/severity";
import { THEME_STORAGE_KEY } from "@/lib/constants/theme";
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
  /** Incident hovered/focused on either the map or the Active incidents rail; each side
   * highlights it so the two stay visually linked. */
  mapHoverId: string | null;
  mapFilter: MapFilter;
  dispatchFilter: DispatchFilter;
  alertsPanelOpen: boolean;
  reviewSelectedId: string | null;
  newIncidentId: string | null;
  /** Last top-level tab route visited. Lets pages reached by click-through (incident detail)
   * know which tab to show as active and where "back" should go, instead of assuming Map. */
  lastTabPath: string;

  initialized: boolean;
  loading: boolean;

  init: () => Promise<void>;
  toggleTheme: () => void;
  /** Adopts the theme the pre-paint script in the root layout already applied. */
  syncThemeFromDocument: () => void;
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
  loadDecisionLog: (id: string) => Promise<void>;
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
      who: COORDINATOR_NAME,
      whenIso: new Date().toISOString(),
    };
    set((s) => ({
      decisionLogs: {
        ...s.decisionLogs,
        [incidentId]: [entry, ...(s.decisionLogs[incidentId] ?? [])],
      },
    }));
    return entry.id;
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

  // Runs a coordinator action; a failed backend call becomes a toast instead of an unhandled rejection.
  async function attempt(title: string, fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch (err) {
      pushToast({
        title,
        body: err instanceof Error ? err.message : "The request failed.",
        severityBand: 0,
        cta: "dismiss",
      });
    }
  }

  // Optimistic UI: apply the expected result, log it and toast it straight away, then merge in
  // the server's answer. A failed call rolls the incident back and swaps the toast for an error.
  // ponytail: rollback restores the whole pre-action snapshot, so an action taken while an earlier
  // one is still in flight is reverted with it; roll back per field if that ever bites.
  async function optimistic(
    prev: Incident,
    failTitle: string,
    guess: Partial<Incident>,
    call: () => Promise<Partial<Incident>>,
    log: string,
    toast?: Omit<Toast, "id" | "createdAt">
  ): Promise<void> {
    const id = prev.id;
    patchIncident(id, guess);
    const logId = pushLog(id, log);
    const toastId = toast ? pushToast(toast) : null;
    try {
      patchIncident(id, await call());
    } catch (err) {
      patchIncident(id, prev);
      set((s) => ({
        toasts: s.toasts.filter((t) => t.id !== toastId),
        decisionLogs: { ...s.decisionLogs, [id]: (s.decisionLogs[id] ?? []).filter((e) => e.id !== logId) },
      }));
      pushToast({
        title: failTitle,
        body: err instanceof Error ? err.message : "The request failed.",
        severityBand: 0,
        cta: "dismiss",
      });
    }
  }

  // Undo = put the store back to the pre-action snapshot now, and the server behind it.
  function undoTo(id: string, prev: Incident, note: string) {
    return () => {
      const current = snapshot(id);
      return optimistic(current, `Undo failed · ${id}`, prev, async () => {
        await dataSource.undo(prev, current);
        return {};
      }, note);
    };
  }

  return {
    incidents: {},
    order: [],
    decisionLogs: {},
    group: null,
    toasts: [],

    theme: "light",
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
      let list: Incident[];
      try {
        list = await dataSource.listIncidents();
      } catch (err) {
        set({ initialized: true, loading: false });
        pushToast({
          title: "Couldn't load incidents",
          body: err instanceof Error ? err.message : "The incident service is unreachable.",
          severityBand: 0,
          cta: "none",
        });
        return;
      }
      const incidents: Record<string, Incident> = {};
      const order: string[] = [];
      for (const incident of list) {
        incidents[incident.id] = incident;
        order.push(incident.id);
      }
      if (!useMock) {
        // TODO(api): decision log, grouping and dispatch state have no backend endpoint yet.
        set({ incidents, order, initialized: true, loading: false });
        return;
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
          try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch {
            // storage blocked: the theme still applies for this session
          }
        }
        return { theme: next };
      }),
    syncThemeFromDocument: () =>
      set({
        theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
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

    confirmReview: (id) => {
      const prev = snapshot(id);
      // apply the band the AI provisionally read, now that the coordinator has confirmed it
      const band = prev.sum ? bandFromSum(prev.sum) : prev.band;
      return optimistic(
        prev,
        `Couldn't confirm · ${id}`,
        { flag: "processed", provenance: "ai_confirmed_by_coordinator", band, dispatch: "awaiting" },
        () => dataSource.confirmReview(prev),
        `AI provisional tag confirmed: ${bandLabel(band)}, scored ${prev.sum ?? "–"} of 16`,
        {
          title: `AI tag confirmed · ${id}`,
          body: "Promoted to an active incident with the provisional score applied.",
          severityBand: band,
          cta: "undo",
          onUndo: undoTo(id, prev, "Reverted to the AI assessment (undo)"),
        }
      );
    },

    changeReview: (id, level) => {
      const prev = snapshot(id);
      return optimistic(
        prev,
        `Couldn't assign severity · ${id}`,
        { flag: "processed", provenance: "coordinator_assigned", band: level, dispatch: "awaiting" },
        () => dataSource.changeReview(prev, level),
        `Severity assigned manually: ${bandLabel(level)}` +
          (prev.sum ? `. AI had provisionally read ${bandLabel(bandFromSum(prev.sum))}` : ". No AI tag had been applied"),
        {
          title: `Severity assigned manually · ${id}`,
          body: "Now on the dispatch order, labelled as coordinator-assigned.",
          severityBand: level,
          cta: "undo",
          onUndo: undoTo(id, prev, "Reverted to the AI assessment (undo)"),
        }
      );
    },

    discardReview: (id) => {
      const prev = snapshot(id);
      // advance the reviewer to the next queued item, mirroring the prototype's flow
      const remainingFlagged = get().order.filter(
        (oid) => oid !== id && get().incidents[oid]?.flag === "flagged_review"
      );
      set({ reviewSelectedId: remainingFlagged[0] ?? null });
      return optimistic(
        prev,
        `Couldn't discard · ${id}`,
        {
          flag: "not_a_fire",
          dismissedReason: "Discarded by reviewer — no fire present in the image.",
          dismissedBy: COORDINATOR_NAME,
          dismissedAtIso: new Date().toISOString(),
        },
        () => dataSource.discardReview(prev),
        "Discarded as not a fire. No fire present in the image.",
        {
          title: `Discarded as not a fire · ${id}`,
          body: "Off the map and the dispatch order, retrievable in the Archive.",
          severityBand: "not_a_fire",
          cta: "undo",
          onUndo: undoTo(id, prev, "Restored from the archive to manual review (undo)"),
        }
      );
    },

    overrideSeverity: (id, level) => {
      const prev = snapshot(id);
      return optimistic(
        prev,
        `Couldn't override severity · ${id}`,
        { band: level, provenance: "coordinator_override" },
        () => dataSource.overrideSeverity(prev, level),
        `Severity changed from ${bandLabel(prev.band)} to ${bandLabel(level)}`,
        {
          title: `Severity overridden · ${id}`,
          body: "Applied and logged as a coordinator decision. The ranking has been recalculated.",
          severityBand: level,
          cta: "undo",
          onUndo: undoTo(id, prev, "Reverted to the AI assessment (undo)"),
        }
      );
    },

    dispatchCrew: (id) => {
      const prev = snapshot(id);
      return optimistic(
        prev,
        `Couldn't dispatch · ${id}`,
        { dispatch: "live", flag: "processed" },
        () => dataSource.dispatchCrew(prev),
        `Crew dispatched to ${id}. Tanker 12 en route.`,
        {
          title: `Crew dispatched · ${id}`,
          body: `Crew dispatched to ${id}. Tanker 12 en route.`,
          severityBand: prev.band,
          cta: "dismiss",
        }
      );
    },

    cancelDispatch: (id) => {
      const prev = snapshot(id);
      return optimistic(
        prev,
        `Couldn't cancel dispatch · ${id}`,
        { dispatch: "awaiting" },
        () => dataSource.cancelDispatch(prev),
        "Dispatch cancelled. Crew stood down, back on the ranked queue.",
        {
          title: `Dispatch cancelled · ${id}`,
          body: "Crew stood down. Back on the ranked dispatch queue.",
          severityBand: prev.band,
          cta: "dismiss",
        }
      );
    },

    markExtinguished: (id) => {
      const prev = snapshot(id);
      return optimistic(
        prev,
        `Couldn't mark extinguished · ${id}`,
        {
          dispatch: "extinguished",
          extinguishedNote: "Crew reported the fire out",
          extinguishedBy: COORDINATOR_NAME,
          extinguishedAtIso: new Date().toISOString(),
        },
        () => dataSource.markExtinguished(prev),
        "Marked extinguished. Crew reported the fire out.",
        {
          title: `Marked extinguished · ${id}`,
          body: "Crew reported the fire out. Moved to Resolved.",
          severityBand: prev.band,
          cta: "undo",
          onUndo: undoTo(id, prev, "Reopened. Back on the dispatch order under Live (undo)"),
        }
      );
    },

    reopenIncident: (id) => {
      const prev = snapshot(id);
      return optimistic(
        prev,
        `Couldn't reopen · ${id}`,
        { dispatch: "live", extinguishedNote: null, extinguishedBy: null, extinguishedAtIso: null },
        () => dataSource.reopenIncident(prev),
        "Reopened. Back on the dispatch order under Live",
        {
          title: `Reopened · ${id}`,
          body: "Back on the dispatch order under Live / Dispatched.",
          severityBand: prev.band,
          cta: "undo",
          onUndo: undoTo(id, prev, "Marked extinguished again (undo)"),
        }
      );
    },

    sendToManualReview: (id) => {
      const prev = snapshot(id);
      set({ reviewSelectedId: id });
      return optimistic(
        prev,
        `Couldn't send to review · ${id}`,
        { flag: "flagged_review", band: 0, dispatch: "unranked", reviewReason: "sent_by_coordinator" },
        () => dataSource.sendToManualReview(prev),
        "Sent to manual review by coordinator. AI tag withdrawn.",
        {
          title: `Sent for a human check · ${id}`,
          body: "Withdrawn from the map and the dispatch order until reviewed.",
          severityBand: 0,
          cta: "undo",
          onUndo: undoTo(id, prev, "Reverted to the AI assessment (undo)"),
        }
      );
    },

    restoreFromArchive: (id) => {
      const prev = snapshot(id);
      set({ reviewSelectedId: id });
      return optimistic(
        prev,
        `Couldn't restore · ${id}`,
        {
          flag: "flagged_review",
          dispatch: "unranked",
          reviewReason: "restored_not_fire",
          dismissedReason: null,
          dismissedBy: null,
          dismissedAtIso: null,
        },
        () => dataSource.restoreFromArchive(prev),
        "Restored from the archive to manual review",
        {
          title: `Restored for re-check · ${id}`,
          body: "Back in the manual review queue with its provisional tag intact.",
          severityBand: 0,
          cta: "dismiss",
        }
      );
    },

    loadDecisionLog: async (id) => {
      try {
        const log = await dataSource.getDecisionLog(id);
        if (log) set((s) => ({ decisionLogs: { ...s.decisionLogs, [id]: log } }));
      } catch {
        // keep whatever is already shown; the log is informational
      }
    },

    confirmGrouping: () =>
      attempt("Couldn't confirm grouping", async () => {
        const group = get().group;
        if (!group) return;
        await dataSource.setGrouping(group.id, "confirmed");
        set((s) => ({ group: s.group ? { ...s.group, state: "confirmed" } : s.group }));
        pushLog(
          group.memberIds[0],
          `Grouping confirmed: ${group.memberIds.length} images treated as one incident (${group.id})`
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
      }),

    keepGroupSeparate: () =>
      attempt("Couldn't keep images separate", async () => {
        const group = get().group;
        if (!group) return;
        await dataSource.setGrouping(group.id, "kept_separate");
        set((s) => ({ group: s.group ? { ...s.group, state: "kept_separate" } : s.group }));
        pushLog(
          group.memberIds[0],
          `Grouping rejected. Images kept as separate incidents (${group.id})`
        );
        pushToast({
          title: `Kept separate · ${group.id}`,
          body: "Images kept as separate incidents.",
          severityBand: 0,
          cta: "dismiss",
        });
      }),

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

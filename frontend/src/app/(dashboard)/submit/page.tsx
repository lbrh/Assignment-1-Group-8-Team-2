"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { SOURCE_META } from "@/components/primitives/SourceChip";
import { Button } from "@/components/primitives/Button";
import type { SourceType } from "@/lib/types";

const SOURCES: SourceType[] = ["citizen", "drone", "satellite", "cctv"];

interface FormState {
  fileName: string;
  lat: string;
  lng: string;
  ts: string;
  notes: string;
  source: SourceType;
}

const EMPTY: FormState = { fileName: "", lat: "", lng: "", ts: "", notes: "", source: "citizen" };

export default function SubmitImagePage() {
  const router = useRouter();
  const submitImage = useIncidentStore((s) => s.submitImage);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRef, setLastRef] = useState<string | null>(null);

  const isValid = form.fileName && form.lat && form.lng && form.ts;

  const steps: { label: string; done: boolean; running?: boolean }[] = [
    { label: "Attach image", done: !!form.fileName },
    { label: "Geotag + capture time", done: !!(form.lat && form.lng && form.ts) },
    { label: "Submission confirmed", done: status === "done" },
    { label: "AI assessment running", done: status === "done", running: status === "processing" },
  ];

  async function handleSubmit(demoOutcome?: "valid" | "low_confidence" | "not_fire") {
    if (!demoOutcome && !isValid) {
      setError("Geotag and capture time are required — enter manually or use device location.");
      return;
    }
    setError(null);
    setStatus("processing");
    const payload = {
      fileName: form.fileName || "IMG_demo.jpg",
      latitude: parseFloat(form.lat) || -37.62,
      longitude: parseFloat(form.lng) || 145.31,
      timestamp: form.ts || new Date().toISOString(),
      sourceType: form.source,
      notes: form.notes,
      demoOutcome,
    };
    const result = await submitImage(payload);
    setLastRef(result.ref);
    setStatus("done");
    setTimeout(() => router.push(`/incident/${result.incidentId}`), 900);
  }

  return (
    <div
      style={{
        height: "100%",
        maxWidth: 1320,
        margin: "0 auto",
        padding: "18px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", flex: "none" }}>
        <h1 style={{ font: "600 20px/1.2 var(--font-plex-sans)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg)" }}>
          Submit Field Image
        </h1>
        <p style={{ font: "400 13px/1.4 var(--font-plex-sans)", color: "var(--muted)" }}>
          Every image runs the fire / not-fire check first, then severity scoring. Geotag and
          capture time are required.
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", border: "var(--border-w) solid var(--border)", background: "var(--panel)" }}>
        {error ? (
          <div style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "13px 18px", background: "var(--err-bg)", borderBottom: "var(--border-w) solid var(--err-border)", flex: "none" }}>
            <div style={{ flex: "none", width: 20, height: 20, background: "var(--hard-stop)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: "700 12px/1 var(--font-plex-mono)" }}>
              !
            </div>
            <div>
              <div style={{ font: "600 11px/1.3 var(--font-plex-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--err-fg)" }}>
                Submission rejected
              </div>
              <div style={{ font: "400 13px/1.4 var(--font-plex-sans)", color: "var(--err-fg-2)" }}>{error}</div>
            </div>
          </div>
        ) : null}

        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <div
            style={{
              width: 290,
              flex: "none",
              borderRight: "var(--border-w) solid var(--border)",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.16em", color: "var(--muted)" }}>
                Submission flow
              </span>
              {steps.map((step, i) => (
                <div
                  key={step.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "9px 11px",
                    background: step.done || step.running ? "rgb(95 217 140 / 16%)" : "var(--surface)",
                    border: `2px solid ${step.done || step.running ? "var(--ok-fg)" : "var(--border-4)"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        flex: "none",
                        borderRadius: "50%",
                        border: `2px solid ${step.done || step.running ? "var(--ok-fg)" : "var(--border-2)"}`,
                        color: step.done || step.running ? "var(--ok-fg)" : "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        font: "700 10px/1 var(--font-plex-mono)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ font: "500 12.5px/1.3 var(--font-plex-sans)", color: "var(--fg-3)" }}>
                      {step.label}
                    </span>
                  </div>
                  <span
                    style={{
                      flex: "none",
                      font: "600 9px/1 var(--font-plex-mono)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: step.running ? "var(--conf-mid)" : step.done ? "var(--ok-fg)" : "var(--muted)",
                    }}
                  >
                    {step.running ? "Running" : step.done ? "Done" : "Waiting"}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.16em", color: "var(--muted)" }}>
                Input source
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SOURCES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, source: s }))}
                    style={{
                      height: 56,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: 4,
                      padding: "10px 6px",
                      background: form.source === s ? "var(--acc-10)" : "var(--surface-2)",
                      border: form.source === s ? "var(--border-w) solid var(--accent)" : "var(--border-w) solid var(--border-3)",
                    }}
                  >
                    <span style={{ font: "700 10px/1 var(--font-plex-mono)", letterSpacing: "0.1em", color: form.source === s ? "var(--accent)" : "var(--fg-4)" }}>
                      {SOURCE_META[s].abbr}
                    </span>
                    <span style={{ font: "400 10px/1.3 var(--font-plex-sans)", color: "var(--fg-3)", whiteSpace: "nowrap" }}>
                      {SOURCE_META[s].label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, padding: 18, display: "flex", flexDirection: "column", gap: 14, overflow: "auto" }}>
            <Field label="Image">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, fileName: f.fileName || "IMG_4900.jpg" }))}
                style={{
                  border: "var(--border-w) dashed var(--border-4)",
                  background: "var(--surface)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  height: 130,
                }}
              >
                <div style={{ width: 30, height: 24, border: "1px solid var(--border-7)" }} />
                <span style={{ font: "600 13.5px/1 var(--font-plex-sans)", color: "var(--fg-2)" }}>
                  {form.fileName || "Choose an image or drag it here"}
                </span>
                <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>JPEG or PNG · max 15 MB</span>
              </button>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Latitude" required>
                <input
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  placeholder="-37.6214"
                  style={inputStyle}
                />
              </Field>
              <Field label="Longitude" required>
                <input
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  placeholder="145.3087"
                  style={inputStyle}
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, lat: "-37.6214", lng: "145.3087" }))}
              style={{ alignSelf: "flex-start", marginTop: -6, font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}
            >
              Use device location
            </button>

            <Field label="Capture time" required>
              <input
                value={form.ts}
                onChange={(e) => setForm((f) => ({ ...f, ts: e.target.value }))}
                placeholder="2026-09-22 14:02"
                style={inputStyle}
              />
            </Field>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, ts: new Date().toISOString() }))}
              style={{ alignSelf: "flex-start", marginTop: -6, font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}
            >
              Use current time
            </button>

            <Field label="Notes (optional)" grow>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Observed conditions, access, hazards"
                style={{ ...inputStyle, flex: 1, minHeight: 90, padding: "9px 11px", resize: "none", font: "400 13.5px/1.5 var(--font-plex-sans)" }}
              />
            </Field>
          </div>
        </div>

        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderTop: "var(--border-w) solid var(--border)", background: "var(--surface)" }}>
          <Button variant="solid" onClick={() => handleSubmit()} disabled={status === "processing"}>
            {status === "processing" ? "Processing…" : "Submit for assessment"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY);
              setError(null);
              setStatus("idle");
            }}
            style={{ font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}
          >
            Clear
          </button>
          <span style={{ marginLeft: "auto", font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
            {status === "done" && lastRef ? `confirmed · ref ${lastRef}` : "3 required fields"}
          </span>
        </div>

        {status === "processing" || status === "done" ? (
          <div style={{ flex: "none", padding: "0 18px 14px", display: "flex", flexDirection: "column", gap: 11, background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgb(95 217 140 / 16%)", border: "var(--border-w) solid var(--ok-fg)", padding: "9px 12px" }}>
              <div style={{ width: 16, height: 16, background: "var(--conf-high)", color: "#04190C", display: "flex", alignItems: "center", justifyContent: "center", font: "700 10px/1 var(--font-plex-mono)", flex: "none" }}>
                ✓
              </div>
              <span style={{ font: "600 11px/1.4 var(--font-plex-mono)", color: "var(--ok-fg)", letterSpacing: "0.06em" }}>
                {status === "done" ? "Submission confirmed" : "Assessing fire behaviour and exposure…"}
                {lastRef ? ` · ref ${lastRef}` : ""}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ flex: "none", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <DemoButton label="Demo: missing geotag" onClick={() => {
          setForm((f) => ({ ...f, lat: "", lng: "" }));
          setError("Required — no geotag found in the image EXIF. Enter manually or use device location.");
        }} />
        <DemoButton label="Demo: valid submission" onClick={() => handleSubmit("valid")} />
        <DemoButton label="Demo: low-confidence result" onClick={() => handleSubmit("low_confidence")} />
        <DemoButton label="Demo: not-a-fire result" onClick={() => handleSubmit("not_fire")} />
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  grow,
  children,
}: {
  label: string;
  required?: boolean;
  grow?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, ...(grow ? { flex: 1, minHeight: 0 } : { flex: "none" }) }}>
      <span style={{ font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.16em", color: "var(--muted)", flex: "none" }}>
        {label} {required ? <span style={{ color: "var(--err-fg)" }}>*</span> : null}
      </span>
      {children}
    </div>
  );
}

function DemoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        font: "600 10px/1 var(--font-plex-mono)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--muted)",
        background: "var(--panel)",
        border: "var(--border-w) dashed var(--border-2)",
        padding: "10px 13px",
      }}
    >
      {label}
    </button>
  );
}

const inputStyle: CSSProperties = {
  height: 38,
  border: "var(--border-w) solid var(--border-3)",
  padding: "0 11px",
  font: "400 14px/1 var(--font-plex-mono)",
  color: "var(--fg)",
  background: "var(--input-bg)",
};

"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { useMock } from "@/lib/data-source";
import { SOURCE_META } from "@/components/primitives/SourceChip";
import { Button } from "@/components/primitives/Button";
import type { SourceType } from "@/lib/types";

const SOURCES: SourceType[] = ["citizen", "drone", "satellite", "cctv"];

interface FormState {
  file: File | null;
  lat: string;
  lng: string;
  ts: string;
  notes: string;
  source: SourceType;
}

const EMPTY: FormState = { file: null, lat: "", lng: "", ts: "", notes: "", source: "citizen" };

export default function SubmitImagePage() {
  const router = useRouter();
  const submitImage = useIncidentStore((s) => s.submitImage);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastRef, setLastRef] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);


  const steps: { label: string; done: boolean; running?: boolean }[] = [
    { label: "Attach image", done: !!form.file },
    { label: "Geotag + capture time", done: !!(form.lat && form.lng && form.ts) },
    { label: "Submission confirmed", done: status === "done" },
    { label: "AI assessment running", done: status === "done", running: status === "processing" },
  ];

  async function handleSubmit(demoOutcome?: "valid" | "low_confidence" | "not_fire") {
    // Demo buttons (mock only) fill in anything left blank so they always reach the outcome.
    const f = demoOutcome
      ? { ...form, lat: form.lat || "-37.62", lng: form.lng || "145.31", ts: form.ts || new Date().toISOString() }
      : form;
    const problem = validate(f, !!demoOutcome);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStatus("processing");
    try {
      const result = await submitImage({
        file: f.file ?? undefined,
        fileName: f.file?.name ?? "IMG_demo.jpg",
        latitude: f.lat ? Number(f.lat) : undefined,
        longitude: f.lng ? Number(f.lng) : undefined,
        timestamp: f.ts ? new Date(f.ts).toISOString() : undefined,
        sourceType: f.source,
        notes: f.notes,
        demoOutcome,
      });
      setLastRef(result.ref);
      setStatus("done");
      setTimeout(() => router.push(`/incident/${result.incidentId}`), 900);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  function fillDeviceLocation() {
    if (!navigator.geolocation) {
      setError("This browser can't share its location. Enter the coordinates manually.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) })),
      () => setError("Couldn't get the device location. Enter the coordinates manually.")
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "var(--space-6) var(--space-5) var(--space-7)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h1 className="page-title">Submit a field image</h1>
        <p className="page-lede">
          Every image runs the fire or not-a-fire check first, then severity scoring. Geotag and
          capture time are required. Leave them blank to read them from the image&apos;s EXIF data.
        </p>
      </div>

      <form
        className="card"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {error ? (
          <div
            role="alert"
            style={{
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "flex-start",
              margin: "var(--space-5) var(--space-5) 0",
              padding: "var(--space-3) var(--space-4)",
              background: "var(--err-bg)",
              border: "1px solid var(--err-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span
              aria-hidden
              style={{
                flex: "none",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "var(--hard-stop)",
                color: "var(--on-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "700 13px/1 var(--font-plex-sans)",
              }}
            >
              !
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "600 var(--text-sm)/1.35 var(--font-plex-sans)", color: "var(--err-fg)" }}>Submission rejected</span>
              <span style={{ font: "400 var(--text-sm)/1.45 var(--font-plex-sans)", color: "var(--err-fg-2)" }}>{error}</span>
            </div>
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 300px) minmax(0, 1fr)" }}>
          <div
            style={{
              borderRight: "1px solid var(--border)",
              padding: "var(--space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-5)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <h2 className="label">Progress</h2>
              <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {steps.map((step, i) => {
                  const lit = step.done || step.running;
                  return (
                    <li
                      key={step.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        padding: "10px var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        background: lit ? "var(--ok-soft)" : "var(--surface)",
                        border: `1px solid ${lit ? "var(--ok-border)" : "var(--border)"}`,
                        transition: "background-color var(--dur) var(--ease), border-color var(--dur) var(--ease)",
                      }}
                    >
                      <span
                        className="data"
                        aria-hidden
                        style={{
                          width: 24,
                          height: 24,
                          flex: "none",
                          borderRadius: "50%",
                          background: step.done ? "var(--ok-fg)" : "var(--panel)",
                          border: `1px solid ${lit ? "var(--ok-fg)" : "var(--border-2)"}`,
                          color: step.done ? "var(--panel)" : lit ? "var(--ok-fg)" : "var(--muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          font: "600 var(--text-2xs)/1 var(--font-plex-mono)",
                        }}
                      >
                        {step.done ? "✓" : i + 1}
                      </span>
                      <span style={{ font: "500 var(--text-sm)/1.3 var(--font-plex-sans)", color: "var(--fg-2)", flex: 1 }}>
                        {step.label}
                      </span>
                      <span className="caption" style={{ fontSize: 12, color: step.running ? "var(--conf-mid)" : step.done ? "var(--ok-fg)" : undefined }}>
                        {step.running ? "Running" : step.done ? "Done" : "Waiting"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <fieldset style={{ border: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <legend className="label" style={{ padding: 0, marginBottom: "var(--space-2)" }}>
                Input source
              </legend>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                {SOURCES.map((src) => {
                  const on = form.source === src;
                  return (
                    <button
                      key={src}
                      type="button"
                      aria-pressed={on}
                      className="sev-option"
                      onClick={() => setForm((f) => ({ ...f, source: src }))}
                      style={{
                        height: "auto",
                        minHeight: 60,
                        padding: "var(--space-2) var(--space-3)",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ font: "600 var(--text-xs)/1 var(--font-plex-sans)" }}>{SOURCE_META[src].abbr}</span>
                      <span style={{ font: "400 12px/1.3 var(--font-plex-sans)", color: "var(--muted)", textAlign: "left" }}>
                        {SOURCE_META[src].label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Field label="Image" required htmlFor="submit-file">
              <label
                htmlFor="submit-file"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) setForm((f) => ({ ...f, file }));
                }}
                style={{
                  position: "relative",
                  border: `1.5px dashed ${dragging || form.file ? "var(--accent)" : "var(--border-2)"}`,
                  borderRadius: "var(--radius-lg)",
                  background: dragging ? "var(--accent-soft)" : form.file ? "var(--grad-pending)" : "var(--surface)",
                  padding: "var(--space-5)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  width: "100%",
                  minHeight: 148,
                  cursor: "pointer",
                  transition: "background-color var(--dur) var(--ease), border-color var(--dur) var(--ease)",
                }}
              >
                <input
                  id="submit-file"
                  type="file"
                  accept="image/jpeg,image/png"
                  aria-required="true"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm((f) => ({ ...f, file }));
                  }}
                  style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
                />
                <span
                  aria-hidden
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-md)",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </span>
                <span style={{ font: "600 var(--text-sm)/1.3 var(--font-plex-sans)", color: "var(--fg)" }}>
                  {form.file?.name || (
                    <>
                      <span style={{ color: "var(--accent)" }}>Choose an image</span> or drag it here
                    </>
                  )}
                </span>
                <span className="caption" style={{ fontSize: 12 }}>
                  JPEG or PNG, up to 15 MB
                </span>
              </label>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <Field label="Latitude" htmlFor="submit-lat">
                <input
                  id="submit-lat"
                  className="input"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  placeholder="-37.6214"
                />
              </Field>
              <Field label="Longitude" htmlFor="submit-lng">
                <input
                  id="submit-lng"
                  className="input"
                  inputMode="decimal"
                  autoComplete="off"
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  placeholder="145.3087"
                />
              </Field>
            </div>
            <button type="button" className="btn btn--link" onClick={fillDeviceLocation} style={{ alignSelf: "flex-start", marginTop: -8, fontSize: "var(--text-xs)" }}>
              Use device location
            </button>

            <Field label="Capture time" htmlFor="submit-ts">
              <input
                id="submit-ts"
                className="input"
                autoComplete="off"
                value={form.ts}
                onChange={(e) => setForm((f) => ({ ...f, ts: e.target.value }))}
                placeholder="2026-09-22 14:02"
              />
            </Field>
            <button
              type="button"
              className="btn btn--link"
              onClick={() => setForm((f) => ({ ...f, ts: new Date().toISOString() }))}
              style={{ alignSelf: "flex-start", marginTop: -8, fontSize: "var(--text-xs)" }}
            >
              Use current time
            </button>

            <Field label="Notes" hint="Optional" htmlFor="submit-notes">
              <textarea
                id="submit-notes"
                className="input"
                rows={4}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Observed conditions, access, hazards"
              />
            </Field>
          </div>
        </div>

        {status === "processing" || status === "done" ? (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              margin: "0 var(--space-5) var(--space-4)",
              padding: "var(--space-3) var(--space-4)",
              background: "var(--ok-soft)",
              border: "1px solid var(--ok-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                flex: "none",
                border: "2px solid var(--ok-fg)",
                borderTopColor: status === "done" ? "var(--ok-fg)" : "transparent",
                background: status === "done" ? "var(--ok-fg)" : "transparent",
                animation: status === "processing" ? "spin 0.8s linear infinite" : undefined,
              }}
            />
            <span style={{ font: "600 var(--text-sm)/1.4 var(--font-plex-sans)", color: "var(--ok-fg)" }}>
              {status === "done" ? "Submission confirmed" : "Assessing fire behaviour and exposure…"}
              {lastRef ? <span className="data" style={{ fontFamily: "var(--font-plex-mono)", fontWeight: 500 }}> · ref {lastRef}</span> : null}
            </span>
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            padding: "var(--space-4) var(--space-5)",
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <Button type="submit" variant="primary" disabled={status === "processing"}>
            {status === "processing" ? "Submitting…" : "Submit for assessment"}
          </Button>
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => {
              setForm(EMPTY);
              setError(null);
              setStatus("idle");
            }}
          >
            Clear form
          </button>
          <span className="caption" style={{ marginLeft: "auto" }}>
            {status === "done" && lastRef ? "Opening the incident…" : form.file ? "Ready to submit" : "An image is required"}
          </span>
        </div>
      </form>

      {useMock ? (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span className="caption" style={{ marginRight: 4 }}>
            Demo outcomes
          </span>
          <DemoButton
            label="Missing geotag"
            onClick={() => {
              setForm((f) => ({ ...f, lat: "", lng: "" }));
              setError("No geotag found in the image EXIF data. Enter the coordinates, or use the device location.");
            }}
          />
          <DemoButton label="Valid submission" onClick={() => handleSubmit("valid")} />
          <DemoButton label="Low-confidence result" onClick={() => handleSubmit("low_confidence")} />
          <DemoButton label="Not-a-fire result" onClick={() => handleSubmit("not_fire")} />
        </div>
      ) : null}
    </div>
  );
}

/** Returns an error message, or null when the form can be sent. Blank geotag/time is allowed:
 * the backend reads it from EXIF and rejects the submission if it's missing there too. */
function validate(form: FormState, isDemo: boolean): string | null {
  if (!form.file && !isDemo) return "Attach an image to submit.";
  if (!form.lat !== !form.lng) return "Enter both latitude and longitude, or leave both blank to use the image's geotag.";
  if (form.lat) {
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) return "Latitude must be a number between -90 and 90.";
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) return "Longitude must be a number between -180 and 180.";
  }
  if (form.ts && Number.isNaN(new Date(form.ts).getTime())) {
    return "Capture time isn't a valid date. Use the format 2026-09-22 14:02.";
  }
  return null;
}

function Field({
  label,
  hint,
  required,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <label htmlFor={htmlFor} className="label" style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
        {label}
        {required ? <span style={{ color: "var(--err-fg)", fontWeight: 500 }}>Required</span> : null}
        {hint ? <span style={{ color: "var(--muted)", fontWeight: 400 }}>{hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

function DemoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="btn btn--pending btn--sm" onClick={onClick}>
      {label}
    </button>
  );
}

"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { SOURCE_META } from "@/components/primitives/SourceChip";
import { Button } from "@/components/primitives/Button";
import type { SourceType } from "@/lib/types";

const STEPS = ["Submitted", "Stored", "Classified"];
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
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 40px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ font: "600 22px/1.2 var(--font-plex-sans)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg)" }}>
          Submit Field Image
        </h1>
        <p style={{ font: "400 13.5px/1.5 var(--font-plex-sans)", color: "var(--muted)", marginTop: 6 }}>
          Every image runs the fire / not-fire check first, then severity scoring. Geotag and
          capture time are required.
        </p>
      </div>

      <div style={{ background: "var(--panel)", border: "1px solid var(--border)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 13 }}>
        <span style={{ font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.16em", color: "var(--muted)" }}>
          Submission flow
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {STEPS.map((step, i) => {
            const active = status === "processing" ? i <= 1 : status === "done" ? true : i === 0;
            return (
              <div
                key={step}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "11px 12px",
                  background: active ? "var(--tint)" : "var(--surface)",
                  border: `1px solid ${active ? "var(--accent-border)" : "var(--border-4)"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: active ? "var(--accent)" : "var(--surface-3)",
                      color: active ? "var(--on-accent)" : "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      font: "700 10px/1 var(--font-plex-mono)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      font: "600 10px/1 var(--font-plex-mono)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: active ? "var(--accent)" : "var(--muted)",
                    }}
                  >
                    {active ? "done" : "pending"}
                  </span>
                </div>
                <span style={{ font: "500 12.5px/1.35 var(--font-plex-sans)", color: "var(--fg-3)" }}>{step}</span>
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 13, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.16em", color: "var(--muted)" }}>
              Input source
            </span>
            <span style={{ font: "400 10px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
              all four methods converge into this pipeline · source is recorded per image
            </span>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {SOURCES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((f) => ({ ...f, source: s }))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 11px",
                  background: form.source === s ? "var(--acc-10)" : "var(--surface-2)",
                  border: form.source === s ? "1px solid var(--accent)" : "1px solid var(--border-3)",
                }}
              >
                <span style={{ font: "700 9px/1 var(--font-plex-mono)", letterSpacing: "0.12em", color: form.source === s ? "var(--accent)" : "var(--fg-4)" }}>
                  {SOURCE_META[s].abbr}
                </span>
                <span style={{ font: "400 12px/1 var(--font-plex-sans)", color: "var(--fg-3)" }}>{SOURCE_META[s].label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
        {error ? (
          <div style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "15px 20px", background: "var(--err-bg)", borderBottom: "1px solid var(--err-border)" }}>
            <div style={{ flex: "none", width: 20, height: 20, background: "var(--hard-stop)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: "700 12px/1 var(--font-plex-mono)" }}>
              !
            </div>
            <div>
              <div style={{ font: "600 11px/1.3 var(--font-plex-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--err-fg)" }}>
                Submission rejected
              </div>
              <div style={{ font: "400 13.5px/1.45 var(--font-plex-sans)", color: "var(--err-fg-2)" }}>{error}</div>
            </div>
          </div>
        ) : null}

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Image">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, fileName: f.fileName || "IMG_4900.jpg" }))}
              style={{
                border: "1px dashed var(--border-4)",
                background: "var(--surface)",
                padding: 26,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                width: "100%",
              }}
            >
              <div style={{ width: 36, height: 28, border: "1px solid var(--border-7)" }} />
              <span style={{ font: "500 13.5px/1 var(--font-plex-sans)", color: "var(--fg-3)" }}>
                {form.fileName || "Click to attach an image"}
              </span>
              <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>JPEG / PNG / MP4</span>
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
            style={{ alignSelf: "flex-start", marginTop: -10, font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}
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
            style={{ alignSelf: "flex-start", marginTop: -10, font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}
          >
            Use current time
          </button>

          <Field label="Notes (optional)">
            <input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Observed conditions, access, hazards"
              style={{ ...inputStyle, font: "400 13.5px/1 var(--font-plex-sans)" }}
            />
          </Field>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "15px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
          <Button variant="solid" onClick={() => handleSubmit()} disabled={status === "processing"}>
            {status === "processing" ? "Processing…" : "Submit"}
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
            {status === "done" && lastRef ? `confirmed · ref ${lastRef}` : ""}
          </span>
        </div>

        {status === "processing" || status === "done" ? (
          <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 11, background: "var(--surface)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--grn-09)", border: "1px solid var(--ok-border)", padding: "9px 12px" }}>
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

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <DemoButton label="Demo: fill valid submission" onClick={() => handleSubmit("valid")} />
        <DemoButton label="Demo: low-confidence result" onClick={() => handleSubmit("low_confidence")} />
        <DemoButton label="Demo: not-a-fire result" onClick={() => handleSubmit("not_fire")} />
        <DemoButton
          label="Demo: submit without geotag"
          onClick={() => {
            setForm((f) => ({ ...f, lat: "", lng: "" }));
            setError("Required — no geotag found in the image EXIF. Enter manually or use device location.");
          }}
        />
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={{ font: "600 10px/1 var(--font-plex-mono)", letterSpacing: "0.16em", color: "var(--muted)" }}>
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
        border: "1px dashed var(--border-2)",
        padding: "10px 13px",
      }}
    >
      {label}
    </button>
  );
}

const inputStyle: CSSProperties = {
  height: 38,
  border: "1px solid var(--border-3)",
  padding: "0 11px",
  font: "400 14px/1 var(--font-plex-mono)",
  color: "var(--fg)",
  background: "var(--input-bg)",
};

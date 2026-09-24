import { describe, expect, it } from "vitest";
import { EMPTY, validate, type FormState } from "../src/lib/submission";

const now = new Date("2026-10-01T12:00:00+10:00");
const jpeg = new File([new Uint8Array(1024)], "fire.jpg", { type: "image/jpeg" });
const form = (patch: Partial<FormState>): FormState => ({ ...EMPTY, file: jpeg, ...patch });

describe("submit form validation", () => {
  it("accepts a complete, sensible submission", () => {
    expect(validate(form({ lat: "-37.62", lng: "145.31", ts: "2026-10-01T11:30", notes: "Smoke over the ridge" }), false, now)).toEqual({});
  });

  it("accepts blank geotag and time (read from EXIF by the backend)", () => {
    expect(validate(form({}), false, now)).toEqual({});
  });

  it("checks the image is there, the right type and not too big", () => {
    expect(validate(form({ file: null }), false, now).file).toMatch(/Attach an image/);
    expect(validate(form({ file: new File(["x"], "doc.pdf", { type: "application/pdf" }) }), false, now).file).toMatch(/JPEG or PNG/);
    expect(validate(form({ file: new File([], "empty.png", { type: "image/png" }) }), false, now).file).toMatch(/empty/);
    const huge = { name: "huge.jpg", type: "image/jpeg", size: 16 * 1024 * 1024 } as File;
    expect(validate(form({ file: huge }), false, now).file).toMatch(/limit is 15 MB/);
  });

  it("wants both coordinates, as plain decimals, inside Victoria", () => {
    expect(validate(form({ lat: "-37.62" }), false, now).lng).toMatch(/longitude too/);
    expect(validate(form({ lat: "abc", lng: "145" }), false, now).lat).toMatch(/decimal number/);
    expect(validate(form({ lat: "1e1", lng: "145" }), false, now).lat).toMatch(/decimal number/);
    expect(validate(form({ lat: "-33.87", lng: "151.21" }), false, now).lng).toMatch(/operating region/); // Sydney
  });

  it("rejects a capture time in the future or more than 30 days back", () => {
    expect(validate(form({ ts: "2026-10-01T13:00" }), false, now).ts).toMatch(/future/);
    expect(validate(form({ ts: "2025-10-01T12:00" }), false, now).ts).toMatch(/30 days/);
  });

  it("limits notes to 1000 characters", () => {
    expect(validate(form({ notes: "x".repeat(1001) }), false, now).notes).toMatch(/1000/);
  });
});

import { describe, expect, it } from "vitest";
import { incidentRef } from "../src/lib/utils/ref";

describe("incidentRef", () => {
  it("turns a UUID into a short, stable INC- reference", () => {
    const id = "01a0c83f-dc02-7345-a9bd-3ac8f9497cab";
    expect(incidentRef(id)).toMatch(/^INC-[0-9A-HJKMNP-TV-Z]{6}$/);
    expect(incidentRef(id)).toBe(incidentRef(id.toUpperCase().toLowerCase()));
  });

  it("gives different incidents different references", () => {
    const refs = new Set(
      Array.from({ length: 500 }, (_, n) => incidentRef(`00000000-0000-4000-8000-${String(n).padStart(12, "0")}`))
    );
    expect(refs.size).toBe(500);
  });

  it("leaves ids that are already short alone", () => {
    expect(incidentRef("INC-2291")).toBe("INC-2291");
  });
});

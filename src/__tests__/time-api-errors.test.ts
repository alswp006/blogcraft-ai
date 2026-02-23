import { describe, it, expect } from "vitest";
import { msToIso, isoNowMs } from "@/lib/time";
import { apiError } from "@/lib/api/errors";

describe("msToIso", () => {
  it("converts epoch 0 to the Unix epoch ISO string", () => {
    expect(msToIso(0)).toBe("1970-01-01T00:00:00.000Z");
  });

  it("converts a known timestamp correctly", () => {
    // 2000-01-01T00:00:00.000Z = 946684800000 ms
    expect(msToIso(946684800000)).toBe("2000-01-01T00:00:00.000Z");
  });
});

describe("isoNowMs", () => {
  it("returns a number close to Date.now()", () => {
    const before = Date.now();
    const result = isoNowMs();
    const after = Date.now();
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after + 1);
    expect(Math.abs(Date.now() - result)).toBeLessThan(2000);
  });
});

describe("apiError", () => {
  it("returns a Response with the correct status and JSON body", async () => {
    const res = apiError(400, { code: "VALIDATION_ERROR", message: "x" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: { code: "VALIDATION_ERROR", message: "x" } });
  });

  it("includes fieldErrors in the body when provided", async () => {
    const res = apiError(422, {
      code: "FIELD_ERROR",
      message: "invalid fields",
      fieldErrors: { email: "Invalid email", name: "Required" },
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.fieldErrors).toEqual({
      email: "Invalid email",
      name: "Required",
    });
  });

  it("sets Content-Type to application/json", () => {
    const res = apiError(500, { code: "INTERNAL", message: "oops" });
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });
});

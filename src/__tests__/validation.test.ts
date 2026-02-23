import { describe, it, expect } from "vitest";
import { validateStringLen, isValidHttpUrl, oneOf } from "@/lib/validation";

describe("validateStringLen", () => {
  it("returns null for valid string within bounds", () => {
    expect(validateStringLen("ab", { min: 1, max: 3 })).toBe(null);
  });

  it("returns error message for empty string when min=1", () => {
    const err = validateStringLen("", { min: 1, max: 3 });
    expect(err).not.toBe(null);
    expect(err).toContain("at least");
    expect(err).toContain("1");
  });

  it("returns error message for string exceeding max length", () => {
    const err = validateStringLen("abcd", { min: 1, max: 3 });
    expect(err).not.toBe(null);
    expect(err).toContain("at most");
    expect(err).toContain("3");
  });

  it("handles singular character correctly", () => {
    const err = validateStringLen("ab", { min: 1, max: 1 });
    expect(err).toContain("1 character");
    expect(err).not.toContain("characters");
  });

  it("handles plural characters correctly", () => {
    const err = validateStringLen("ab", { min: 5 });
    expect(err).toContain("characters");
  });

  it("validates with only min bound", () => {
    expect(validateStringLen("x", { min: 1 })).toBe(null);
    expect(validateStringLen("", { min: 1 })).not.toBe(null);
  });

  it("validates with only max bound", () => {
    expect(validateStringLen("abc", { max: 5 })).toBe(null);
    expect(validateStringLen("abcdef", { max: 5 })).not.toBe(null);
  });
});

describe("isValidHttpUrl", () => {
  it("returns true for valid HTTPS URL", () => {
    expect(isValidHttpUrl("https://example.com/x")).toBe(true);
  });

  it("returns true for valid HTTP URL", () => {
    expect(isValidHttpUrl("http://example.com")).toBe(true);
  });

  it("returns false for FTP URL", () => {
    expect(isValidHttpUrl("ftp://x")).toBe(false);
  });

  it("returns false for non-URL strings", () => {
    expect(isValidHttpUrl("not-a-url")).toBe(false);
  });

  it("returns false for file protocol", () => {
    expect(isValidHttpUrl("file:///path/to/file")).toBe(false);
  });

  it("returns true for URLs with query parameters", () => {
    expect(isValidHttpUrl("https://example.com/path?q=test")).toBe(true);
  });

  it("returns true for URLs with fragments", () => {
    expect(isValidHttpUrl("https://example.com/path#section")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidHttpUrl("")).toBe(false);
  });
});

describe("oneOf", () => {
  it("returns true when value is in allowed array", () => {
    expect(oneOf("draft", ["draft", "generated"])).toBe(true);
  });

  it("returns false when value is not in allowed array", () => {
    expect(oneOf("x", ["draft"])).toBe(false);
  });

  it("returns true for single-element array match", () => {
    expect(oneOf("only", ["only"])).toBe(true);
  });

  it("returns false for empty allowed array", () => {
    expect(oneOf("a", [])).toBe(false);
  });

  it("works with numbers", () => {
    expect(oneOf(1, [1, 2, 3])).toBe(true);
    expect(oneOf(5, [1, 2, 3])).toBe(false);
  });

  it("works with objects (reference equality)", () => {
    const obj1 = { key: "value" };
    const obj2 = { key: "value" };
    expect(oneOf(obj1, [obj1])).toBe(true);
    expect(oneOf(obj2, [obj1])).toBe(false);
  });
});

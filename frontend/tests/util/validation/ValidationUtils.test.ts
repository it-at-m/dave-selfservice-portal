import { describe, expect, test } from "vitest";

import { useValidationUtils } from "../../../src/util/validation/ValidationUtils";

const { isWholeNonNegativeIntegerString } = useValidationUtils();

describe("ValidationUtils - isWholeNonNegativeIntegerString", () => {
  test("returns false for empty string", () => {
    expect(isWholeNonNegativeIntegerString("")).toBe(false);
  });

  test("returns false for string with only spaces", () => {
    expect(isWholeNonNegativeIntegerString("   ")).toBe(false);
  });

  test("accepts single zero", () => {
    expect(isWholeNonNegativeIntegerString("0")).toBe(true);
  });

  test("accepts positive integer strings", () => {
    expect(isWholeNonNegativeIntegerString("42")).toBe(true);
    expect(isWholeNonNegativeIntegerString("007")).toBe(true);
  });

  test("accepts numbers with surrounding whitespace (trimmed)", () => {
    expect(isWholeNonNegativeIntegerString("  5  ")).toBe(true);
  });

  test("rejects negative numbers", () => {
    expect(isWholeNonNegativeIntegerString("-1")).toBe(false);
    expect(isWholeNonNegativeIntegerString("+1")).toBe(false);
  });

  test("rejects decimals and commas", () => {
    expect(isWholeNonNegativeIntegerString("1.0")).toBe(false);
    expect(isWholeNonNegativeIntegerString("1,0")).toBe(false);
  });

  test("rejects alphabetic strings", () => {
    expect(isWholeNonNegativeIntegerString("abc")).toBe(false);
    expect(isWholeNonNegativeIntegerString("12a3")).toBe(false);
  });
});

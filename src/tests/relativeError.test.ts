import { calculateRE } from "../utils/utils";

describe("RE", () => {
  test("should return the correct relative error", () => {
    const expectedValue = { x: 841.8604651162791, y: 681.3953488372093 };
    const receivedValue = { x: 175.18993713542886, y: 1240.5607988862948 };
    const RE = calculateRE(expectedValue, receivedValue);
    expect(RE).toBeCloseTo(0.5, 1);
  });

  test("should return the correct relative error", () => {
    const expectedValue = 841.8604651162791;
    const receivedValue = 175.18993713542886;
    const RE = calculateRE(expectedValue, receivedValue);
    expect(RE).toBeGreaterThan(0.65);
  });

  test("should return the correct relative error", () => {
    const expectedValue = 681.3953488372093;
    const receivedValue = 1240.5607988862948;
    const RE = calculateRE(expectedValue, receivedValue);
    expect(RE).toBeLessThan(0.3);
  });
});

import { Vector } from "matter-js";

export function pickProperties<T>(obj: T, keys: (keyof T)[]): Partial<T> {
  const newObj: Partial<T> = {};
  keys.forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
}

export function calculateRE(expected: number | Vector, received: number | Vector): number {
  if (typeof expected === "number" && typeof received === "number") {
    return Math.abs(expected - received) / (Math.abs(expected) + Math.abs(received) + 1e-6);
  }
  if (expected instanceof Vector && received instanceof Vector) {
    return (
      Math.abs(Vector.magnitude(expected) - Vector.magnitude(received)) /
      (Math.abs(Vector.magnitude(expected)) + Math.abs(Vector.magnitude(received)) + 1e-6)
    );
  }
  return 0;
}

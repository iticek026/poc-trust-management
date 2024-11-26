import { Composite, Vector } from "matter-js";

export function isValue<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

export function isComposite(value: any): value is Composite {
  return value?.type === "composite" && isValue(value);
}

export function isVector(value: any): value is Vector {
  return (
    isValue(value.x) && isValue(value.y) && typeof value.x === "number" && typeof value.y === "number" && isValue(value)
  );
}

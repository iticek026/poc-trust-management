import { Composite } from "matter-js";

export function isValue<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

export function isComposite(value: any): value is Composite {
  return value?.type === "composite" && isValue(value);
}

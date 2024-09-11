import { Vector } from "matter-js";
import { Coordinates } from "../logic/environment/coordinates";

export function isNearFinalDestination(
  start: Coordinates | Vector,
  destination: Coordinates | Vector | null,
  stopDistance = 5,
): boolean {
  if (destination === null) return false;

  const distance = Vector.magnitude(Vector.sub(start, destination));

  return distance < stopDistance;
}

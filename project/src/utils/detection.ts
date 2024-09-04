import Matter, { Vector, Body } from "matter-js";

export function castRay(bodies: Body[], robotPosition: Vector, currentDestination: Vector, rayLength: number) {
  const directionVector = {
    x: currentDestination.x - robotPosition.x,
    y: currentDestination.y - robotPosition.y,
  };

  const normalizedDirection = normalizeVector(directionVector);

  const rayVector = {
    x: normalizedDirection.x * rayLength,
    y: normalizedDirection.y * rayLength,
  };

  const rayStart = robotPosition;

  const rayEnd = {
    x: robotPosition.x + rayVector.x,
    y: robotPosition.y + rayVector.y,
  };

  const collisions = Matter.Query.ray(bodies, rayStart, rayEnd);

  return collisions;
}

function normalizeVector(vector: Vector) {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

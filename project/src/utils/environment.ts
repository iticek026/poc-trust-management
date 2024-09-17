import { Vector } from "matter-js";
import { Entity } from "../logic/common/entity";
import { ObjectSide } from "../logic/common/interfaces/interfaces";
import { Coordinates } from "../logic/environment/coordinates";
import { ROBOT_RADIUS } from "../logic/robot/robot";
import { CELL_SIZE, SCALE_MAP } from "./consts";

export function randomBorderPosition(environmentWidth: number, environmentHeight: number): Coordinates {
  const randomBorder = Math.floor(Math.random() * 4);

  switch (randomBorder) {
    case 0: // Top border
      return new Coordinates(Math.random() * environmentWidth, 0);
    case 1: // Bottom border
      return new Coordinates(Math.random() * environmentWidth, environmentHeight);
    case 2: // Left border
      return new Coordinates(0, Math.random() * environmentHeight);
    case 3: // Right border
      return new Coordinates(environmentWidth, Math.random() * environmentHeight);
    default:
      throw new Error("Invalid border selected");
  }
}

export function getDistancedVertex(edgeIndex: number) {
  let additionalX = 0;
  let additionalY = 0;
  const distance = ROBOT_RADIUS + 35;
  switch (edgeIndex) {
    case 0:
      additionalY = -distance;
      additionalX = -distance;
      break;
    case 1:
      additionalX = distance;
      additionalY = -distance;
      break;
    case 2:
      additionalX = distance;
      additionalY = distance;
      break;
    case 3:
      additionalX = -distance;
      additionalY = distance;
      break;
  }

  return { x: additionalX, y: additionalY };
}

export function adjustCoordinateToGrid(value: number): number {
  return Math.floor((value / CELL_SIZE) * SCALE_MAP);
}

export function revertAdjustedCoordinateFromGrid(value: number): number {
  return (value * CELL_SIZE) / SCALE_MAP;
}

export function getRelativePosition(object: Entity, index: ObjectSide): Vector {
  switch (index) {
    case ObjectSide.Bottom:
      return Vector.create(0, object.getSize().height / 2 + ROBOT_RADIUS + 1);
    case ObjectSide.Top:
      return Vector.create(0, -object.getSize().height / 2 - ROBOT_RADIUS - 1);
    case ObjectSide.Right:
      return Vector.create(object.getSize().width / 2 + ROBOT_RADIUS + 1, 0);
    case ObjectSide.Left:
      return Vector.create(-object.getSize().width / 2 - ROBOT_RADIUS - 1, 0);
  }
}

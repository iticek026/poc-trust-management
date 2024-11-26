import { Vector } from "matter-js";
import { Base } from "./base";
import { ROBOT_RADIUS } from "../robot/robot";

export function calculateRobotsBoundingBox(coordinates: Vector[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const minX = Math.min(...coordinates.map((coordinate) => coordinate.x - ROBOT_RADIUS));
  const maxX = Math.max(...coordinates.map((coordinate) => coordinate.x + ROBOT_RADIUS));
  const minY = Math.min(...coordinates.map((coordinate) => coordinate.y - ROBOT_RADIUS));
  const maxY = Math.max(...coordinates.map((coordinate) => coordinate.y + ROBOT_RADIUS));

  return { minX, maxX, minY, maxY };
}

export function calculateScalingFactor(
  robotsBoundingBox: { minX: number; maxX: number; minY: number; maxY: number },
  base: Base,
): number {
  const robotsWidth = robotsBoundingBox.maxX - robotsBoundingBox.minX;
  const robotsHeight = robotsBoundingBox.maxY - robotsBoundingBox.minY;

  const effectiveBaseWidth = base.getSize().width - 2 * ROBOT_RADIUS;
  const effectiveBaseHeight = base.getSize().height - 2 * ROBOT_RADIUS;

  const widthScale = effectiveBaseWidth / robotsWidth;
  const heightScale = effectiveBaseHeight / robotsHeight;

  return Math.min(widthScale, heightScale);
}

export function mapRobotCoordsToBase(
  robotCoords: Vector,
  base: Base,
  boundingBox: { minX: number; maxX: number; minY: number; maxY: number },
  scale: number,
): Vector {
  const effectiveBaseX = base.getPosition().x - base.getSize().width / 2 + ROBOT_RADIUS;
  const effectiveBaseY = base.getPosition().y - base.getSize().height / 2 + ROBOT_RADIUS;

  const scaledX = (robotCoords.x - boundingBox.minX) * scale;
  const scaledY = (robotCoords.y - boundingBox.minY) * scale;

  const finalX = effectiveBaseX + scaledX;
  const finalY = effectiveBaseY + scaledY;

  return { x: finalX, y: finalY };
}

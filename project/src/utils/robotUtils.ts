import { Vector } from "matter-js";
import { Entity } from "../logic/common/entity";
import { ObjectSide } from "../logic/common/interfaces/interfaces";
import { Coordinates } from "../logic/environment/coordinates";
import { Environment } from "../logic/environment/environment";
import { ROBOT_RADIUS } from "../logic/robot/robot";
import { RandomizerInstance } from "./random/randomizer";

export function randomPointFromOtherSides(environment: Environment, robotPosition: Coordinates): Coordinates {
  const robotX = robotPosition.x;
  const robotY = robotPosition.y;
  const width = environment.size.width;
  const height = environment.size.height;

  const excludedSides: number[] = [];

  if (robotX >= width * 0.9) {
    excludedSides.push(3);
  }
  if (robotX <= width * 0.1) {
    excludedSides.push(2);
  }
  if (robotY >= height * 0.9) {
    excludedSides.push(1);
  }
  if (robotY <= height * 0.1) {
    excludedSides.push(0);
  }

  const availableBorders = [0, 1, 2, 3].filter((b) => !excludedSides.includes(b));

  const randomBorder = availableBorders[Math.floor(RandomizerInstance.random() * availableBorders.length)];

  let randomX = 0,
    randomY = 0;

  switch (randomBorder) {
    case 0:
      randomX = RandomizerInstance.random() * width;
      randomY = 0;

      if (robotX <= width * 0.5) {
        randomX = width * 0.5 + RandomizerInstance.random() * (width * 0.5);
      } else {
        randomX = RandomizerInstance.random() * (width * 0.5);
      }
      break;
    case 1:
      randomX = RandomizerInstance.random() * width;
      randomY = height;
      if (robotX <= width * 0.5) {
        randomX = width * 0.5 + RandomizerInstance.random() * (width * 0.5);
      } else {
        randomX = RandomizerInstance.random() * (width * 0.5);
      }
      break;
    case 2:
      randomX = 0;
      randomY = RandomizerInstance.random() * height;
      if (robotY <= height * 0.5) {
        randomY = height * 0.5 + RandomizerInstance.random() * (height * 0.5);
      } else {
        randomY = RandomizerInstance.random() * (height * 0.5);
      }
      break;
    case 3:
      randomX = width;
      randomY = RandomizerInstance.random() * height;
      if (robotY <= height * 0.5) {
        randomY = height * 0.5 + RandomizerInstance.random() * (height * 0.5);
      } else {
        randomY = RandomizerInstance.random() * (height * 0.5);
      }
      break;
  }

  return new Coordinates(randomX, randomY);
}

export function getObjectMiddleSideCoordinates(object: Entity, side: ObjectSide): Vector {
  const objectPosition = object.getPosition();

  // +1 is added to the halfWidth and halfHeight to avoid overlap
  const halfWidth = object.getSize().width / 2 + 1;
  const halfHeight = object.getSize().height / 2 + 1;

  switch (side) {
    case ObjectSide.Top:
      return Vector.add(objectPosition, Vector.create(0, -ROBOT_RADIUS - halfHeight));
    case ObjectSide.Bottom:
      return Vector.add(objectPosition, Vector.create(0, ROBOT_RADIUS + halfHeight));
    case ObjectSide.Left:
      return Vector.add(objectPosition, Vector.create(-ROBOT_RADIUS - halfWidth, 0));
    case ObjectSide.Right:
      return Vector.add(objectPosition, Vector.create(ROBOT_RADIUS + halfWidth, 0));
  }
}

export function getRobotIds(robotIds?: number[] | Entity[]) {
  if (!robotIds) {
    return [];
  }

  if (typeof robotIds[0] === "number") {
    return robotIds as number[];
  }
  return (robotIds as Entity[]).map((entity) => entity.getId());
}

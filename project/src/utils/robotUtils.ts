import { Coordinates } from "../logic/environment/coordinates";
import { Environment } from "../logic/environment/environment";
import { Robot } from "../logic/robot/robot";

export function randomPointFromOtherSides(
  environment: Environment,
  robot: Robot
): Coordinates {
  const robotX = robot.getPosition().x;
  const robotY = robot.getPosition().y;
  const width = environment.width;
  const height = environment.height;

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

  const availableBorders = [0, 1, 2, 3].filter(
    (b) => !excludedSides.includes(b)
  );

  const randomBorder =
    availableBorders[Math.floor(Math.random() * availableBorders.length)];

  let randomX = 0,
    randomY = 0;

  switch (randomBorder) {
    case 0:
      randomX = Math.random() * width;
      randomY = 0;

      if (robotX <= width * 0.5) {
        randomX = width * 0.5 + Math.random() * (width * 0.5);
      } else {
        randomX = Math.random() * (width * 0.5);
      }
      break;
    case 1:
      randomX = Math.random() * width;
      randomY = height;
      if (robotX <= width * 0.5) {
        randomX = width * 0.5 + Math.random() * (width * 0.5);
      } else {
        randomX = Math.random() * (width * 0.5);
      }
      break;
    case 2:
      randomX = 0;
      randomY = Math.random() * height;
      if (robotY <= height * 0.5) {
        randomY = height * 0.5 + Math.random() * (height * 0.5);
      } else {
        randomY = Math.random() * (height * 0.5);
      }
      break;
    case 3:
      randomX = width;
      randomY = Math.random() * height;
      if (robotY <= height * 0.5) {
        randomY = height * 0.5 + Math.random() * (height * 0.5);
      } else {
        randomY = Math.random() * (height * 0.5);
      }
      break;
  }

  return new Coordinates(randomX, randomY);
}

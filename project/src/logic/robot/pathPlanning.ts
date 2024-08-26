import { Vector, Body } from "matter-js";
import { Direction } from "../../utils/interfaces";
import { Robot } from "./robot";
import { Entity } from "../common/entity";

function planGlobalPath(object: Body, base: Body): Vector[] {
  const path: Vector[] = [];
  let currentPosition = object.position;

  while (Vector.magnitude(Vector.sub(base.position, currentPosition)) > 100) {
    const step = Vector.normalise(Vector.sub(base.position, currentPosition));
    currentPosition = Vector.add(currentPosition, Vector.mult(step, 50)); // Adjust step size as needed
    path.push(currentPosition);
  }

  return path;
}

// function moveRobotsToPosition(robots: Body[], entity: Entity, distanceFromObject: number = 20) {
//   const objectPosition = entity.getPosition();
//   const objectSize = entity.getSize();
//   const objectHalsWidth = objectSize.width / 2;
//   const objectHalfHeight = objectSize.height / 2;

//   // Define the target positions based on the object's bounds
//   const targets = [
//     Vector.add(objectPosition, Vector.create(0, -objectHalfHeight - distanceFromObject)), // UP
//     Vector.add(objectPosition, Vector.create(0, objectHalfHeight + distanceFromObject)), // DOWN
//     Vector.add(objectPosition, Vector.create(-objectHalsWidth - distanceFromObject, 0)), // LEFT
//     Vector.add(objectPosition, Vector.create(objectHalsWidth + distanceFromObject, 0)), // RIGHT
//   ];

//   robots.forEach((robot, index) => {
//     const target = targets[index];
//     const direction = Vector.normalise(Vector.sub(target, robot.position));
//     const moveStep = Vector.mult(direction, 2); // Adjust step size as needed

//     // Move the robot towards the target position
//     Body.setPosition(robot, Vector.add(robot.position, moveStep));
//   });
// }
function adjustRobotPositions(robots: Body[], object: Body, distanceFromObject: number = 40) {
  const objectPosition = object.position;
  const objectBounds = object.bounds;

  const targets = [
    Vector.create(objectPosition.x, objectBounds.min.y - distanceFromObject), // UP
    Vector.create(objectPosition.x, objectBounds.max.y + distanceFromObject), // DOWN
    Vector.create(objectBounds.min.x - distanceFromObject, objectPosition.y), // LEFT
    Vector.create(objectBounds.max.x + distanceFromObject, objectPosition.y), // RIGHT
  ];

  robots.forEach((robot, index) => {
    const target = targets[index];
    const direction = Vector.normalise(Vector.sub(target, robot.position));
    const moveStep = Vector.mult(direction, 2); // Adjust step size as needed

    // Move the robot towards the target position
    Body.setPosition(robot, Vector.add(robot.position, moveStep));
  });
}

function executeSynchronizedPush(robots: Body[], object: Body, base: Body) {
  const targetVector = Vector.normalise(Vector.sub(base.position, object.position));
  const pushForce = Vector.mult(targetVector, 0.001); // Adjust the force as needed

  // Apply force from each robot to the object
  robots.forEach((robot) => {
    Body.applyForce(object, object.position, pushForce);

    // Adjust the robot's position to stay aligned with the object
  });
  adjustRobotPositions(robots, object);
}

function moveRobotToPosition(robot: Body, targetPosition: Vector) {
  // Example: Simple movement toward the target position
  const direction = Vector.normalise(Vector.sub(targetPosition, robot.position));
  const moveStep = Vector.mult(direction, 2); // Move in small steps

  Body.setPosition(robot, Vector.add(robot.position, moveStep));

  // Check if the robot is close enough to the target position
  const distance = Vector.magnitude(Vector.sub(targetPosition, robot.position));
  return distance < 5; // Considered "arrived" if within 5 units
}

function isRobotOnSide(robot: Body, object: Body, direction: Direction, tolerance: number = 10): boolean {
  const offset = Vector.sub(robot.position, object.position);

  switch (direction) {
    case Direction.Up:
      return Math.abs(offset.y + object.bounds.max.y - robot.bounds.min.y) < tolerance;
    case Direction.Down:
      return Math.abs(offset.y - object.bounds.max.y + robot.bounds.min.y) < tolerance;
    case Direction.Left:
      return Math.abs(offset.x + object.bounds.max.x - robot.bounds.min.x) < tolerance;
    case Direction.Right:
      return Math.abs(offset.x - object.bounds.max.x + robot.bounds.min.x) < tolerance;
    default:
      return false;
  }
}

// function areAllRobotsInPosition(robots: Body[], object: Body): boolean {
//   const positions = {
//     up: false,
//     down: false,
//     left: false,
//     right: false,
//   };

//   robots.forEach((robot) => {
//     if (isRobotOnSide(robot, object, Direction.Up)) positions.up = true;
//     if (isRobotOnSide(robot, object, Direction.Down)) positions.down = true;
//     if (isRobotOnSide(robot, object, Direction.Left)) positions.left = true;
//     if (isRobotOnSide(robot, object, Direction.Right)) positions.right = true;
//   });

//   return positions.up && positions.down && positions.left && positions.right;
// }

export function updateSimulation(robots: Robot[], object: Entity, base: Body) {
  // Plan the global path

  const bodies = robots.map((robot) => robot.getBody());

  // Move robots to their positions
  // moveRobotsToPosition(bodies, object);

  //   // Once all robots are in position, execute the synchronized push
  //   if (areAllRobotsInPosition(bodies, object)) {
  // const path = planGlobalPath(object.getBody(), base);
  executeSynchronizedPush(bodies, object.getBody(), base);
  //   }
}

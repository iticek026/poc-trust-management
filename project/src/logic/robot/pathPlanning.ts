import { Vector, Body } from "matter-js";
import { Direction } from "../../utils/interfaces";

function planGlobalPath(object: Body, base: Body): Vector[] {
  const path: Vector[] = [];
  let currentPosition = object.position;

  while (Vector.magnitude(Vector.sub(base.position, currentPosition)) > 5) {
    const step = Vector.normalise(Vector.sub(base.position, currentPosition));
    currentPosition = Vector.add(currentPosition, Vector.mult(step, 50)); // Adjust step size as needed
    path.push(currentPosition);
  }

  return path;
}

function moveRobotsToPosition(robots: Body[], object: Body) {
  const targets = [
    Vector.add(object.position, Vector.create(0, -object.bounds.max.y - 20)), // UP
    Vector.add(object.position, Vector.create(0, object.bounds.max.y + 20)), // DOWN
    Vector.add(object.position, Vector.create(-object.bounds.max.x - 20, 0)), // LEFT
    Vector.add(object.position, Vector.create(object.bounds.max.x + 20, 0)), // RIGHT
  ];

  robots.forEach((robot, index) => {
    const target = targets[index];
    const direction = Vector.normalise(Vector.sub(target, robot.position));
    const moveStep = Vector.mult(direction, 2); // Adjust step size

    Body.setPosition(robot, Vector.add(robot.position, moveStep));

    // Consider robot in position if within a tolerance distance
    const distance = Vector.magnitude(Vector.sub(target, robot.position));
    if (distance < 5) {
      console.log(`Robot ${index} is in position.`);
    }
  });
}

function executeSynchronizedPush(robots: Body[], object: Body, path: Vector[]) {
  let currentIndex = 0;

  function pushStep() {
    if (currentIndex < path.length) {
      const targetPosition = path[currentIndex];

      robots.forEach((robot, index) => {
        // Each robot pushes in sequence, with a small delay
        setTimeout(() => {
          const force = Vector.sub(targetPosition, object.position);
          Body.applyForce(object, object.position, Vector.mult(force, 0.001)); // Adjust force as needed

          if (index === robots.length - 1) {
            currentIndex++; // Move to the next path step after the last robot pushes
          }
        }, index * 100); // Delay each robot's push slightly
      });

      requestAnimationFrame(pushStep);
    } else {
      console.log("Object has reached the base.");
    }
  }

  pushStep(); // Start the pushing sequence
}

// function moveRobotToPosition(robot: Body, targetPosition: Vector) {
//   // Example: Simple movement toward the target position
//   const direction = Vector.normalise(
//     Vector.sub(targetPosition, robot.position)
//   );
//   const moveStep = Vector.mult(direction, 2); // Move in small steps

//   Body.setPosition(robot, Vector.add(robot.position, moveStep));

//   // Check if the robot is close enough to the target position
//   const distance = Vector.magnitude(Vector.sub(targetPosition, robot.position));
//   return distance < 5; // Considered "arrived" if within 5 units
// }

function isRobotOnSide(
  robot: Body,
  object: Body,
  direction: Direction,
  tolerance: number = 10
): boolean {
  const offset = Vector.sub(robot.position, object.position);

  switch (direction) {
    case Direction.Up:
      return (
        Math.abs(offset.y + object.bounds.max.y - robot.bounds.min.y) <
        tolerance
      );
    case Direction.Down:
      return (
        Math.abs(offset.y - object.bounds.max.y + robot.bounds.min.y) <
        tolerance
      );
    case Direction.Left:
      return (
        Math.abs(offset.x + object.bounds.max.x - robot.bounds.min.x) <
        tolerance
      );
    case Direction.Right:
      return (
        Math.abs(offset.x - object.bounds.max.x + robot.bounds.min.x) <
        tolerance
      );
    default:
      return false;
  }
}

function areAllRobotsInPosition(robots: Body[], object: Body): boolean {
  const positions = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  robots.forEach((robot) => {
    if (isRobotOnSide(robot, object, Direction.Up)) positions.up = true;
    if (isRobotOnSide(robot, object, Direction.Down)) positions.down = true;
    if (isRobotOnSide(robot, object, Direction.Left)) positions.left = true;
    if (isRobotOnSide(robot, object, Direction.Right)) positions.right = true;
  });

  return positions.up && positions.down && positions.left && positions.right;
}

function updateSimulation(robots: Body[], object: Body, base: Body) {
  // Plan the global path
  const path = planGlobalPath(object, base);

  // Move robots to their positions
  moveRobotsToPosition(robots, object);

  // Once all robots are in position, execute the synchronized push
  if (areAllRobotsInPosition(robots, object)) {
    executeSynchronizedPush(robots, object, path);
  }
}

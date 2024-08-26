import { Body, Vector } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";
import { Coordinates } from "../../environment/coordinates";
import { Environment } from "../../environment/environment";
import { Direction, ObjectSide, OccupiedSides, RobotState } from "../../../utils/interfaces";
import { Entity } from "../../common/entity";

export interface MovementControllerInterface {
  /**
   * Set movement direction towards the destination or continue moving towards the last set destination
   * @param destination
   */
  move(robot: Robot, destination?: Coordinates): void;

  /**
   * Stops robot movement
   * @param robot
   */
  stop(robot: Robot): void;
}

const ROBOT_SPEED = 10;

export class MovementController implements MovementControllerInterface {
  private destination: Coordinates;

  constructor(environment: Environment) {
    this.destination = this.getRandomBorderPosition(environment.size.width, environment.size.height);
  }

  private updateDestination(destination?: Coordinates) {
    this.destination = destination ?? this.destination;
  }

  public stop(robot: Robot): void {
    Body.setVelocity(robot.getBody(), { x: 0, y: 0 });
    robot.state = RobotState.IDLE;
  }

  public move(robot: Robot, destination?: Coordinates) {
    this.updateDestination(destination);
    const { x: destinationX, y: destinationY } = destination ?? this.destination;

    const direction = {
      x: destinationX - robot.getBody().position.x,
      y: destinationY - robot.getBody().position.y,
    };

    // Normalize the direction vector
    const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

    const stoppingDistance = 5;

    // Check if the robot is close enough to the target to stop moving
    if (distance > stoppingDistance) {
      // Normalize the direction vector
      const normalizedDirection = {
        x: direction.x / distance,
        y: direction.y / distance,
      };

      // Set the robot's velocity towards the target
      const velocity = {
        x: normalizedDirection.x * ROBOT_SPEED,
        y: normalizedDirection.y * ROBOT_SPEED,
      };

      Body.setVelocity(robot.getBody(), velocity);
    } else {
      // Optionally, you can set the velocity to zero to stop the robot completely
      Body.setVelocity(robot.getBody(), { x: 0, y: 0 });
    }
  }

  private getRandomBorderPosition(environmentWidth: number, environmentHeight: number): Coordinates {
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

  // private getNearestSide(robot: Robot, object: Entity): ObjectSide {
  //   const robotPosition = robot.getPosition();
  //   const objectPosition = object.getPosition();
  //   const dx = robotPosition.x - objectPosition.x;
  //   const dy = robotPosition.y - objectPosition.y;

  //   if (Math.abs(dx) > Math.abs(dy)) {
  //     return dx > 0 ? ObjectSide.Right : ObjectSide.Left;
  //   } else {
  //     return dy > 0 ? ObjectSide.Bottom : ObjectSide.Top;
  //   }
  // }

  // public adjustPositionToNearestSide(robot: Robot, object: Entity) {
  //   const side = this.getNearestSide(robot, object);
  //   const halfWidth = object.getSize().width / 2;
  //   const halfHeight = object.getSize().height / 2;

  //   const robotHalfHeight = robot.getSize().height / 2;
  //   const robotHalfWidth = robot.getSize().width / 2;
  //   const objectPosition = object.getPosition();
  //   switch (side) {
  //     case ObjectSide.Top:
  //       this.updateDestination(new Coordinates(objectPosition.x, objectPosition.y - halfHeight - robotHalfHeight));
  //       break;
  //     case ObjectSide.Bottom:
  //       this.updateDestination(new Coordinates(objectPosition.x, objectPosition.y + halfHeight + robotHalfHeight));
  //       break;
  //     case ObjectSide.Left:
  //       this.updateDestination(new Coordinates(objectPosition.x - halfWidth - robotHalfWidth, objectPosition.y));
  //       break;
  //     case ObjectSide.Right:
  //       this.updateDestination(new Coordinates(objectPosition.x + halfWidth + robotHalfWidth, objectPosition.y));
  //       break;
  //   }
  // }

  // Function to determine the primary direction to the base
  // private getPrimaryDirection(object: Body, base: Body): Direction {
  //   const dx = base.position.x - object.position.x;
  //   const dy = base.position.y - object.position.y;

  //   if (Math.abs(dx) > Math.abs(dy)) {
  //     return dx > 0 ? Direction.Right : Direction.Left;
  //   } else {
  //     return dy > 0 ? Direction.Down : Direction.Up;
  //   }
  // }

  // Function to check if the robot is on the correct side to push
  private isOnCorrectSide(robot: Body, pushedObject: Entity, direction: Direction): boolean {
    const object = pushedObject.getBody();

    // TODO Checks are wrong, need to check also y axis
    switch (direction) {
      case Direction.Up:
        return robot.position.y > object.position.y + pushedObject.getSize().height / 2;
      case Direction.Down:
        return robot.position.y < object.position.y - pushedObject.getSize().height / 2;
      case Direction.Left:
        return robot.position.x > object.position.x + pushedObject.getSize().width / 2;
      case Direction.Right:
        return robot.position.x < object.position.x - pushedObject.getSize().width / 2;
    }
  }

  // Function to move the robot to the correct side of the object
  // private moveToCorrectSide(robot: Body, object: Body, direction: Direction) {
  //   const targetPosition: Vector = {
  //     x: object.position.x,
  //     y: object.position.y,
  //   };

  //   switch (direction) {
  //     case Direction.Up:
  //       targetPosition.x = object.position.x;
  //       targetPosition.y =
  //         object.position.y +
  //         (object.bounds.max.y - object.position.y) +
  //         (robot.parts[1].bounds.max.y - robot.position.y) -
  //         1; // Small offset to avoid overlap
  //       break;
  //     case Direction.Down:
  //       targetPosition.x = object.position.x;
  //       targetPosition.y =
  //         object.position.y -
  //         (object.bounds.max.y - object.position.y) -
  //         (robot.parts[1].bounds.max.y - robot.position.y) +
  //         1;
  //       break;
  //     case Direction.Left:
  //       targetPosition.x =
  //         object.position.x +
  //         (object.bounds.max.x - object.position.x) +
  //         (robot.parts[1].bounds.max.x - robot.position.x) -
  //         1;
  //       targetPosition.y = object.position.y;
  //       break;
  //     case Direction.Right:
  //       targetPosition.x =
  //         object.position.x -
  //         (object.bounds.max.x - object.position.x) -
  //         (robot.parts[1].bounds.max.x - robot.position.x) +
  //         1;
  //       targetPosition.y = object.position.y;
  //       break;
  //   }

  //   Body.setPosition(robot, targetPosition);
  // }

  findNearestAvailableSide(robot: Body, object: Body, occupiedSides: OccupiedSides): keyof typeof ObjectSide {
    const objectPosition = object.position;
    const robotPosition = robot.position;

    const distances = {
      Top: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(0, -ROBOT_RADIUS)))),
      Bottom: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(0, ROBOT_RADIUS)))),
      Left: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(-ROBOT_RADIUS, 0)))),
      Right: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(ROBOT_RADIUS, 0)))),
    };

    // Sort sides by distance and find the first unoccupied side
    const sortedSides = Object.keys(distances).sort(
      (a, b) => distances[a as keyof typeof ObjectSide] - distances[b as keyof typeof ObjectSide],
    );

    for (const side of sortedSides) {
      if (!occupiedSides[side as keyof typeof ObjectSide]) {
        return side as keyof typeof ObjectSide;
      }
    }

    // This should not happen if there are exactly four robots
    return sortedSides[0] as keyof typeof ObjectSide;
  }

  moveRobotToAssignedSide(robot: Robot, object: Entity, side: ObjectSide, occupiedSides: OccupiedSides) {
    const objectPosition = object.getPosition();

    // +1 is added to the halfWidth and halfHeight to avoid overlap
    const halfWidth = object.getSize().width / 2 + 1;
    const halfHeight = object.getSize().height / 2 + 1;
    let targetPosition: Vector;

    switch (side) {
      case ObjectSide.Top:
        targetPosition = Vector.add(objectPosition, Vector.create(0, -ROBOT_RADIUS - halfHeight));
        break;
      case ObjectSide.Bottom:
        targetPosition = Vector.add(objectPosition, Vector.create(0, ROBOT_RADIUS + halfHeight));
        break;
      case ObjectSide.Left:
        targetPosition = Vector.add(objectPosition, Vector.create(-ROBOT_RADIUS - halfWidth, 0));
        break;
      case ObjectSide.Right:
        targetPosition = Vector.add(objectPosition, Vector.create(ROBOT_RADIUS + halfWidth, 0));
        break;
    }

    Body.setPosition(robot.getBody(), targetPosition);
    Body.setVelocity(robot.getBody(), { x: 0, y: 0 });

    const distance = Vector.magnitude(Vector.sub(targetPosition, robot.getPosition()));
    if (distance < 5) {
      occupiedSides[side] = true;
      robot.state = RobotState.IDLE;
      console.log(`Robot has taken position at ${side}.`);
    }
  }

  // Function to push the object towards the base
  // pushObject(robot: Body, pushedObject: Entity, base: Body) {
  //   const object = pushedObject.getBody();
  //   const direction = this.getPrimaryDirection(object, base);

  //   if (this.isOnCorrectSide(robot, pushedObject, direction)) {
  //     this.moveToCorrectSide(robot, object, direction);
  //     const force = { x: 0, y: 0 };

  //     switch (direction) {
  //       case Direction.Up:
  //         force.y = -0.03;
  //         break;
  //       case Direction.Down:
  //         force.y = 0.03;
  //         break;
  //       case Direction.Left:
  //         force.x = -0.03;
  //         break;
  //       case Direction.Right:
  //         force.x = 0.03;
  //         break;
  //     }

  //     // Apply the force to the robot to push the object
  //     Body.applyForce(robot, robot.position, force);

  //     // Optionally, apply a small force to the object to simulate pushing
  //     Body.applyForce(object, object.position, force);
  //   } else {
  //     // Move the robot to the correct side of the object
  //     this.moveToCorrectSide(robot, object, direction);
  //   }
  // }
}

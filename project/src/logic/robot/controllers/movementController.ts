import { Body, Vector } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";
import { Coordinates } from "../../environment/coordinates";
import { Environment } from "../../environment/environment";
import { ObjectSide, RobotState } from "../../../utils/interfaces";
import { Entity } from "../../common/entity";
import { OccupiedSides } from "../../simulation/occupiedSidesHandler";

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
      if (!occupiedSides[side as keyof typeof ObjectSide].isOccupied) {
        return side as keyof typeof ObjectSide;
      }
    }

    // This should not happen if there are exactly four robots
    return sortedSides[0] as keyof typeof ObjectSide;
  }

  public executeMovement(robot: Robot, robotSide: ObjectSide) {
    // Execute the turn-based push using the shared trajectory
    robot.planningController.executeTurnBasedPush(robot, robotSide);
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
      occupiedSides[side].isOccupied = true;
      occupiedSides[side].robotId = robot.getId();
      robot.state = RobotState.IDLE;
      console.log(`Robot has taken position at ${side}.`);
    }
  }

  public adjustPositionToNearestSide(robot: Robot, object: Entity, occupiedSides: OccupiedSides) {
    const side = this.findNearestAvailableSide(robot.getBody(), object.getBody(), occupiedSides);
    const halfWidth = object.getSize().width / 2;
    const halfHeight = object.getSize().height / 2;

    const robotHalfHeight = robot.getSize().height / 2;
    const robotHalfWidth = robot.getSize().width / 2;
    const objectPosition = object.getPosition();
    switch (side) {
      case ObjectSide.Top:
        this.updateDestination(new Coordinates(objectPosition.x, objectPosition.y - halfHeight - robotHalfHeight));
        break;
      case ObjectSide.Bottom:
        this.updateDestination(new Coordinates(objectPosition.x, objectPosition.y + halfHeight + robotHalfHeight));
        break;
      case ObjectSide.Left:
        this.updateDestination(new Coordinates(objectPosition.x - halfWidth - robotHalfWidth, objectPosition.y));
        break;
      case ObjectSide.Right:
        this.updateDestination(new Coordinates(objectPosition.x + halfWidth + robotHalfWidth, objectPosition.y));
        break;
    }
  }
}

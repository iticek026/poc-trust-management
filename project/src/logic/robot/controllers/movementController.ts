import { Body } from "matter-js";
import { Robot } from "../robot";
import { Coordinates } from "../../environment/coordinates";
import { Environment } from "../../environment/environment";

export interface MovementControllerInterface {
  /**
   * Set movement direction towards the destination or continue moving towards the last set destination
   * @param destination
   */
  move(robot: Robot, destination?: Coordinates): void;
}

const ROBOT_SPEED = 10;

export class MovementController implements MovementControllerInterface {
  private destination: Coordinates;

  constructor(environment: Environment) {
    this.destination = this.getRandomBorderPosition(
      environment.size.width,
      environment.size.height
    );
  }

  private updateDestination(destination?: Coordinates) {
    this.destination = destination ?? this.destination;
  }

  public move(robot: Robot, destination?: Coordinates) {
    this.updateDestination(destination);
    const { x: destinationX, y: destinationY } =
      destination ?? this.destination;

    const direction = {
      x: destinationX - robot.getBody().position.x,
      y: destinationY - robot.getBody().position.y,
    };

    // Normalize the direction vector
    const distance = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );

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

  private getRandomBorderPosition(
    environmentWidth: number,
    environmentHeight: number
  ): Coordinates {
    const randomBorder = Math.floor(Math.random() * 4);

    switch (randomBorder) {
      case 0: // Top border
        return new Coordinates(Math.random() * environmentWidth, 0);
      case 1: // Bottom border
        return new Coordinates(
          Math.random() * environmentWidth,
          environmentHeight
        );
      case 2: // Left border
        return new Coordinates(0, Math.random() * environmentHeight);
      case 3: // Right border
        return new Coordinates(
          environmentWidth,
          Math.random() * environmentHeight
        );
      default:
        throw new Error("Invalid border selected");
    }
  }
}

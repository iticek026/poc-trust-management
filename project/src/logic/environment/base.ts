import { EntityType } from "../../utils/interfaces";
import { RobotSwarm } from "../robot/swarm";
import { Coordinates } from "./coordinates";
import { EnvironmentObject } from "./environmentObject";
import { Size } from "./interfaces";
import { Robot } from "../robot/robot";

export class Base extends EnvironmentObject {
  constructor(size: Size, coordinates: Coordinates) {
    super(size, false, coordinates, EntityType.BASE, {
      isStatic: true,
      isSensor: true,
      label: "base",
    });
  }

  private isRobotInBase(robot: Robot): boolean {
    const robotBounds = robot.getBody().bounds;
    const baseBounds = this.getBody().bounds;

    return (
      robotBounds.min.x >= baseBounds.min.x &&
      robotBounds.max.x <= baseBounds.max.x &&
      robotBounds.min.y >= baseBounds.min.y &&
      robotBounds.max.y <= baseBounds.max.y
    );
  }

  // Function to count the number of robots inside the base
  countRobotsInBase(swarm: RobotSwarm): number {
    return swarm.robots.filter((robot) => this.isRobotInBase(robot)).length;
  }
}

import { EntityType } from "../common/interfaces/interfaces";
import { RobotSwarm } from "../robot/swarm";
import { Coordinates } from "./coordinates";
import { EnvironmentObject } from "./environmentObject";
import { Size } from "../common/interfaces/size";
import { Entity } from "../common/entity";

export class Base extends EnvironmentObject {
  constructor(size: Size, coordinates: Coordinates) {
    super(size, false, coordinates, EntityType.BASE, {
      isStatic: true,
      isSensor: true,
      label: "base",
    });
  }

  private isEntityInBase(entity: Entity): boolean {
    const entityBounds = entity.getBody().bounds;
    const baseBounds = this.getBody().bounds;

    return (
      entityBounds.min.x >= baseBounds.min.x &&
      entityBounds.max.x <= baseBounds.max.x &&
      entityBounds.min.y >= baseBounds.min.y &&
      entityBounds.max.y <= baseBounds.max.y
    );
  }

  // Function to count the number of robots inside the base
  countRobotsInBase(swarm: RobotSwarm): number {
    return swarm.robots.filter((robot) => this.isEntityInBase(robot)).length;
  }

  isSearchedObjectInBase(object: Entity): boolean {
    return this.isEntityInBase(object);
  }
}

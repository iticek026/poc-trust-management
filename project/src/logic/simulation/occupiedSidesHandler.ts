import { Body, Vector } from "matter-js";
import { Entity } from "../common/entity";
import { OccupiedSides } from "../common/interfaces/occupiedSide";
import { TrustRobot } from "../tms/actors/trustRobot";
import { ObjectSide } from "../common/interfaces/interfaces";
import { ROBOT_RADIUS } from "../robot/robot";
import { RobotSwarm } from "../robot/swarm";

export class OccupiedSidesHandler {
  private occupiedSides: OccupiedSides;

  constructor() {
    this.occupiedSides = {
      Top: { robotId: undefined, isOccupied: false },
      Bottom: { robotId: undefined, isOccupied: false },
      Left: { robotId: undefined, isOccupied: false },
      Right: { robotId: undefined, isOccupied: false },
    };
  }

  public getOccupiedSides(): OccupiedSides {
    return this.occupiedSides;
  }

  public areAllSidesOccupied(requiredNumberOfRobots: number): boolean {
    return Object.values(this.occupiedSides).filter((side) => side.isOccupied).length === requiredNumberOfRobots;
  }

  public releaseSide(side: keyof OccupiedSides): void {
    this.occupiedSides[side] = { robotId: undefined, isOccupied: false };
  }

  public resetSides(): void {
    Object.keys(this.occupiedSides).forEach((side) => {
      this.occupiedSides[side as keyof OccupiedSides] = { robotId: undefined, isOccupied: false };
    });
  }

  public assignSide(objectToPush: Entity, robot: TrustRobot) {
    const nearestSide = this.findNearestAvailableSide(objectToPush.getBody(), this.occupiedSides, robot);

    const side = ObjectSide[nearestSide];
    this.occupySide(side, robot.getId());
    robot.setAssignedSide(side);
  }

  getUnAssignedRobots(swarm: RobotSwarm): TrustRobot[] {
    const sides = Object.values(this.getOccupiedSides()).map((side) => side.robotId);
    return swarm.robots.filter((robot) => !sides.includes(robot.getId()));
  }

  private occupySide(side: keyof OccupiedSides, robotId: number): void {
    if (this.occupiedSides[side].isOccupied) {
      throw new Error(`Side ${side} is already occupied by robot ${this.occupiedSides[side].robotId}`);
    }
    this.occupiedSides[side] = { robotId, isOccupied: true };
  }

  private findNearestAvailableSide(
    object: Body,
    occupiedSides: OccupiedSides,
    robot: TrustRobot,
  ): keyof typeof ObjectSide {
    const objectPosition = object.position;
    const robotPosition = robot.getPosition();

    const distances = {
      Top: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(0, -ROBOT_RADIUS)))),
      Bottom: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(0, ROBOT_RADIUS)))),
      Left: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(-ROBOT_RADIUS, 0)))),
      Right: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(ROBOT_RADIUS, 0)))),
    };

    const sortedSides = Object.keys(distances).sort(
      (a, b) => distances[a as keyof typeof ObjectSide] - distances[b as keyof typeof ObjectSide],
    );

    for (const side of sortedSides) {
      if (!occupiedSides[side as keyof typeof ObjectSide].isOccupied) {
        return side as keyof typeof ObjectSide;
      }
    }

    return sortedSides[0] as keyof typeof ObjectSide;
  }
}

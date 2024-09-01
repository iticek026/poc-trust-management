import { OccupiedSides, RobotId } from "../common/interfaces/occupiedSide";

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

  public occupySide(side: keyof OccupiedSides, robotId: number): void {
    if (this.occupiedSides[side].isOccupied) {
      throw new Error(`Side ${side} is already occupied by robot ${this.occupiedSides[side].robotId}`);
    }
    this.occupiedSides[side] = { robotId, isOccupied: true };
  }

  public releaseSide(side: keyof OccupiedSides): void {
    if (!this.occupiedSides[side].isOccupied) {
      throw new Error(`Side ${side} is not currently occupied`);
    }
    this.occupiedSides[side] = { robotId: undefined, isOccupied: false };
  }

  public findSideByRobot(robotId: RobotId): keyof OccupiedSides | undefined {
    return Object.entries(this.occupiedSides).find(([, obj]) => obj.robotId === robotId)?.[0] as
      | keyof OccupiedSides
      | undefined;
  }

  public resetSides(): void {
    Object.keys(this.occupiedSides).forEach((side) => {
      this.occupiedSides[side as keyof OccupiedSides] = { robotId: undefined, isOccupied: false };
    });
  }
}

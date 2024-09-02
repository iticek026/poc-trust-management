import { EntityType } from "../common/interfaces/interfaces";

export const CELL_SIZE = 30;
const SCALE_MAP = 0.5;

export class EnvironmentGrid {
  private grid: EntityType[][];
  private width: number;
  private height: number;
  private robotsPrevMarks: Map<number, { x: number; y: number }> = new Map();

  constructor(width: number, height: number) {
    this.width = (width / CELL_SIZE) * SCALE_MAP;
    this.height = (height / CELL_SIZE) * SCALE_MAP;
    this.grid = Array.from({ length: height / CELL_SIZE }, () => Array(width / CELL_SIZE).fill(EntityType.FREE)); // 0 means free space, 1 means obstacle
  }

  public markObstacle(x: number, y: number): void {
    if (this.isWithinBounds(x, y)) {
      const xIndex = Math.floor((x / CELL_SIZE) * SCALE_MAP);
      const yIndex = Math.floor((y / CELL_SIZE) * SCALE_MAP);
      this.grid[yIndex][xIndex] = EntityType.OBSTACLE;
    }
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public markRobot(id: number, x: number, y: number): void {
    if (this.isWithinBounds(x, y)) {
      const xIndex = this.adjustCoordinate(x);
      const yIndex = this.adjustCoordinate(y);

      const robotPrevMark = this.robotsPrevMarks.get(id);
      if (robotPrevMark) {
        this.markFree(robotPrevMark.x, robotPrevMark.y);
      }

      this.robotsPrevMarks.set(id, { x: xIndex, y: yIndex });
      this.grid[yIndex][xIndex] = EntityType.ROBOT;
    }
  }

  private markFree(x: number, y: number): void {
    this.grid[y][x] = EntityType.FREE;
  }

  public isObstacle(x: number, y: number): boolean {
    return this.isWithinBounds(x, y) && this.grid[y][x] === EntityType.OBSTACLE;
  }

  private adjustCoordinate(value: number): number {
    return Math.floor((value / CELL_SIZE) * SCALE_MAP);
  }

  public isWithinBounds(x: number, y: number): boolean {
    return (
      this.adjustCoordinate(x) >= 0 &&
      this.adjustCoordinate(x) < this.width &&
      this.adjustCoordinate(y) >= 0 &&
      this.adjustCoordinate(y) < this.height
    );
  }

  public getGrid(): EntityType[][] {
    return this.grid;
  }
}

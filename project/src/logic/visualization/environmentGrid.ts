import { Body, Vector } from "matter-js";
import { Entity } from "../common/entity";
import { EntityType } from "../common/interfaces/interfaces";
import { Robot } from "../robot/robot";
import { Coordinates } from "../environment/coordinates";
import { CELL_SIZE, OBJECT_HEIGTH_IN_TILES, OBJECT_WIDTH_IN_TILES, SCALE_MAP } from "../../utils/consts";
import { adjustCoordinateToGrid } from "../../utils/environment";
import simulationConfig from "../../mockData/robots";

export class EnvironmentGrid {
  private grid: EntityType[][];
  private width: number;
  private height: number;
  private robotsPrevMarks: Map<number, Body> = new Map();
  private prevPath: Coordinates[] = [];

  constructor(width: number, height: number) {
    this.width = (width / CELL_SIZE) * SCALE_MAP;
    this.height = (height / CELL_SIZE) * SCALE_MAP;
    this.grid = Array.from({ length: height / CELL_SIZE }, () => Array(width / CELL_SIZE).fill(EntityType.FREE));
  }

  public markObstacle(obstacle: Entity): void {
    const { x, y } = obstacle.getPosition();
    const adjustedX = adjustCoordinateToGrid(x);
    const adjustedY = adjustCoordinateToGrid(y);

    if (this.isWithinGridBounds(adjustedX, adjustedY)) {
      this.markOccupiedTiles(obstacle.getBody(), EntityType.OBSTACLE);
    }
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public markPath(path: Coordinates[] | null) {
    this.markFreePath();
    if (!path) return;
    path.forEach((coordinate) => {
      const { x, y } = coordinate;
      if (this.isWithinGridBounds(x, y)) {
        this.prevPath.push(coordinate);
        this.grid[y][x] = EntityType.PATH;
      }
    });
  }

  private markOccupiedTiles(mainBody: Body, type: EntityType) {
    const {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
    } = mainBody.bounds;

    const minGridX = Math.floor((minX / CELL_SIZE) * SCALE_MAP);
    const minGridY = Math.floor((minY / CELL_SIZE) * SCALE_MAP);
    const maxGridX = Math.floor((maxX / CELL_SIZE) * SCALE_MAP);
    const maxGridY = Math.floor((maxY / CELL_SIZE) * SCALE_MAP);

    for (let y = minGridY; y <= maxGridY; y++) {
      for (let x = minGridX; x <= maxGridX; x++) {
        if (this.isWithinGridBounds(x, y)) {
          this.grid[y][x] = type;
        }
      }
    }
  }

  public markRobot(robot: Robot): void {
    const x = adjustCoordinateToGrid(robot.getPosition().x);
    const y = adjustCoordinateToGrid(robot.getPosition().y);
    const id = robot.getId();

    if (this.isWithinGridBounds(x, y)) {
      const robotPrevMark = this.robotsPrevMarks.get(id);
      if (robotPrevMark) {
        this.markFree(robotPrevMark);
      }

      this.robotsPrevMarks.set(id, structuredClone(robot.getBody().parts[1]));
      this.markOccupiedTiles(robot.getBody().parts[1], EntityType.ROBOT);
    }
  }

  private markFreePath(): void {
    this.prevPath.forEach((coordinate) => {
      const { x, y } = coordinate;
      if (this.isWithinGridBounds(x, y)) {
        this.grid[y][x] = EntityType.FREE;
      }
    });
  }

  private markFree(body: Body): void {
    this.markOccupiedTiles(body, EntityType.FREE);
  }

  private isWithinGridBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public getGrid(): EntityType[][] {
    return this.grid;
  }

  public canFitObject(position: Vector, widthInTiles: number, heightInTiles: number): boolean {
    const startX = position.x - 1;
    const startY = position.y - 1;

    for (let x = startX; x < startX + widthInTiles; x++) {
      for (let y = startY; y < startY + heightInTiles; y++) {
        if (!this.isWithinGridBounds(x, y) || this.isOccupied(x, y)) {
          return false;
        }
      }
    }
    return true;
  }

  public getNeighbors(position: Vector): Vector[] {
    const { x, y } = position;

    const neighbors: Vector[] = [];

    if (this.canFitObject({ x: x - 1, y }, OBJECT_WIDTH_IN_TILES, OBJECT_HEIGTH_IN_TILES))
      neighbors.push({ x: x - 1, y });
    if (this.canFitObject({ x: x + 1, y }, OBJECT_WIDTH_IN_TILES, OBJECT_HEIGTH_IN_TILES))
      neighbors.push({ x: x + 1, y });
    if (this.canFitObject({ x, y: y - 1 }, OBJECT_WIDTH_IN_TILES, OBJECT_HEIGTH_IN_TILES))
      neighbors.push({ x, y: y - 1 });
    if (this.canFitObject({ x, y: y + 1 }, OBJECT_WIDTH_IN_TILES, OBJECT_HEIGTH_IN_TILES))
      neighbors.push({ x, y: y + 1 });

    return neighbors;
  }

  public isOccupied(x: number, y: number): boolean {
    return this.isWithinGridBounds(x, y) && this.grid[y][x] === EntityType.OBSTACLE;
  }

  getExploredAreaFraction(): number {
    const exploredArea = this.grid
      .flat()
      .filter(
        (cell) => cell === EntityType.EXPLORED || cell === EntityType.OBSTACLE || cell === EntityType.ROBOT,
      ).length;

    return exploredArea / (this.width * this.height);
  }
}

export const EnvironmentGridSingleton = new EnvironmentGrid(
  simulationConfig.environment.width,
  simulationConfig.environment.height,
);

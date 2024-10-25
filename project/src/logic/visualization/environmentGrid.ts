import { Body, Vector } from "matter-js";
import { Entity } from "../common/entity";
import { EntityType } from "../common/interfaces/interfaces";
import { Robot } from "../robot/robot";
import { Coordinates } from "../environment/coordinates";
import { CELL_SIZE, OBJECT_HEIGTH_IN_TILES, OBJECT_WIDTH_IN_TILES, SCALE_MAP } from "../../utils/consts";
import { adjustCoordinateToGrid } from "../../utils/environment";
import { ChangedCell } from "./interfaces";
import { isValue } from "../../utils/checks";
import { ConstantsInstance } from "../tms/consts";

export class EnvironmentGrid {
  private grid!: EntityType[][];
  private width!: number;
  private height!: number;
  private robotsPrevMarks: Map<number, Body> = new Map();
  private prevPath: Coordinates[] = [];
  private changedCells: ChangedCell[] = [];
  private originalHeight!: number;
  private originalWidth!: number;

  setWidthAndHeight(width: number, height: number) {
    this.width = adjustCoordinateToGrid(width);
    this.height = adjustCoordinateToGrid(height);

    this.originalHeight = height;
    this.originalWidth = width;

    this.grid = Array.from({ length: Math.ceil(height / CELL_SIZE) }, () =>
      Array(Math.ceil(width / CELL_SIZE)).fill(EntityType.FREE),
    );
  }

  getOriginalHeight(): number {
    return this.originalHeight;
  }

  getOriginalWidth(): number {
    return this.originalWidth;
  }

  public markObstacle(obstacle: Entity): void {
    const { x, y } = obstacle.getPosition();
    const adjustedX = adjustCoordinateToGrid(x);
    const adjustedY = adjustCoordinateToGrid(y);

    if (this.isWithinGridBounds(adjustedX, adjustedY)) {
      this.changedCells.push(...this.markOccupiedTiles(obstacle.getBody(), EntityType.OBSTACLE));
    }
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public markPath(path: Coordinates[] | null): void {
    this.markFreePath();

    if (!path) return;

    path.forEach((coordinate) => {
      const { x, y } = coordinate;
      if (this.isWithinGridBounds(x, y)) {
        this.prevPath.push(coordinate);
        this.grid[y][x] = EntityType.PATH;
        this.changedCells.push({ x, y, type: EntityType.PATH });
      }
    });
  }

  private markOccupiedTiles(
    mainBody: Body,
    type: EntityType,
    radius?: number,
    condition?: (x: number, y: number) => boolean,
  ): ChangedCell[] {
    const {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
    } = mainBody.bounds;

    const actualRadius = radius ?? 0;

    const minGridX = Math.floor(((minX - actualRadius) / CELL_SIZE) * SCALE_MAP);
    const minGridY = Math.floor(((minY - actualRadius) / CELL_SIZE) * SCALE_MAP);
    const maxGridX = Math.floor(((maxX + actualRadius) / CELL_SIZE) * SCALE_MAP);
    const maxGridY = Math.floor(((maxY + actualRadius) / CELL_SIZE) * SCALE_MAP);

    // const size = Math.abs(Math.min(maxGridX - minGridX, maxGridY - minGridY));

    const changedCells: ChangedCell[] = [];
    for (let y = minGridY; y <= maxGridY; y++) {
      for (let x = minGridX; x <= maxGridX; x++) {
        if (
          this.isWithinGridBounds(x, y) &&
          this.grid[y][x] !== EntityType.OBSTACLE &&
          (condition !== undefined ? condition(x, y) : true)
        ) {
          this.grid[y][x] = type;
          changedCells.push({ x, y, type });
        }
      }
    }

    return changedCells;
  }

  public markRobot(robot: Robot): void {
    const x = adjustCoordinateToGrid(robot.getPosition().x);
    const y = adjustCoordinateToGrid(robot.getPosition().y);
    const id = robot.getId();

    if (this.isWithinGridBounds(x, y)) {
      const robotPrevMark = this.robotsPrevMarks.get(id);
      if (robotPrevMark) {
        this.changedCells.push(...this.markFree(robotPrevMark));
      }

      this.robotsPrevMarks.set(id, structuredClone(robot.getBody()));
      this.changedCells.push(
        ...this.markOccupiedTiles(
          robot.getBody(),
          EntityType.EXPLORED,
          ConstantsInstance.DETECTION_RADIUS,
          (x, y) => this.grid[y][x] !== EntityType.ROBOT,
        ),
      );
      this.changedCells.push(
        ...this.markOccupiedTiles(robot.getBody(), EntityType.ROBOT, 0, (x, y) => this.grid[y][x] !== EntityType.ROBOT),
      );
    }
  }

  private markFreePath(): void {
    this.prevPath.forEach((coordinate) => {
      const { x, y } = coordinate;
      if (this.isWithinGridBounds(x, y)) {
        this.changedCells.push({ x, y, type: EntityType.FREE });
        this.grid[y][x] = EntityType.FREE;
      }
    });
  }

  private markFree(body: Body): ChangedCell[] {
    return this.markOccupiedTiles(body, EntityType.FREE);
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
    if (!isValue(this.grid)) return 0;
    const exploredArea = this.grid
      .flat()
      .filter(
        (cell) =>
          cell === EntityType.EXPLORED ||
          cell === EntityType.OBSTACLE ||
          cell === EntityType.ROBOT ||
          cell === EntityType.PATH,
      ).length;

    return exploredArea / (this.width * this.height);
  }

  reset() {
    this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(EntityType.FREE));
    this.robotsPrevMarks.clear();
    this.prevPath = [];
  }

  getChangedCells(): ChangedCell[] {
    return this.changedCells;
  }

  clearChangedCells(): void {
    this.changedCells = [];
  }
}

export const EnvironmentGridSingleton = new EnvironmentGrid();

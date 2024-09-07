import { Body, Vector } from "matter-js";
import { Entity } from "../common/entity";
import { EntityType } from "../common/interfaces/interfaces";
import { Robot } from "../robot/robot";
import { Coordinates } from "./coordinates";
import { CELL_SIZE, SCALE_MAP } from "../../utils/consts";
import { adjustCoordinateToGrid } from "../../utils/environment";

export class EnvironmentGrid {
  private grid: EntityType[][];
  private width: number;
  private height: number;
  private robotsPrevMarks: Map<number, Body> = new Map();

  constructor(width: number, height: number) {
    this.width = (width / CELL_SIZE) * SCALE_MAP;
    this.height = (height / CELL_SIZE) * SCALE_MAP;
    this.grid = Array.from({ length: height / CELL_SIZE }, () => Array(width / CELL_SIZE).fill(EntityType.FREE)); // 0 means free space, 1 means obstacle
  }

  public markObstacle(obstacle: Entity): void {
    const { x, y } = obstacle.getPosition();

    if (this.isWithinBounds(x, y)) {
      const xIndex = Math.floor((x / CELL_SIZE) * SCALE_MAP);
      const yIndex = Math.floor((y / CELL_SIZE) * SCALE_MAP);
      this.grid[yIndex][xIndex] = EntityType.OBSTACLE;
      this.markOccupiedTiles(obstacle.getBody(), EntityType.OBSTACLE);
    }
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
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
        if (this.isWithinBounds(x, y)) {
          this.grid[y][x] = type;
        }
      }
    }
  }

  public markRobot(robot: Robot): void {
    const x = robot.getPosition().x;
    const y = robot.getPosition().y;
    const id = robot.getId();

    if (this.isWithinBounds(x, y)) {
      const xIndex = adjustCoordinateToGrid(x);
      const yIndex = adjustCoordinateToGrid(y);

      const robotPrevMark = this.robotsPrevMarks.get(id);
      if (robotPrevMark) {
        this.markFree(robotPrevMark);
      }

      this.robotsPrevMarks.set(id, structuredClone(robot.getBody().parts[1]));
      // this.grid[yIndex][xIndex] = EntityType.ROBOT;
      this.markOccupiedTiles(robot.getBody().parts[1], EntityType.ROBOT);
    }
  }

  private markFree(body: Body): void {
    this.markOccupiedTiles(body, EntityType.FREE);
    // this.grid[y][x] = EntityType.FREE;
  }

  public isObstacle(x: number, y: number): boolean {
    return this.isWithinBounds(x, y) && this.grid[y][x] === EntityType.OBSTACLE;
  }

  public isWithinBounds(x: number, y: number): boolean {
    return (
      adjustCoordinateToGrid(x) >= 0 &&
      adjustCoordinateToGrid(x) < this.width &&
      adjustCoordinateToGrid(y) >= 0 &&
      adjustCoordinateToGrid(y) < this.height
    );
  }

  public getGrid(): EntityType[][] {
    return this.grid;
  }

  public getNeighbors(position: Vector): Coordinates[] {
    const { x, y } = position;

    const neighbors: Coordinates[] = [];

    if (this.isWithinBounds(x - 1, y) && !this.isOccupied(x - 1, y)) neighbors.push(new Coordinates(x - 1, y));
    if (this.isWithinBounds(x + 1, y) && !this.isOccupied(x + 1, y)) neighbors.push(new Coordinates(x + 1, y));
    if (this.isWithinBounds(x, y - 1) && !this.isOccupied(x, y - 1)) neighbors.push(new Coordinates(x, y - 1));
    if (this.isWithinBounds(x, y + 1) && !this.isOccupied(x, y + 1)) neighbors.push(new Coordinates(x, y + 1));

    return neighbors;
  }

  public isOccupied(x: number, y: number): boolean {
    return this.isWithinBounds(x, y) && this.grid[y][x] === 1;
  }
}

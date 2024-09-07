import { Vector } from "matter-js";
import { Coordinates } from "../logic/environment/coordinates";
import { adjustCoordinateToGrid } from "./environment";
import { EnvironmentGrid } from "../logic/environment/environmentGrid";

class AStarPathfinder {
  private heuristic(start: Vector, goal: Vector): number {
    return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
  }

  public findPath(start: Vector | undefined, goal: Vector, grid: EnvironmentGrid): Coordinates[] | null {
    if (!start) return null;

    const gridStart = { x: adjustCoordinateToGrid(start.x), y: adjustCoordinateToGrid(start.y) };
    const gridGoal = { x: adjustCoordinateToGrid(goal.x), y: adjustCoordinateToGrid(goal.y) };

    const openSet: Set<string> = new Set([this.coordsToString(gridStart)]);
    const cameFrom: Map<string, string> = new Map();
    const gScore: Map<string, number> = new Map([[this.coordsToString(gridStart), 0]]);
    const fScore: Map<string, number> = new Map([[this.coordsToString(gridStart), this.heuristic(gridStart, goal)]]);

    while (openSet.size > 0) {
      const current = this.getLowestFScore(openSet, fScore);

      if (this.coordsToString(current) === this.coordsToString(gridGoal)) {
        return this.reconstructPath(cameFrom, current);
      }

      openSet.delete(this.coordsToString(current));

      for (const neighbor of grid.getNeighbors(current)) {
        const tentativeGScore = (gScore.get(this.coordsToString(current)) ?? Infinity) + 1;

        if (tentativeGScore < (gScore.get(this.coordsToString(neighbor)) ?? Infinity)) {
          cameFrom.set(this.coordsToString(neighbor), this.coordsToString(current));
          gScore.set(this.coordsToString(neighbor), tentativeGScore);
          fScore.set(this.coordsToString(neighbor), tentativeGScore + this.heuristic(neighbor, goal));

          if (!openSet.has(this.coordsToString(neighbor))) {
            openSet.add(this.coordsToString(neighbor));
          }
        }
      }
    }

    return null;
  }

  private getLowestFScore(openSet: Set<string>, fScore: Map<string, number>): Coordinates {
    let lowest: Coordinates | null = null;
    let lowestFScore = Infinity;

    for (const node of openSet) {
      const [x, y] = node.split(",").map(Number);
      const score = fScore.get(node) || Infinity;

      if (score < lowestFScore) {
        lowestFScore = score;
        lowest = new Coordinates(x, y);
      }
    }

    return lowest!;
  }

  private reconstructPath(cameFrom: Map<string, string>, current: Coordinates): Coordinates[] {
    const totalPath: Coordinates[] = [current];

    while (cameFrom.has(this.coordsToString(current))) {
      const next = cameFrom.get(this.coordsToString(current))!;
      const [x, y] = next.split(",").map(Number);
      current = new Coordinates(x, y);
      totalPath.unshift(current);
    }

    return totalPath;
  }

  private coordsToString(coords: Vector): string {
    return `${coords.x},${coords.y}`;
  }
}

export const Pathfinder = new AStarPathfinder();

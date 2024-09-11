import { Vector } from "matter-js";
import { Coordinates } from "../logic/environment/coordinates";
import { adjustCoordinateToGrid } from "./environment";
import { EnvironmentGrid } from "../logic/visualization/environmentGrid";

/**
 * If MissionState is Planning, if during transporting phase robot detect another object, the A* is run again.
 */
class AStarPathfinder {
  private static heuristic(start: Vector, goal: Vector): number {
    return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
  }

  public static findPath(start: Vector | undefined, goal: Vector, grid: EnvironmentGrid): Coordinates[] | null {
    if (!start) return null;

    const gridStart = { x: adjustCoordinateToGrid(start.x), y: adjustCoordinateToGrid(start.y) };
    const gridGoal = { x: adjustCoordinateToGrid(goal.x), y: adjustCoordinateToGrid(goal.y) };

    const openSet: Set<string> = new Set([AStarPathfinder.coordsToString(gridStart)]);
    const cameFrom: Map<string, string> = new Map();
    const gScore: Map<string, number> = new Map([[AStarPathfinder.coordsToString(gridStart), 0]]);
    const fScore: Map<string, number> = new Map([
      [AStarPathfinder.coordsToString(gridStart), AStarPathfinder.heuristic(gridStart, goal)],
    ]);

    while (openSet.size > 0) {
      const current = AStarPathfinder.getLowestFScore(openSet, fScore);

      if (AStarPathfinder.coordsToString(current) === AStarPathfinder.coordsToString(gridGoal)) {
        return AStarPathfinder.reconstructPath(cameFrom, current);
      }

      openSet.delete(AStarPathfinder.coordsToString(current));

      for (const neighbor of grid.getNeighbors(current)) {
        const tentativeGScore = (gScore.get(AStarPathfinder.coordsToString(current)) ?? Infinity) + 1;

        if (tentativeGScore < (gScore.get(AStarPathfinder.coordsToString(neighbor)) ?? Infinity)) {
          cameFrom.set(AStarPathfinder.coordsToString(neighbor), AStarPathfinder.coordsToString(current));
          gScore.set(AStarPathfinder.coordsToString(neighbor), tentativeGScore);
          fScore.set(
            AStarPathfinder.coordsToString(neighbor),
            tentativeGScore + AStarPathfinder.heuristic(neighbor, goal),
          );

          if (!openSet.has(AStarPathfinder.coordsToString(neighbor))) {
            openSet.add(AStarPathfinder.coordsToString(neighbor));
          }
        }
      }
    }

    return null;
  }

  private static getLowestFScore(openSet: Set<string>, fScore: Map<string, number>): Coordinates {
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

  private static reconstructPath(cameFrom: Map<string, string>, current: Coordinates): Coordinates[] {
    const totalPath: Coordinates[] = [current];

    while (cameFrom.has(AStarPathfinder.coordsToString(current))) {
      const next = cameFrom.get(AStarPathfinder.coordsToString(current))!;
      const [x, y] = next.split(",").map(Number);
      current = new Coordinates(x, y);
      totalPath.unshift(current);
    }

    return totalPath;
  }

  private static coordsToString(coords: Vector): string {
    return `${coords.x},${coords.y}`;
  }
}

export const Pathfinder = AStarPathfinder.findPath;

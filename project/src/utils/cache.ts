import { Entity } from "../logic/common/entity";
import { EnvironmentObject } from "../logic/environment/environmentObject";
import { Robot } from "../logic/robot/robot";

export type CacheValue<T extends Entity> = T;

export class EntityCache {
  robots: Map<number, CacheValue<Robot>> = new Map();
  obstacles: Map<number, CacheValue<EnvironmentObject>> = new Map();

  createCache<T extends Entity>(items: T[]) {
    const cache = new Map();
    items.forEach((item) => {
      cache.set(item.getId(), item);
    });

    return cache;
  }

  getRobotById(id: number): Robot | undefined {
    return this.robots.get(id);
  }

  getObstacleById(id: number): EnvironmentObject | undefined {
    return this.obstacles.get(id);
  }
}

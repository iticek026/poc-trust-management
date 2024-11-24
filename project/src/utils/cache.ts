import { Entity } from "../logic/common/entity";
import { EnvironmentObject } from "../logic/environment/environmentObject";
import { RobotType } from "../logic/tms/actors/interface";
import { TrustRobot } from "../logic/tms/actors/trustRobot";

export type CacheValue<T extends Entity> = T;
type CacheKey = "robots" | "obstacles";

class EntityCache {
  private static instance: EntityCache;
  private cache = new Map<string, Map<number, CacheValue<any>>>();

  public static get Instance() {
    return this.instance || (this.instance = new this());
  }

  createCache<T extends Entity>(items: T[], cacheKey: string) {
    const cache = new Map();
    items.forEach((item) => {
      cache.set(item.getId(), item);
    });

    this.cache.set(cacheKey, cache as Map<number, CacheValue<Entity>>);
  }

  getCache<T extends Entity>(cacheKey: CacheKey): Map<number, CacheValue<T>> {
    return this.cache.get(cacheKey) as Map<number, CacheValue<T>>;
  }

  getRobotById(id: number): TrustRobot | undefined {
    return this.cache.get("robots")?.get(id);
  }

  getObstacleById(id: number): EnvironmentObject | undefined {
    return this.cache.get("obstacles")?.get(id);
  }

  getRobotTypeById(id: number): RobotType {
    return this.getRobotById(id)?.getRobotType() ?? "unknown";
  }

  getMaliciousRobotCount() {
    let count = 0;
    this.getCache<TrustRobot>("robots").forEach((item) => {
      if (item.getRobotType() === "malicious") {
        count++;
      }
    });
    return count;
  }

  retrieveEntitiesByIds(ids: number[]): Entity[] {
    return ids.reduce((acc: Entity[], bodyId) => {
      const entity = this.getRobotById(bodyId) ?? this.getObstacleById(bodyId);

      if (entity) {
        acc.push(entity);
      }

      return acc;
    }, []);
  }

  reset() {
    this.cache.clear();
  }
}

export const EntityCacheInstance = EntityCache.Instance;

import { Engine, Query, Body } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";
import { EntityCacheInstance } from "../../../utils/cache";
import { Entity } from "../../common/entity";
import { EntityType } from "../../common/interfaces/interfaces";
import { Coordinates } from "../../environment/coordinates";

const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

type DetectionResult = { searchedItem: Entity | undefined; obstacles: Entity[] };

export interface DetectionControllerInterface {
  /**
   * Detect nearby objects within a certain radius
   */
  detectNearbyObjects(robot: Robot): DetectionResult;
}

export class DetectionController implements DetectionControllerInterface {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  public detectNearbyObjects(robot: Robot): DetectionResult {
    const detectionRegion = {
      min: {
        x: robot.getBody().position.x - DETECTION_RADIUS,
        y: robot.getBody().position.y - DETECTION_RADIUS,
      },
      max: {
        x: robot.getBody().position.x + DETECTION_RADIUS,
        y: robot.getBody().position.y + DETECTION_RADIUS,
      },
    };

    const nearbyBodies = Query.region(this.engine.world.bodies, detectionRegion);
    const entitiesWithoutRobotItself = nearbyBodies.filter((body) => body.id !== robot.getId()).map((body) => body.id);

    const a = EntityCacheInstance.retrieveEntitiesByIds(entitiesWithoutRobotItself);

    return this.resolveDetectedObjects(a);
  }

  public castRay(robot: Robot, bodies: Body[], destination: Coordinates): Entity[] {
    const { x, y } = destination;
    const collisions = Query.ray(bodies, robot.getPosition(), { x, y }, ROBOT_RADIUS * 2);

    const ids = collisions.map((collision) => collision.bodyB.id);
    return EntityCacheInstance.retrieveEntitiesByIds(ids);
  }

  private resolveDetectedObjects(entities: Entity[]): { searchedItem: Entity | undefined; obstacles: Entity[] } {
    const detectedEntities: DetectionResult = {
      searchedItem: undefined,
      obstacles: [],
    };

    entities?.forEach((object) => {
      if (object.type === EntityType.SEARCHED_OBJECT) {
        detectedEntities.searchedItem = object;
      }

      if (object.type === EntityType.OBSTACLE) {
        detectedEntities.obstacles.push(object);
      }
    });

    return detectedEntities;
  }
}

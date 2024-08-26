import { Engine, Query } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";
import { EntityCache } from "../../../utils/cache";
import { Entity } from "../../common/entity";

const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

export interface DetectionControllerInterface {
  /**
   * Detect nearby objects within a certain radius
   */
  detectNearbyObjects(robot: Robot, cache: EntityCache): Entity[];
}

export class DetectionController implements DetectionControllerInterface {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  public detectNearbyObjects(robot: Robot, cache: EntityCache): Entity[] {
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

    // Query for bodies within the detection region
    const nearbyBodies = Query.region(
      this.engine.world.bodies,
      detectionRegion,
    );

    // Optionally, filter out the robot's own body from the results
    const filteredBodies = nearbyBodies
      .filter((body) => body.id !== robot.getId())
      .map((body) => body.id);

    if (filteredBodies.length === 0) {
      return [];
    }

    return filteredBodies.reduce((acc: Entity[], bodyId) => {
      const entity =
        cache.getRobotById(bodyId) ?? cache.getObstacleById(bodyId);

      if (entity) {
        acc.push(entity);
      }

      return acc;
    }, []);
  }
}

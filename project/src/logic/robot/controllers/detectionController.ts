import { Engine, Query, Body } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";

const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

export interface DetectionControllerInterface {
  /**
   * Detect nearby objects within a certain radius
   */
  detectNearbyObjects(robot: Robot): Body[];
}

export class DetectionController implements DetectionControllerInterface {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  public detectNearbyObjects(robot: Robot): Body[] {
    const detectionRegion = {
      min: {
        x: robot.matterBody.position.x - DETECTION_RADIUS,
        y: robot.matterBody.position.y - DETECTION_RADIUS,
      },
      max: {
        x: robot.matterBody.position.x + DETECTION_RADIUS,
        y: robot.matterBody.position.y + DETECTION_RADIUS,
      },
    };

    // Query for bodies within the detection region
    const nearbyBodies = Query.region(
      this.engine.world.bodies,
      detectionRegion
    );

    // Optionally, filter out the robot's own body from the results
    return nearbyBodies.filter((body) => body.id !== robot.matterBody.id);
  }
}

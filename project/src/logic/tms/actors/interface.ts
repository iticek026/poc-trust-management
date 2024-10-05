import { Entity } from "../../common/entity";
import { RobotUpdateCycle } from "../../robot/controllers/interfaces";
import { TrustService } from "../trustService";

export interface TrustManagementRobotInterface {
  /**
   * Assigns the trust service for managing trust-related interactions.
   *
   * @param trustService - The trust service instance.
   */
  assignTrustService(trustService: TrustService): void;

  /**
   * Retrieves the assigned trust service.
   *
   * @returns The trust service instance.
   */
  getTrustService(): TrustService;

  /**
   * Updates the robot's state based on the current cycle, checking for objects and obstacles.
   *
   * @param args - Update cycle arguments.
   *
   * @returns The found item and detected obstacles.
   */
  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] };
}

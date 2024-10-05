import { Entity } from "../../common/entity";
import { Message } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { DetectionController } from "../../robot/controllers/detectionController";
import { RobotUpdateCycle } from "../../robot/controllers/interfaces";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { RobotWithCommunication } from "../../robot/robotWithCommunication";

import { TrustService } from "../trustService";
import { TrustManagementRobotInterface } from "./interface";

export abstract class TrustRobot extends RobotWithCommunication implements TrustManagementRobotInterface {
  protected trustService?: TrustService;
  protected uncheckedMessages: Message[] = [];

  constructor(
    label: string,
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
  ) {
    super(label, position, movementControllerFactory, detectionControllerFactory, planningControllerFactory);
  }

  assignTrustService(trustService: TrustService) {
    this.trustService = trustService;
  }

  getTrustService(): TrustService {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    return this.trustService;
  }

  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const applyArgs = super.updateCircle(this);
    return applyArgs(args);
  }

  abstract assignCommunicationController(robots: TrustRobot[]): void;
}

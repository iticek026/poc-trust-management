import { getRobotIds } from "../../../utils/robotUtils";
import { Entity } from "../../common/entity";
import { RegularMessageContent, LeaderMessageContent, Message } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { Respose } from "../../robot/controllers/communication/interface";
import { MaliciousCommunicationController } from "../../robot/controllers/communication/maliciousCommunicationController";
import { DetectionController } from "../../robot/controllers/detectionController";
import { RobotUpdateCycle } from "../../robot/controllers/interfaces";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { StateMachineDefinition } from "../../stateMachine/stateMachine";
import { TrustService } from "../trustService";
import { RobotType, TrustManagementRobotInterface } from "./interface";
import { TrustRobot } from "./trustRobot";

export class MaliciousRobot extends TrustRobot implements TrustManagementRobotInterface {
  constructor(
    label: string,
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
    stateMachineDefinition: StateMachineDefinition,
  ) {
    super(
      label,
      position,
      movementControllerFactory,
      detectionControllerFactory,
      planningControllerFactory,
      stateMachineDefinition,
    );
  }

  assignTrustService(trustService: TrustService): void {
    this.trustService = trustService;
  }

  getTrustService(): TrustService {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    return this.trustService;
  }

  protected create(position: Coordinates) {
    return super.create(position, { render: { fillStyle: "red" } });
  }

  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const applyArgs = super.updateCircle(this);
    return applyArgs(args);
  }

  sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent) {
    return this.getCommunicationController()?.sendMessage(receiverId, content);
  }

  receiveMessage(message: Message) {
    return this.communicationController?.receiveMessage(message);
  }

  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): Respose {
    const ids = getRobotIds(robotIds);
    return this.communicationController!.broadcastMessage(content, ids);
  }

  assignCommunicationController(robots: TrustRobot[]): void {
    const robotsWithoutMe = robots.filter((robot) => robot.getId() !== this.getId());
    const communicationController = new MaliciousCommunicationController(this, robotsWithoutMe);
    this.setCommunicationController(communicationController);
  }

  getRobotType(): RobotType {
    return "malicious";
  }
}

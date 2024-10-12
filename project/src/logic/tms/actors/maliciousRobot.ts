import { getRobotIds } from "../../../utils/robotUtils";
import { Entity } from "../../common/entity";
import { RegularMessageContent, LeaderMessageContent, Message, MessageResponse } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { BaseCommunicationControllerInterface, Respose } from "../../robot/controllers/communication/interface";
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
    communicationController: BaseCommunicationControllerInterface,
  ) {
    super(
      label,
      position,
      movementControllerFactory,
      detectionControllerFactory,
      planningControllerFactory,
      stateMachineDefinition,
      communicationController,
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
    return this.communicationController.sendMessage(receiverId, content, this);
  }

  receiveMessage(message: Message) {
    return this.communicationController.receiveMessage(message, this.executeTask.bind(this));
  }

  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): Respose {
    const ids = getRobotIds(robotIds);
    return this.communicationController.broadcastMessage(this, content, ids);
  }

  notifyOtherMembersToMove(searchedObject: Entity): void {
    this.communicationController.notifyOtherMembersToMove(this, searchedObject, false);
  }

  getRobotType(): RobotType {
    return "malicious";
  }

  private executeTask(message: Message): MessageResponse {
    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        break;
      case "CHANGE_BEHAVIOR":
        this.updateState(message.content.payload);
        break;
      case "REPORT_STATUS":
        return;
      default:
        console.log(`Unknown message type: ${message.content.type}`);
    }
  }
}

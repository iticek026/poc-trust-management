import { Vector } from "matter-js";
import { RandomizerInstance } from "../../../utils/random/randomizer";
import { getRobotIds } from "../../../utils/robotUtils";
import { pickProperties } from "../../../utils/utils";
import { Entity } from "../../common/entity";
import { MessageContent, Message, MessageResponse, MessageType } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import {
  BaseCommunicationControllerInterface,
  DataReport,
  Respose,
} from "../../robot/controllers/communication/interface";
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

  sendMessage(receiverId: number, content: MessageContent) {
    return this.communicationController.sendMessage(receiverId, content, this);
  }

  receiveMessage(message: Message) {
    return this.communicationController.receiveMessage(message, this.executeTask.bind(this));
  }

  broadcastMessage(content: MessageContent, robotIds?: number[] | Entity[]): Respose {
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
    const id = this.getId();

    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        break;
      case "CHANGE_BEHAVIOR":
        this.updateState(message.content.payload);
        break;
      case "LOCALIZATION":
        this.move(new Coordinates(message.content.payload.x, message.content.payload.y));
        return {
          id,
          type: MessageType.LOCALIZATION,
          payload: message.content.payload,
        };
      case "REPORT_STATUS":
        return {
          id,
          type: MessageType.REPORT_STATUS,
          payload: this.reportStatus(message.content.payload).data as Vector,
        };
      case "ALREADY_OCCUPIED":
        return;
      default:
        console.log(`Unknown message type: ${message.content.type}`);
    }
  }

  private reportStatus(properties: (keyof DataReport)[]): DataReport {
    const randomizedPosition = RandomizerInstance.randomizePosition(this.getPosition() as Coordinates, [-100, 100]);
    const report = {
      data: randomizedPosition,
      state: this.getState(),
      assignedSide: this.getAssignedSide(),
    };
    return pickProperties(report, [...properties]) as DataReport;
  }
}

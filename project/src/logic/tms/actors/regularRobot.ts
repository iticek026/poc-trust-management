import { Vector } from "matter-js";
import { getRobotIds } from "../../../utils/robotUtils";
import { createContextData, pickProperties } from "../../../utils/utils";
import { Entity } from "../../common/entity";
import { Interaction } from "../../common/interaction";
import { Message, MessageResponse, MessageType, MessageContent } from "../../common/interfaces/task";
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
import { MissionStateHandlerInstance } from "../../simulation/missionStateHandler";
import { StateMachineDefinition } from "../../stateMachine/stateMachine";
import { EnvironmentGridSingleton } from "../../visualization/environmentGrid";
import { createInteractionBasedOnMessage, resolveUncheckedMessaged } from "../trust/utils";
import { TrustService } from "../trustService";
import { RobotType, TrustManagementRobotInterface } from "./interface";
import { TrustRobot } from "./trustRobot";
import { EntityCacheInstance } from "../../../utils/cache";

export class RegularRobot extends TrustRobot implements TrustManagementRobotInterface {
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

  assignTrustService(trustService: TrustService) {
    this.trustService = trustService;
  }

  sendMessage(receiverId: number, content: MessageContent, force: boolean = false) {
    if (this.makeTrustDecision(receiverId, content as MessageContent) || force) {
      return this.communicationController.sendMessage(receiverId, content, this);
    }
  }

  notifyOtherMembersToMove(searchedObject: Entity): void {
    this.communicationController.notifyOtherMembersToMove(this, searchedObject, false);
  }

  receiveMessage(message: Message) {
    const trustDecision = this.makeTrustDecision(message.senderId, message.content as MessageContent);

    const isSenderLeader = EntityCacheInstance.getRobotById(message.senderId)?.getRobotType() === "leader";
    if (message.content.type === MessageType.REPORT_STATUS || trustDecision || isSenderLeader) {
      if (message.content.type === MessageType.MOVE_TO_LOCATION && !message.content.payload.fromLeader) {
        this.uncheckedMessages.push(message);
      }

      return this.communicationController.receiveMessage(message, this.executeTask.bind(this));
    }
  }

  broadcastMessage(content: MessageContent, robotIds?: number[] | Entity[]): Respose {
    const ids = getRobotIds(robotIds);

    console.log(`Robot ${this.label} is broadcasting a message to ${ids}`);
    const responses = this.communicationController.broadcastMessage(this, content, ids);

    const contextData = createContextData(
      content as MessageContent,
      MissionStateHandlerInstance.getContextData(),
      EnvironmentGridSingleton.getExploredAreaFraction(),
    );

    const interactions = responses?.targetRobots.map((robot) => {
      const robotResponse = responses.responses.find((response: MessageResponse) => response?.id === robot.getId());
      return createInteractionBasedOnMessage(this.getId(), robot.getId(), contextData, robotResponse);
    });

    interactions?.forEach((interaction) => this.addInteractionAndUpdateTrust(interaction));

    return responses;
  }

  getTrustService(): TrustService {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    return this.trustService;
  }

  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const applyArgs = super.updateCircle(this);

    const foundObjects = applyArgs(args);

    const resolveOutcomes = resolveUncheckedMessaged(this.uncheckedMessages, this, foundObjects.searchedItem);
    const getResolved = resolveOutcomes.filter((resolved) => resolved.resolved).map((resolved) => resolved.message);
    this.outcomeReactions(getResolved);
    this.updateUnchangedMessages(resolveOutcomes);

    return foundObjects;
  }

  private updateUnchangedMessages(
    outcomes: {
      resolved: boolean;
      message: Message;
    }[],
  ) {
    this.uncheckedMessages = outcomes.filter((outcome) => !outcome.resolved).map((outcome) => outcome.message);
  }

  private makeTrustDecision(peerId: number, message: MessageContent, updateTrust: boolean = true): boolean {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    const contextData = createContextData(
      message,
      MissionStateHandlerInstance.getContextData(),
      EnvironmentGridSingleton.getExploredAreaFraction(),
    );
    return this.trustService.makeTrustDecision(peerId, contextData, updateTrust);
  }

  private addInteractionAndUpdateTrust(interaction: Interaction): void {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    this.trustService.addInteractionAndUpdateTrust(interaction);
  }

  private outcomeReactions(messages: Message[]) {
    messages.forEach((message) => {
      switch (message.content.type) {
        case "MOVE_TO_LOCATION":
          this.move(this.getMovementController().randomDestination());
          break;
        case "REPORT_STATUS":
        case "CHANGE_BEHAVIOR":
        case "LOCALIZATION":
          break;
        default:
          console.log(`Unknown message type: ${message.content.type}`);
      }
    });
  }

  getRobotType(): RobotType {
    return "regular";
  }

  private executeTask(message: Message): MessageResponse {
    const id = this.getId();
    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        const finalDestination = new Coordinates(message.content.payload.x, message.content.payload.y);
        this.move(finalDestination);
        return {
          id,
          type: MessageType.MOVE_TO_LOCATION,
          payload: message.content.payload,
        };
      case "CHANGE_BEHAVIOR":
        this.updateState(message.content.payload);
        return {
          id,
          type: MessageType.CHANGE_BEHAVIOR,
          payload: message.content.payload,
        };
      case "REPORT_STATUS":
        return {
          id,
          type: MessageType.REPORT_STATUS,
          payload: this.reportStatus(message.content.payload).data as Vector,
        };
      case "ALREADY_OCCUPIED":
        this.move(this.getMovementController().randomDestination());
        return {
          id,
          type: MessageType.ALREADY_OCCUPIED,
          payload: undefined,
        };
      case "LOCALIZATION":
        this.move(new Coordinates(message.content.payload.x, message.content.payload.y));
        return {
          id,
          type: MessageType.LOCALIZATION,
          payload: message.content.payload,
        };
      default:
        console.log(`Unknown message type: ${message.content.type}`);
    }
  }

  private reportStatus(properties: (keyof DataReport)[]): DataReport {
    const report = {
      data: this.getPosition(),
      state: this.getState(),
      assignedSide: this.getAssignedSide(),
    };
    return pickProperties(report, [...properties]) as DataReport;
  }
}

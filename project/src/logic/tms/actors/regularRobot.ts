import { EntityCacheInstance } from "../../../utils/cache";
import { isValue } from "../../../utils/checks";
import { getRobotIds } from "../../../utils/robotUtils";
import { createContextData } from "../../../utils/utils";
import { Entity } from "../../common/entity";
import { Interaction } from "../../common/interaction";
import {
  LeaderMessageContent,
  Message,
  MessageResponse,
  MessageType,
  RegularMessageContent,
} from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { Respose } from "../../robot/controllers/communication/interface";
import { RegularCommunicationController } from "../../robot/controllers/communication/regularCommunicationController";
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
import { RobotType } from "./interface";
import { TrustRobot } from "./trustRobot";

export class RegularRobot extends TrustRobot {
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

  assignTrustService(trustService: TrustService) {
    this.trustService = trustService;
  }

  sendMessage(receiverId: number, content: RegularMessageContent | LeaderMessageContent, force: boolean = false) {
    if (this.makeTrustDecision(receiverId, content as RegularMessageContent) || force) {
      return this.getCommunicationController()?.sendMessage(receiverId, content);
    }
  }

  receiveMessage(message: Message) {
    if (
      message.content.type === MessageType.REPORT_STATUS ||
      this.makeTrustDecision(message.senderId, message.content as RegularMessageContent)
    ) {
      if (message.content.type === MessageType.MOVE_TO_LOCATION && !message.content.payload.fromLeader) {
        this.uncheckedMessages.push(message);
      }

      return this.communicationController?.receiveMessage(message);
    }
  }

  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): Respose {
    const ids = getRobotIds(robotIds);

    console.log(`Robot ${this.label} is broadcasting a message to ${ids}`);
    const responses = this.communicationController!.broadcastMessage(content, ids);

    const contextData = createContextData(
      content as RegularMessageContent,
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

  assignCommunicationController(robots: TrustRobot[]): void {
    const robotsWithoutMe = robots.filter((robot) => robot.getId() !== this.getId());
    const communicationController = new RegularCommunicationController(this, robotsWithoutMe);
    this.setCommunicationController(communicationController);
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

  private makeTrustDecision(peerId: number, message: RegularMessageContent, updateTrust: boolean = true): boolean {
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
}

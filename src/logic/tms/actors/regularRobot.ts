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
import { createInteractionBasedOnMessage } from "../trust/utils";
import { TrustService } from "../trustService";
import { RobotType, TrustManagementRobotInterface } from "./interface";
import { TrustRobot } from "./trustRobot";
import { EntityCacheInstance } from "../../../utils/cache";
import { RandomizerInstance } from "../../../utils/random/randomizer";
import { executeTask } from "./taskExecution";
import { Logger } from "../../logger/logger";
import { isValue } from "@/utils/checks";
import { timestamp } from "@/logic/simulation/simulation";

export class RegularRobot extends TrustRobot implements TrustManagementRobotInterface {
  constructor(
    label: string,
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
    stateMachineDefinition: StateMachineDefinition<RegularRobot>,
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
    if (this.makeTrustDecision(receiverId, content as MessageContent, false) || force) {
      return this.communicationController.sendMessage(receiverId, content, this);
    }
  }

  notifyOtherMembersToMove(searchedObject: Entity): void {
    this.communicationController.notifyOtherMembersToMove(this, searchedObject, false);
  }

  receiveMessage(message: Message) {
    const trustDecision =
      this.getId() === message.senderId || this.makeTrustDecision(message.senderId, message.content as MessageContent);

    const senderRoboType = EntityCacheInstance.getRobotById(message.senderId)?.getRobotType();
    const isSenderLeader = senderRoboType === "leader";

    this.receivedMessages.push({
      isFromMalicious: senderRoboType === "malicious",
      wasAccepted: !(this.getId() === message.senderId) && trustDecision,
      timestamp: timestamp,
    });

    if (message.content.type === MessageType.REPORT_STATUS || trustDecision || isSenderLeader) {
      if (message.content.type === MessageType.MOVE_TO_LOCATION && !message.content.payload.fromLeader) {
        this.uncheckedMessages.push(message);
      }

      return this.communicationController.receiveMessage(message, this.executeTask.bind(this));
    }
  }

  askLeaderToNotifyMembersToMove(searchedObject: Entity): void {
    this.communicationController.askLeaderToNotifyMembersToMove(this, searchedObject);
  }

  broadcastMessage(content: MessageContent, robotIds?: number[] | Entity[]): Respose {
    const ids = getRobotIds(robotIds)?.filter((id) => id !== this.getId());

    if (isValue(ids)) {
      const robots = EntityCacheInstance.retrieveEntitiesByIds(ids);
      Logger.logBroadcast(this, robots as TrustRobot[]);
    }

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
    this.actionsBasedOnUnresolvedMessages(foundObjects.searchedItem);
    return foundObjects;
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

  getRobotType(): RobotType {
    return "regular";
  }

  private executeTask(message: Message): MessageResponse {
    return executeTask(this, message);
  }

  public reportStatus(properties: (keyof DataReport)[]): DataReport {
    const randomizedPosition = RandomizerInstance.randomizePosition(this.getPosition() as Coordinates, [-200, 200]);
    const report = {
      data: randomizedPosition,
      state: this.getState(),
      assignedSide: this.getActualAssignedSide(),
    };
    return pickProperties(report, [...properties]) as DataReport;
  }
}

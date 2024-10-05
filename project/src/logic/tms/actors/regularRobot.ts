import { EntityCacheInstance } from "../../../utils/cache";
import { isValue } from "../../../utils/checks";
import { getRobotIds } from "../../../utils/robotUtils";
import { createContextData } from "../../../utils/utils";
import { Entity } from "../../common/entity";
import { Interaction } from "../../common/interaction";
import { LeaderMessageContent, Message, MessageType, RegularMessageContent } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { Respose, TaskResponse } from "../../robot/controllers/communication/interface";
import { RegularCommunicationController } from "../../robot/controllers/communication/regularCommunicationController";
import { DetectionController } from "../../robot/controllers/detectionController";
import { RobotUpdateCycle } from "../../robot/controllers/interfaces";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { MissionStateHandlerInstance } from "../../simulation/missionStateHandler";
import { EnvironmentGridSingleton } from "../../visualization/environmentGrid";
import { ContextInformation } from "../trust/contextInformation";
import { TrustService } from "../trustService";
import { TrustRobot } from "./trustRobot";

export class RegularRobot extends TrustRobot {
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
      return this.communicationController?.receiveMessage(message);
    }
  }

  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): Respose {
    const ids = getRobotIds(robotIds);

    console.log(`Robot ${this.getId()} is broadcasting a message to ${ids}`);
    const responses = this.communicationController!.broadcastMessage(content, ids);

    const contextData = createContextData(
      content as RegularMessageContent,
      MissionStateHandlerInstance.getContextData(),
      EnvironmentGridSingleton.getExploredAreaFraction(),
    );
    const interactions = responses?.targetRobots.map((robot) => {
      const robotResponse = responses.responses.find((response: TaskResponse) => response?.id === robot.getId());
      return new Interaction({
        fromRobotId: this.getId(),
        toRobotId: robot.getId(),
        outcome: isValue(robotResponse),
        context: new ContextInformation(contextData),
        receivedValue: robotResponse?.data,
        expectedValue: EntityCacheInstance.getRobotById(robot.getId())?.getPosition(),
      });
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
    const communicationController = new RegularCommunicationController(this, robots);
    this.setCommunicationController(communicationController);
  }

  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const applyArgs = super.updateCircle(this);
    return applyArgs(args);
  }

  private makeTrustDecision(peerId: number, message: RegularMessageContent): boolean {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    const contextData = createContextData(
      message,
      MissionStateHandlerInstance.getContextData(),
      EnvironmentGridSingleton.getExploredAreaFraction(),
    );
    return this.trustService.makeTrustDecision(peerId, contextData);
  }

  private addInteractionAndUpdateTrust(interaction: Interaction): void {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    this.trustService.addInteractionAndUpdateTrust(interaction);
  }
}
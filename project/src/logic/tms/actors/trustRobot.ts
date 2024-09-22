import { EntityCacheInstance } from "../../../utils/cache";
import { isValue } from "../../../utils/checks";
import { createContextData } from "../../../utils/utils";
import { Entity } from "../../common/entity";
import { Interaction } from "../../common/interaction";
import { LeaderMessageContent, Message, MessageType, RegularMessageContent } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { CommunicationControllerInterface, TaskResponse } from "../../robot/controllers/communication/interface";
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

export class TrustRobot extends Robot implements CommunicationControllerInterface {
  protected trustService?: TrustService;
  protected uncheckedMessages: Message[] = [];

  constructor(
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
  ) {
    super(position, movementControllerFactory, detectionControllerFactory, planningControllerFactory);
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
    // TODO change just for leader status command
    if (
      message.content.type === MessageType.REPORT_STATUS ||
      this.makeTrustDecision(message.senderId, message.content as RegularMessageContent)
    ) {
      return this.communicationController?.receiveMessage(message);
    }
  }

  private getRobotIds(robotIds?: number[] | Entity[]) {
    if (!robotIds) {
      return [];
    }

    if (typeof robotIds[0] === "number") {
      return robotIds as number[];
    }
    return (robotIds as Entity[]).map((entity) => entity.getId());
  }

  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): void {
    const ids = this.getRobotIds(robotIds);

    const responses = this.communicationController!.broadcastMessage(content, ids);

    const contextData = createContextData(
      content.type as MessageType,
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
        receivedValue: robotResponse?.position,
        expectedValue: EntityCacheInstance.getRobotById(robot.getId())?.getPosition(),
      });
    });

    interactions?.forEach((interaction) => this.addInteractionAndUpdateTrust(interaction));

    console.log(`Robot ${this.getId()} broadcasted message:`, interactions);
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

  public makeTrustDecision(peerId: number, message: RegularMessageContent): boolean {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    const contextData = createContextData(
      message.type,
      MissionStateHandlerInstance.getContextData(),
      EnvironmentGridSingleton.getExploredAreaFraction(),
    );
    return this.trustService.makeTrustDecision(peerId, contextData);
  }

  public addInteractionAndUpdateTrust(interaction: Interaction): void {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    this.trustService.addInteractionAndUpdateTrust(interaction);
  }
}

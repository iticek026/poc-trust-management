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
import { EnvironmentContextData, RobotContextData } from "../interfaces";
import { ContextInformation } from "../trust/contextInformation";
import { TrustService } from "../trustService";
import { AuthorityInstance } from "./authority";
import { LeaderRobot } from "./leaderRobot";

export class TrustRobot extends Robot implements CommunicationControllerInterface {
  protected trustService: TrustService;
  protected uncheckedMessages: Message[] = [];

  constructor(
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
    leaderRobot: LeaderRobot | null,
  ) {
    super(position, movementControllerFactory, detectionControllerFactory, planningControllerFactory);
    this.trustService = new TrustService(this.id, AuthorityInstance, leaderRobot);
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

  broadcastMessage(content: RegularMessageContent | LeaderMessageContent, robotIds?: number[] | Entity[]): void {
    const ids = robotIds ? (robotIds as Entity[]).map((robot) => robot.getId()) : robotIds;

    const responses = this.communicationController!.broadcastMessage(content, ids);

    const contextData = this.createContextData(content as RegularMessageContent);
    const interactions = responses?.targetRobots.map(
      (robot) =>
        new Interaction({
          fromRobotId: this.getId(),
          toRobotId: robot.getId(),
          outcome: responses.responses.some((response: TaskResponse) => response?.id === robot.getId()),
          context: new ContextInformation(contextData),
        }),
    );

    interactions?.forEach((interaction) => this.updateTrust(interaction));

    console.log(`Robot ${this.getId()} broadcasted message:`, interactions);
  }

  getTrustService(): TrustService {
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

  private createContextData(message: RegularMessageContent) {
    const missionContextData = MissionStateHandlerInstance.getContextData();
    const environmentContextData: EnvironmentContextData = {
      exploredAreaFraction: EnvironmentGridSingleton.getExploredAreaFraction(),
    };
    const robotContextData: RobotContextData = {
      sensitivityLevel: message.type === MessageType.LOCALIZATION ? 0.2 : 0,
    };

    return {
      missionContextData,
      environmentContextData,
      robotContextData,
    };
  }

  public makeTrustDecision(peerId: number, message: RegularMessageContent): boolean {
    const contextData = this.createContextData(message);
    return this.trustService.makeTrustDecision(peerId, contextData);
  }

  public updateTrust(interaction: Interaction): void {
    this.trustService.updateTrust(interaction);
  }
}

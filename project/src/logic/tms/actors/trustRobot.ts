import { Interaction } from "../../common/interaction";
import { MessageType, RegularMessageContent } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { RegularCommunicationController } from "../../robot/controllers/communication/regularCommunicationController";
import { DetectionController } from "../../robot/controllers/detectionController";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { MissionStateHandlerInstance } from "../../simulation/missionStateHandler";
import { EnvironmentGridSingleton } from "../../visualization/environmentGrid";
import { EnvironmentContextData, RobotContextData } from "../interfaces";
import { TrustService } from "../trustService";
import { AuthorityInstance } from "./authority";
import { LeaderRobot } from "./leaderRobot";

export class TrustRobot extends Robot {
  protected trustService: TrustService;

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

  getTrustService(): TrustService {
    return this.trustService;
  }

  assignCommunicationController(robots: Robot[]): void {
    const communicationController = new RegularCommunicationController(this, robots);
    super.setCommunicationController(communicationController);
  }

  public makeTrustDecision(peerId: number, message: RegularMessageContent): boolean {
    const missionContextData = MissionStateHandlerInstance.getContextData();
    const environmentContextData: EnvironmentContextData = {
      exploredAreaFraction: EnvironmentGridSingleton.getExploredAreaFraction(),
    };
    const robotContextData: RobotContextData = {
      sensitivityLevel: message.type === MessageType.LOCALIZATION ? 0.2 : 0,
    };

    const contextData = {
      missionContextData,
      environmentContextData,
      robotContextData,
    };

    return this.trustService.makeTrustDecision(peerId, contextData);
  }

  public updateTrust(interaction: Interaction): void {
    this.trustService.updateTrust(interaction);
  }
}

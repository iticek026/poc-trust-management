import { isValue } from "../../../utils/checks";
import { Entity } from "../../common/entity";
import { Interaction } from "../../common/interaction";
import { RobotState } from "../../common/interfaces/interfaces";
import { Message, MessageResponse, MessageContent } from "../../common/interfaces/task";
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
import { ContextData } from "../interfaces";
import { ContextInformation } from "../trust/contextInformation";

import { TrustService } from "../trustService";
import { RobotType, TrustManagementRobotInterface } from "./interface";

export abstract class TrustRobot extends Robot implements TrustManagementRobotInterface {
  protected trustService?: TrustService;
  protected uncheckedMessages: Message[] = [];
  private observations: Map<number, boolean[]> = new Map();

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

    communicationController.addRobot(this);
  }

  assignTrustService(trustService: TrustService) {
    this.trustService = trustService;
  }

  getTrustService(): TrustService {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }
    return this.trustService;
  }

  isPartOfTransporting(): boolean {
    return this.getState() === RobotState.TRANSPORTING || this.getState() === RobotState.PLANNING;
  }

  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const applyArgs = super.updateCircle(this);
    return applyArgs(args);
  }

  addObservation(robotId: number, observation: boolean) {
    if (!this.observations.has(robotId)) {
      this.observations.set(robotId, []);
    }
    this.observations.get(robotId)!.push(observation);
  }

  observationsToInteractions(): void {
    const contextData: ContextData = {
      ...MissionStateHandlerInstance.getContextData(),
      exploredAreaFraction: EnvironmentGridSingleton.getExploredAreaFraction(),
      sensitivityLevel: 0,
    };

    this.observations.forEach((observations, peerId) => {
      if (observations.length === 0) return;
      const interaction = new Interaction({
        fromRobotId: this.getId(),
        toRobotId: peerId,
        observedBehaviors: observations,
        outcome:
          isValue(observations) && observations.length > 0
            ? observations.reduce((acc, curr) => acc + (curr ? 1 : 0), 0) > observations.length! / 1.5
            : null,
        context: new ContextInformation(contextData),
      });

      this.getTrustService().addInteractionAndUpdateTrust(interaction);

      this.observations.set(peerId, []);
    });
  }

  abstract getRobotType(): RobotType;
  abstract receiveMessage(message: Message): MessageResponse;
  abstract sendMessage(receiverId: number, content: MessageContent, force: boolean): MessageResponse;
  abstract broadcastMessage(content: MessageContent, robotIds?: number[] | Entity[]): Respose;
  abstract notifyOtherMembersToMove(searchedObject: Entity): void;
  abstract reportStatus(properties: (keyof DataReport)[]): DataReport;
}

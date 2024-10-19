import { isValue } from "../../../utils/checks";
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
import { BaseCommunicationControllerInterface, Respose } from "../../robot/controllers/communication/interface";
import { DetectionController } from "../../robot/controllers/detectionController";
import { RobotUpdateCycle } from "../../robot/controllers/interfaces";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { MissionStateHandlerInstance } from "../../simulation/missionStateHandler";
import { StateMachineDefinition } from "../../stateMachine/stateMachine";
import { EnvironmentGridSingleton } from "../../visualization/environmentGrid";
import { ContextInformation } from "../trust/contextInformation";

import { TrustService } from "../trustService";
import { RobotType, TrustManagementRobotInterface } from "./interface";

export abstract class TrustRobot extends Robot implements TrustManagementRobotInterface {
  protected trustService?: TrustService;
  protected uncheckedMessages: Message[] = [];
  protected observations: Map<number, boolean[]> = new Map();
  protected communicationController: BaseCommunicationControllerInterface;

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
    );

    this.communicationController = communicationController;
    this.communicationController.addRobot(this);
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
    const contextData = createContextData(
      { type: MessageType.OBSERVATION, payload: undefined },
      MissionStateHandlerInstance.getContextData(),
      EnvironmentGridSingleton.getExploredAreaFraction(),
    );

    this.observations.forEach((observations, peerId) => {
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

  abstract sendMessage(
    receiverId: number,
    content: RegularMessageContent | LeaderMessageContent,
    force: boolean,
  ): MessageResponse;

  abstract broadcastMessage(
    content: RegularMessageContent | LeaderMessageContent,
    robotIds?: number[] | Entity[],
  ): Respose;

  abstract notifyOtherMembersToMove(searchedObject: Entity): void;
}

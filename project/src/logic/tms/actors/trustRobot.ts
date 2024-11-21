import { ReceiveMessagesAnalyticsData } from "@/logic/analytics/interfaces";
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
import { resolveUncheckedMessaged } from "../trust/utils";

import { TrustService } from "../trustService";
import { RobotType, TrustManagementRobotInterface } from "./interface";

export abstract class TrustRobot extends Robot implements TrustManagementRobotInterface {
  protected trustService?: TrustService;
  protected uncheckedMessages: Message[] = [];
  private observations: Map<number, boolean[]> = new Map();
  public receivedMessages: ReceiveMessagesAnalyticsData = [];

  constructor(
    label: string,
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
    stateMachineDefinition: StateMachineDefinition<any>,
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

  getReputation(): number {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }

    return this.trustService?.getReputationFromAuthority(this.getId());
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
          isValue(observations) && observations.length > 0 ? observations.filter((item) => !item).length === 0 : null,
        context: new ContextInformation(contextData),
      });

      this.getTrustService().addInteractionAndUpdateTrust(interaction);

      this.observations.set(peerId, []);
    });
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

  private updateUnchangedMessages(
    outcomes: {
      resolved: boolean;
      message: Message;
    }[],
  ) {
    this.uncheckedMessages = outcomes.filter((outcome) => !outcome.resolved).map((outcome) => outcome.message);
  }

  protected actionsBasedOnUnresolvedMessages(searchedItem?: Entity) {
    const resolveOutcomes = resolveUncheckedMessaged(this.uncheckedMessages, this, searchedItem);
    const getResolved = resolveOutcomes.filter((resolved) => resolved.resolved).map((resolved) => resolved.message);
    this.outcomeReactions(getResolved);
    this.updateUnchangedMessages(resolveOutcomes);
  }

  abstract getRobotType(): RobotType;
  abstract receiveMessage(message: Message): MessageResponse;
  abstract sendMessage(receiverId: number, content: MessageContent, force: boolean): MessageResponse;
  abstract broadcastMessage(content: MessageContent, robotIds?: number[] | Entity[]): Respose;
  abstract notifyOtherMembersToMove(searchedObject: Entity): void;
  abstract reportStatus(properties: (keyof DataReport)[]): DataReport;
}

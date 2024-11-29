import { isValue } from "@/utils/checks";
import { Entity } from "../../common/entity";
import { EventEmitter, SimulationEvents, SimulationEventsEnum } from "../../common/eventEmitter";
import { RobotState } from "../../common/interfaces/interfaces";
import { MessageType } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { BaseCommunicationControllerInterface } from "../../robot/controllers/communication/interface";
import { DetectionController } from "../../robot/controllers/detectionController";
import { RobotUpdateCycle } from "../../robot/controllers/interfaces";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { OccupiedSidesHandler } from "../../simulation/occupiedSidesHandler";
import { StateMachineDefinition } from "../../stateMachine/stateMachine";
import { RobotType } from "./interface";
import { RegularRobot } from "./regularRobot";
import { TrustRobot } from "./trustRobot";

export class LeaderRobot extends RegularRobot {
  private eventEmitter: EventEmitter<SimulationEvents>;

  private sendRobotId: number | null = null;

  constructor(
    label: string,
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
    stateMachineDefinition: StateMachineDefinition<RegularRobot>,
    communicationController: BaseCommunicationControllerInterface,
    eventEmitter: EventEmitter<SimulationEvents>,
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

    this.eventEmitter = eventEmitter;
    this.eventEmitter.on(SimulationEventsEnum.INSUFFICICENT_ROBOTS, () => {
      if (!this.isActive) return;
      const base = this.planningController.getBase();
      this.broadcastMessage({ type: MessageType.CHANGE_BEHAVIOR, payload: RobotState.RETURNING_HOME });
      this.updateState(RobotState.RETURNING_HOME);
      this.move(base.getPosition() as Coordinates);
    });
  }

  notifyOtherMembersToMove(searchedObject: Entity): void {
    this.communicationController.notifyOtherMembersToMove(this, searchedObject, true);
  }

  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const foundObjects = super.update(args);

    return foundObjects;
  }

  resetSendRobotId(): void {
    this.sendRobotId = null;
  }

  sendMostTrustedAvailableMemberToObject(searchedObject: Entity, occupiedSidesHandler: OccupiedSidesHandler): boolean {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }

    if (
      isValue(this.sendRobotId) &&
      this.trustService.getActiveRobotFromAuthority().find((robot) => robot.id === this.sendRobotId)
    ) {
      return true;
    }

    const sides = Object.values(occupiedSidesHandler.getOccupiedSides()).map((side) => side.robotId);
    const historyWitoutAssigned = Array.from(this.trustService.getActiveRobotFromAuthority()).filter(
      (robot) => !sides.includes(robot.id),
    );

    if (historyWitoutAssigned.length === 0) {
      return false;
    }
    const maxTrusted = historyWitoutAssigned.reduce((prev, curr) => (curr.reputation > prev.reputation ? curr : prev));

    this.sendRobotId = maxTrusted.id;

    const searchedObjectPosition = searchedObject.getPosition();
    this.communicationController.sendMessage(
      maxTrusted.id,
      {
        type: MessageType.LOCALIZATION,
        payload: { x: searchedObjectPosition.x, y: searchedObjectPosition.y, fromLeader: true },
      },
      this,
    );

    return historyWitoutAssigned.length > 0;
  }

  sendMostTrustedRobotsToObject(targetRobots: TrustRobot[], threshold: number, searchedObject: Entity): void {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }

    const activeRobots = targetRobots.map((robot) => ({
      id: robot.getId(),
      reputation: this.trustService!.getReputationFromAuthority(robot.getId()),
    }));
    const robotsIdsToSend = activeRobots
      .sort((a, b) => b.reputation - a.reputation)
      .filter((robot) => robot.reputation > threshold)
      .map((robot) => robot.id);

    const searchedObjectPosition = searchedObject.getPosition();
    this.communicationController.broadcastMessage(
      this,
      {
        type: MessageType.LOCALIZATION,
        payload: { x: searchedObjectPosition.x, y: searchedObjectPosition.y, fromLeader: true },
      },
      robotsIdsToSend,
    );
  }

  getRobotType(): RobotType {
    return "leader";
  }
}

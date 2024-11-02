import { Entity } from "../../common/entity";
import { EventEmitter, SimulationEvents, SimulationEventsEnum } from "../../common/eventEmitter";
import { RobotState } from "../../common/interfaces/interfaces";
import { MessageType, MessageContent } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { BaseCommunicationControllerInterface } from "../../robot/controllers/communication/interface";
import { DetectionController } from "../../robot/controllers/detectionController";
import { RobotUpdateCycle } from "../../robot/controllers/interfaces";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { OccupiedSidesHandler } from "../../simulation/occupiedSidesHandler";
import { StateMachineDefinition } from "../../stateMachine/stateMachine";
import { TrustRecord } from "../trustRecord";
import { AuthorityInstance } from "./authority";
import { RobotType } from "./interface";
import { RegularRobot } from "./regularRobot";
import { TrustRobot } from "./trustRobot";

export class LeaderRobot extends RegularRobot {
  private eventEmitter: EventEmitter<SimulationEvents>;

  constructor(
    label: string,
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
    stateMachineDefinition: StateMachineDefinition,
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
      const base = this.planningController.getBase();
      this.broadcastMessage({ type: MessageType.CHANGE_BEHAVIOR, payload: RobotState.RETURNING_HOME });
      this.updateState(RobotState.RETURNING_HOME);
      this.move(base.getPosition() as Coordinates);
    });
  }

  public assignTaskToRobot(robot: TrustRobot, task: MessageContent): void {
    robot.sendMessage(robot.getId(), task, true);
  }

  notifyOtherMembersToMove(searchedObject: Entity): void {
    this.communicationController.notifyOtherMembersToMove(this, searchedObject, true);
  }

  update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const foundObjects = super.update(args);

    return foundObjects;
  }

  sendMostTrustedAvailableMemberToObject(searchedObject: Entity, occupiedSidesHandler: OccupiedSidesHandler): boolean {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }

    const sides = Object.values(occupiedSidesHandler.getOccupiedSides()).map((side) => side.robotId);
    const historyWitoutAssigned = Array.from(AuthorityInstance.getActiveRobots()).filter(
      (robot) => !sides.includes(robot.id),
    );

    const maxTrusted = historyWitoutAssigned.reduce((prev, curr) => (curr.reputation > prev.reputation ? curr : prev));

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

  getRobotType(): RobotType {
    return "leader";
  }
}

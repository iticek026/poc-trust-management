import { isValue } from "../../../utils/checks";
import { Entity } from "../../common/entity";
import { LeaderMessageContent, MessageType } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { BaseCommunicationControllerInterface } from "../../robot/controllers/communication/interface";
import { DetectionController } from "../../robot/controllers/detectionController";
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
  }

  public assignTaskToRobot(robot: TrustRobot, task: LeaderMessageContent): void {
    robot.sendMessage(robot.getId(), task, true);
  }

  notifyOtherMembersToMove(searchedObject: Entity): void {
    this.communicationController.notifyOtherMembersToMove(this, searchedObject, true);
  }

  sendMostTrustedAvailableMemberToObject(searchedObject: Entity, occupiedSidesHandler: OccupiedSidesHandler): boolean {
    if (!this.trustService) {
      throw new Error("Trust service is not defined");
    }

    const sides = Object.values(occupiedSidesHandler.getOccupiedSides()).map((side) => side.robotId);
    const historyWitoutAssigned = [...this.trustService.getTrustHistory().entries()].filter(
      (entry) => !sides.includes(entry[0]),
    );

    if (!sides.includes(this.getId())) {
      historyWitoutAssigned.push([
        this.getId(),
        { currentTrustLevel: AuthorityInstance.getReputation(this.getId()) } as TrustRecord,
      ]);
    }

    const maxTrusted = historyWitoutAssigned.reduce((prev, curr) =>
      curr[1].currentTrustLevel > prev[1].currentTrustLevel ? curr : prev,
    );

    const searchedObjectPosition = searchedObject.getPosition();
    this.communicationController.sendMessage(
      maxTrusted[0],
      {
        type: MessageType.MOVE_TO_LOCATION,
        payload: { x: searchedObjectPosition.x, y: searchedObjectPosition.y, fromLeader: true },
      },
      this,
    );

    return historyWitoutAssigned.length > 0;
  }

  public makeStrategicDecision(): void {
    // console.log(`LeaderRobot ${this.getId()} is making a strategic decision`);
  }

  getRobotType(): RobotType {
    return "leader";
  }
}

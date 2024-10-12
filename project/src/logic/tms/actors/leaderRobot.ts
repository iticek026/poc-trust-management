import { Entity } from "../../common/entity";
import { LeaderMessageContent } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { BaseCommunicationControllerInterface } from "../../robot/controllers/communication/interface";
import { DetectionController } from "../../robot/controllers/detectionController";
import { MovementController } from "../../robot/controllers/movementController";
import { PlanningController } from "../../robot/controllers/planningController";
import { Robot } from "../../robot/robot";
import { StateMachineDefinition } from "../../stateMachine/stateMachine";
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

  public makeStrategicDecision(): void {
    // console.log(`LeaderRobot ${this.getId()} is making a strategic decision`);
  }

  // assignCommunicationController(robots: TrustRobot[]): void {
  //   const robotsWithoutMe = robots.filter((robot) => robot.getId() !== this.getId());
  //   const communicationController = new LeaderCommunicationController(this, robotsWithoutMe);
  //   super.setCommunicationController(communicationController);
  // }

  getRobotType(): RobotType {
    return "leader";
  }
}

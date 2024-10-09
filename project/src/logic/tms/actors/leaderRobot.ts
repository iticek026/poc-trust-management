import { LeaderMessageContent } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { LeaderCommunicationController } from "../../robot/controllers/communication/leaderCommunicationController";
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
  ) {
    super(
      label,
      position,
      movementControllerFactory,
      detectionControllerFactory,
      planningControllerFactory,
      stateMachineDefinition,
    );
  }

  public assignTaskToRobot(robot: TrustRobot, task: LeaderMessageContent): void {
    // console.log(`LeaderRobot ${this.getId()} is assigning a task to Robot ${robot.getId()}`);
    robot.getCommunicationController()?.sendMessage(robot.getId(), task);
  }

  public makeStrategicDecision(): void {
    // console.log(`LeaderRobot ${this.getId()} is making a strategic decision`);
  }

  assignCommunicationController(robots: TrustRobot[]): void {
    const robotsWithoutMe = robots.filter((robot) => robot.getId() !== this.getId());
    const communicationController = new LeaderCommunicationController(this, robotsWithoutMe);
    super.setCommunicationController(communicationController);
  }

  getRobotType(): RobotType {
    return "leader";
  }
}

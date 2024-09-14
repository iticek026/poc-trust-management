import { LeaderMessageContent } from "../../common/interfaces/task";
import { Coordinates } from "../../environment/coordinates";
import { LeaderCommunicationController } from "../../robot/controllers/communication/leaderCommunicationController";
import { DetectionController } from "../../robot/controllers/detectionController";
import { MovementController } from "../../robot/controllers/movementController";
import { Robot } from "../../robot/robot";
import { TrustRobot } from "./trustRobot";

export class LeaderRobot extends TrustRobot {
  constructor(position: Coordinates, movementController: MovementController, detectionController: DetectionController) {
    super(position, movementController, detectionController);
    // this.state = RobotState.LEADING; // Initial state specific to leaders
  }

  public assignTaskToRobot(robot: Robot, task: LeaderMessageContent): void {
    console.log(`LeaderRobot ${this.getId()} is assigning a task to Robot ${robot.getId()}`);
    robot.getCommunicationController()?.sendMessage(robot.getId(), task);
  }

  public makeStrategicDecision(): void {
    console.log(`LeaderRobot ${this.getId()} is making a strategic decision`);
  }

  assignCommunicationController(robots: Robot[]): void {
    const communicationController = new LeaderCommunicationController(this, robots);
    super.setCommunicationController(communicationController);
  }
}

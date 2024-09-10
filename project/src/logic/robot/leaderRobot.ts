import { LeaderMessageContent } from "../common/interfaces/task";
import { Coordinates } from "../environment/coordinates";
import { LeaderCommunicationController } from "./controllers/communication/leaderCommunicationController";
import { DetectionController } from "./controllers/detectionController";
import { MovementController } from "./controllers/movementController";
import { Robot } from "./robot";

export class LeaderRobot extends Robot {
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

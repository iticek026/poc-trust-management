import { RobotState } from "../common/interfaces/interfaces";
import { OccupiedSides } from "../common/interfaces/occupiedSide";
import { TrustRobot } from "../tms/actors/trustRobot";
import { PlanningController } from "./controllers/planningController";

export class RobotSwarm {
  robots: TrustRobot[];
  readonly planningController: PlanningController;

  constructor(robots: TrustRobot[], planningController: PlanningController) {
    this.robots = robots;
    this.planningController = planningController;
  }

  removeRobot(robotId: number) {
    this.robots = this.robots.filter((r) => r.getId() !== robotId);
  }

  updateRobotsState(occupiedSides: OccupiedSides) {
    const occupyingRobotsIds = Object.values(occupiedSides).map((side) => side.robotId);
    const transportingRobots = this.robots.filter((robot) => occupyingRobotsIds.includes(robot.getId()));
    transportingRobots.forEach((robot) => {
      robot.updateState(RobotState.PLANNING);
    });
  }
}

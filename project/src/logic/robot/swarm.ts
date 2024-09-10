import { RobotState } from "../common/interfaces/interfaces";
import { OccupiedSides } from "../common/interfaces/occupiedSide";
import { PlanningController } from "./controllers/planningController";
import { Robot } from "./robot";

export class RobotSwarm {
  robots: Robot[];
  readonly planningController: PlanningController;

  constructor(robots: Robot[], planningController: PlanningController) {
    this.robots = robots;
    this.planningController = planningController;
  }

  updateRobotsState(occupiedSides: OccupiedSides) {
    const occupyingRobotsIds = Object.values(occupiedSides).map((side) => side.robotId);
    const transportingRobots = this.robots.filter((robot) => occupyingRobotsIds.includes(robot.getId()));
    transportingRobots.forEach((robot) => {
      robot.updateState(RobotState.PLANNING);
    });
  }

  // groupPush(occupiedSides: OccupiedSides) {
  //   this.robots.forEach((robot) => {
  //     robot.update({ occupiedSides, planningController: this.planningController });
  //   });
  //   this.planningController.increaseCurrentIndex();
  // }
}

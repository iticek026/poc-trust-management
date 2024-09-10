import { Entity } from "../common/entity";
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

  groupPush(occupiedSides: OccupiedSides) {
    this.robots.forEach((robot) => {
      robot.update(occupiedSides, undefined, this.planningController);
    });
    this.planningController.increaseCurrentIndex();
  }
}

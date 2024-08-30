import { Entity } from "../common/entity";
import { PlanningController } from "./controllers/planningController";
import { Robot } from "./robot";

export class RobotSwarm {
  robots: Robot[];
  readonly planningController: PlanningController;

  constructor(robots: Robot[], planningController: PlanningController) {
    this.robots = robots;
    this.planningController = planningController;
  }

  groupPush(object: Entity) {
    this.robots.forEach((robot) => {
      const side = robot.getAssignedSide();
      if (side === undefined) return;

      robot.executePush(side, object, this.planningController);
    });
    this.planningController.increaseCurrentIndex();
  }
}

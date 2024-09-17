import { Engine, Vector } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Environment } from "../environment/environment";
import { DetectionController } from "./controllers/detectionController";
import { MovementController } from "./controllers/movementController";
import { PlanningController } from "./controllers/planningController";
import { Robot } from "./robot";
import { LeaderRobot } from "../tms/actors/leaderRobot";

export class RobotBuilder {
  private position: Coordinates;
  private movementControllerArgs?: { environment: Environment };
  private detectionControllerArgs?: { engine: Engine };
  private planningController?: PlanningController;
  private leaderRobot?: LeaderRobot;

  constructor(position: Vector, leaderRobot?: LeaderRobot) {
    this.position = new Coordinates(position.x, position.y);
    this.leaderRobot = leaderRobot;
  }

  public setMovementControllerArgs(args: { environment: Environment }): RobotBuilder {
    this.movementControllerArgs = args;
    return this;
  }

  public setDetectionControllerArgs(args: { engine: Engine }): RobotBuilder {
    this.detectionControllerArgs = args;
    return this;
  }

  public setPlanningController(args: PlanningController): RobotBuilder {
    this.planningController = args;
    return this;
  }

  public build<T>(
    RobotClass: new (
      position: Coordinates,
      movementControllerFactory: (robot: Robot) => MovementController,
      detectionControllerFactory: (robot: Robot) => DetectionController,
      planningControllerFactory: (robot: Robot) => PlanningController,
      leaderRobot: LeaderRobot | null,
    ) => T,
  ): T {
    const movementControllerFactory = (robotInstance: Robot) => {
      if (!this.movementControllerArgs) {
        throw new Error("Movement controller args are not set");
      }
      const { environment } = this.movementControllerArgs;
      return new MovementController(robotInstance, environment);
    };

    const detectionControllerFactory = (robotInstance: Robot) => {
      if (!this.detectionControllerArgs) {
        throw new Error("Detection controller args are not set");
      }
      const { engine } = this.detectionControllerArgs;
      return new DetectionController(robotInstance, engine);
    };

    const planningControllerFactory = () => {
      if (!this.planningController) {
        throw new Error("Planning controller args are not set");
      }
      return this.planningController;
    };

    const robot = new RobotClass(
      this.position,
      movementControllerFactory,
      detectionControllerFactory,
      planningControllerFactory,
      this.leaderRobot ?? null,
    );

    return robot;
  }
}

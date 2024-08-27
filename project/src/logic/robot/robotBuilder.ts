import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { Robot } from "./robot";
import { DetectionController } from "./controllers/detectionController";
import { Base } from "../environment/base";
import { PlanningController } from "./controllers/planningController";

export class RobotBuilder {
  private position: Coordinates | undefined;
  private movementController: MovementController | undefined;
  private detectionController: DetectionController | undefined;
  private planningController: PlanningController | undefined;

  private base: Base | undefined;

  public setPosition(position: Coordinates): RobotBuilder {
    this.position = position;
    return this;
  }

  public addMovementController(controller: MovementController): RobotBuilder {
    this.movementController = controller;
    return this;
  }

  public addDetectionController(controller: DetectionController): RobotBuilder {
    this.detectionController = controller;
    return this;
  }

  public addBaseLocation(base: Base): RobotBuilder {
    this.base = base;
    return this;
  }

  public addPlanningController(controller: PlanningController): RobotBuilder {
    this.planningController = controller;
    return this;
  }

  public build(): Robot {
    if (!this.position) {
      throw new Error("Position must be set before building the Robot.");
    }
    if (!this.detectionController) {
      throw new Error("DetectionController must be set before building the Robot.");
    }
    if (!this.movementController) {
      throw new Error("MovementController must be set before building the Robot.");
    }

    if (!this.planningController) {
      throw new Error("PlanningController must be set before building the Robot.");
    }

    if (!this.base) {
      throw new Error("Base must be set before building the Robot.");
    }

    return new Robot(
      this.position,
      this.movementController,
      this.detectionController,
      this.planningController,
      this.base,
    );
  }
}

import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { Robot } from "./robot";
import { DetectionController } from "./controllers/detectionController";

export class RobotBuilder {
  private position: Coordinates | undefined;
  private movementController: MovementController | undefined;
  private detectionController: DetectionController | undefined;

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

  public build(): Robot {
    if (!this.position) {
      throw new Error("Position must be set before building the Robot.");
    }
    if (!this.detectionController) {
      throw new Error(
        "DetectionController must be set before building the Robot."
      );
    }
    if (!this.movementController) {
      throw new Error(
        "MovementController must be set before building the Robot."
      );
    }

    return new Robot(
      this.position,
      this.movementController,
      this.detectionController
    );
  }
}

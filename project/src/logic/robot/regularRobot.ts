import { Coordinates } from "../environment/coordinates";
import { RegularCommunicationController } from "./controllers/communication/regularCommunicationController";
import { DetectionController } from "./controllers/detectionController";
import { MovementController } from "./controllers/movementController";
import { Robot } from "./robot";

export class RegularRobot extends Robot {
  constructor(position: Coordinates, movementController: MovementController, detectionController: DetectionController) {
    super(position, movementController, detectionController);
  }

  assignCommunicationController(robots: Robot[]): void {
    const communicationController = new RegularCommunicationController(this, robots);
    super.setCommunicationController(communicationController);
  }
}

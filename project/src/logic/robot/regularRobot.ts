import { EntityCache } from "../../utils/cache";
import { OccupiedSides } from "../common/interfaces/occupiedSide";
import { Coordinates } from "../environment/coordinates";
import { CommunicationControllerAssignInterface } from "./controllers/communication/interface";
import { RegularCommunicationController } from "./controllers/communication/regularCommunicationController";
import { DetectionController } from "./controllers/detectionController";
import { MovementController } from "./controllers/movementController";
import { Robot } from "./robot";

export class RegularRobot extends Robot implements CommunicationControllerAssignInterface {
  constructor(position: Coordinates, movementController: MovementController, detectionController: DetectionController) {
    super(position, movementController, detectionController);
  }

  // Worker-specific methods or overrides
  public update(cache: EntityCache, occupiedSides: OccupiedSides, destination?: Coordinates) {
    super.update(cache, occupiedSides, destination);
    // Additional logic specific to workers
  }

  assignCommunicationController(robots: Robot[], robotCache: Map<number, Robot>): void {
    const communicationController = new RegularCommunicationController(this, robots, robotCache);
    super.setCommunicationController(communicationController);
  }
}

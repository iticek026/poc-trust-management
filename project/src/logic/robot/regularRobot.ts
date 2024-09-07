import { Entity } from "../common/entity";
import { OccupiedSides } from "../common/interfaces/occupiedSide";
import { Coordinates } from "../environment/coordinates";
import { RegularCommunicationController } from "./controllers/communication/regularCommunicationController";
import { DetectionController } from "./controllers/detectionController";
import { MovementController } from "./controllers/movementController";
import { Robot } from "./robot";

export class RegularRobot extends Robot {
  constructor(position: Coordinates, movementController: MovementController, detectionController: DetectionController) {
    super(position, movementController, detectionController);
  }

  public update(
    occupiedSides: OccupiedSides,
    destination?: Coordinates,
  ): { searchedItem?: Entity; obstacles: Entity[] } {
    return super.update(occupiedSides, destination);
  }

  assignCommunicationController(robots: Robot[]): void {
    const communicationController = new RegularCommunicationController(this, robots);
    super.setCommunicationController(communicationController);
  }
}

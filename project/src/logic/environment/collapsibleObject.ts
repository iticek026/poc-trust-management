import { IChamferableBodyDefinition } from "matter-js";
import { EntityType } from "../common/interfaces/interfaces";
import { Coordinates } from "./coordinates";
import { EnvironmentObject } from "./environmentObject";
import { Size } from "../common/interfaces/size";

export class CollapsibleObject extends EnvironmentObject {
  constructor(size: Size, coordinates: Coordinates, type: EntityType, options?: IChamferableBodyDefinition) {
    super(size, true, coordinates, type, options);
  }
}

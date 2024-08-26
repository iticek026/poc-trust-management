import { EntityType } from "../../utils/interfaces";
import { CollapsibleObject } from "./collapsibleObject";
import { Coordinates } from "./coordinates";
import { Size } from "./interfaces";

export class SearchedObject extends CollapsibleObject {
  readonly requiredNumberOfRobots = 4;
  constructor(size: Size, coordinates: Coordinates) {
    super(size, coordinates, EntityType.SEARCHED_OBJECT);
  }
}

import { EntityType } from "../../utils/interfaces";
import { Coordinates } from "./coordinates";
import { EnvironmentObject } from "./environmentObject";
import { Size } from "./interfaces";

export class Base extends EnvironmentObject {
  constructor(size: Size, coordinates: Coordinates, type: EntityType) {
    super(size, false, coordinates, type);
  }
}

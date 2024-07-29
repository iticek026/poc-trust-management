import { Coordinates } from "./coordinates";
import { EnvironmentObject } from "./environmentObject";
import { EnvironmentObjectType } from "./environmentObjectType";

export class Goal extends EnvironmentObject {
  constructor(dimensions: Coordinates[]) {
    super(dimensions, EnvironmentObjectType.COLLECTABLE, true);
  }
}

import { Coordinates } from "./coordinates";
import { EnvironmentObject } from "./environmentObject";
import { EnvironmentObjectType } from "./environmentObjectType";

export class Base extends EnvironmentObject {
  constructor(dimensions: Coordinates[]) {
    super(dimensions, EnvironmentObjectType.BASE, false);
  }
}

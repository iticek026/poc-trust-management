import { Body } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { EntityType } from "../../utils/interfaces";

export abstract class Entity {
  type: EntityType;
  constructor(type: EntityType) {
    this.type = type;
  }

  abstract getId(): number;
  abstract getBody(): Body;
  protected abstract create(position: Coordinates): Body;
}

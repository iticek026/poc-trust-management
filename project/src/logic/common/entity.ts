import { Body, IChamferableBodyDefinition } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { EntityType } from "../../utils/interfaces";
import { Size } from "../environment/interfaces";

export abstract class Entity {
  type: EntityType;
  constructor(type: EntityType) {
    this.type = type;
  }

  abstract getId(): number;
  abstract getBody(): Body;
  protected abstract create(
    position: Coordinates,
    options?: IChamferableBodyDefinition
  ): Body;
  abstract getSize(): Size;
  abstract getPosition(): Matter.Vector;
  abstract setPosition(position: Coordinates): void;
}

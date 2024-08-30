import { Body, IChamferableBodyDefinition } from "matter-js";
import { Size } from "./interfaces";
import { Coordinates } from "./coordinates";
import { EntityType } from "../../utils/interfaces";
import { Entity } from "../common/entity";
import { createRectangle } from "../../utils/bodies";

export abstract class EnvironmentObject extends Entity {
  constructor(
    size: Size,
    collapsible: boolean,
    coordinates: Coordinates,
    type: EntityType,
    options?: IChamferableBodyDefinition,
  ) {
    super(type, coordinates, size, options, collapsible);
  }

  getSize(): Size {
    return this.size;
  }

  protected create(position: Coordinates, options?: IChamferableBodyDefinition): Body {
    return createRectangle(position, this.collapsible, this.size, options);
  }
}

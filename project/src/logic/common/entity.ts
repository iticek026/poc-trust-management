import { IChamferableBodyDefinition } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { EntityType } from "../../utils/interfaces";
import { Size } from "../environment/interfaces";
import { MatterJsBody } from "./matterJsBody";

interface EntityInterface {
  getSize(): Size;
}

export abstract class Entity extends MatterJsBody implements EntityInterface {
  type: EntityType;

  constructor(
    type: EntityType,
    coordinates: Coordinates,
    protected size: Size,
    options?: IChamferableBodyDefinition,
    collapsible: boolean = false,
  ) {
    super(coordinates, size, collapsible, options);
    this.type = type;
  }

  abstract getSize(): Size;
}

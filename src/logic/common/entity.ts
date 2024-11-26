import { IChamferableBodyDefinition } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { EntityType } from "./interfaces/interfaces";
import { Size } from "./interfaces/size";
import { MatterJsBody } from "./matterJsBody";

interface EntityInterface {
  getSize(): Size;
}

export abstract class Entity extends MatterJsBody implements EntityInterface {
  type: EntityType;

  constructor(
    label: string | undefined,
    type: EntityType,
    coordinates: Coordinates,
    protected size: Size,
    options?: IChamferableBodyDefinition,
    collapsible: boolean = false,
  ) {
    super(label, coordinates, size, collapsible, options);
    this.type = type;
  }

  abstract getSize(): Size;
}

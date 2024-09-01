import Matter, { IChamferableBodyDefinition, Body } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Size } from "./interfaces/size";

export abstract class MatterJsBody {
  protected id: number;
  protected matterBody: Body;
  protected size: Size;
  readonly collapsible: boolean;

  constructor(coordinates: Coordinates, size: Size, collapsible: boolean, options?: IChamferableBodyDefinition) {
    this.size = size;
    this.collapsible = collapsible;
    this.matterBody = this.create(coordinates, options);
    this.id = this.matterBody.id;
  }

  protected abstract create(position: Coordinates, options?: IChamferableBodyDefinition): Body;
  getId(): number {
    return this.id;
  }

  getBody(): Body {
    return this.matterBody;
  }

  getPosition(): Matter.Vector {
    return this.matterBody.position;
  }

  setPosition(position: Coordinates): void {
    Body.setPosition(this.matterBody, position);
  }
}

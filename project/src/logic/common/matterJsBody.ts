import { IChamferableBodyDefinition, Body, Composite, Vector } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { Size } from "./interfaces/size";
import { isComposite } from "../../utils/checks";

export abstract class MatterJsBody {
  protected id: number;
  protected label: string | undefined;
  protected matterBody: Body | Composite;
  protected size: Size;
  readonly collapsible: boolean;

  constructor(
    label: string | undefined,
    coordinates: Coordinates,
    size: Size,
    collapsible: boolean,
    options?: IChamferableBodyDefinition,
  ) {
    this.size = size;
    this.collapsible = collapsible;
    this.matterBody = this.create(coordinates, options);
    this.id = this.createId();
    this.label = label;
  }

  protected abstract create(position: Coordinates, options?: IChamferableBodyDefinition): Body | Composite;

  getId(): number {
    return this.id;
  }

  getLabel(): string | undefined {
    return this.label;
  }

  private createId(): number {
    if (isComposite(this.matterBody)) {
      return this.matterBody.bodies[0].id;
    }
    return this.matterBody.id;
  }

  stopBody(): void {
    if (isComposite(this.matterBody)) {
      this.matterBody.bodies.forEach((body) => {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
      });
      return;
    }
    Body.setVelocity(this.matterBody, { x: 0, y: 0 });
    Body.setAngularVelocity(this.matterBody, 0);
  }

  getBody(): Body {
    if (isComposite(this.matterBody)) {
      return this.matterBody.bodies[0];
    }
    return this.matterBody;
  }

  getInitBody(): Body | Composite {
    return this.matterBody;
  }

  getPosition(): Matter.Vector {
    if (isComposite(this.matterBody)) {
      return this.matterBody.bodies[0].position;
    }
    return this.matterBody.position;
  }

  setPosition(position: Coordinates | Vector): void {
    if (isComposite(this.matterBody)) {
      this.matterBody.bodies.forEach((body) => {
        Body.setPosition(body, position);
      });
      return;
    }
    Body.setPosition(this.matterBody, position);
  }
}

import { Bodies, Body, IChamferableBodyDefinition } from "matter-js";
import { Size } from "./interfaces";
import {
  CATEGORY_COLLAPSIBLE,
  CATEGORY_DETECTABLE,
  CATEGORY_SENSOR,
} from "../../utils/consts";
import { Coordinates } from "./coordinates";
import { EntityType } from "../../utils/interfaces";
import { Entity } from "../common/entity";

export abstract class EnvironmentObject extends Entity {
  private size: Size;
  private collapsible: boolean;
  private id: number;
  private matterBody: Body;

  constructor(
    size: Size,
    collapsible: boolean,
    coordinates: Coordinates,
    type: EntityType,
    options?: IChamferableBodyDefinition
  ) {
    super(type);
    this.size = size;
    this.collapsible = collapsible;
    this.matterBody = this.create(coordinates, {
      inertia: Infinity,
      ...options,
    });
    this.id = this.matterBody.id;
  }

  getId(): number {
    return this.id;
  }

  getBody(): Body {
    return this.matterBody;
  }

  getSize(): Size {
    return this.size;
  }

  getPosition(): Matter.Vector {
    return this.matterBody.position;
  }

  setPosition(position: Coordinates): void {
    Body.setPosition(this.matterBody, position);
  }

  protected create(
    position: Coordinates,
    options?: IChamferableBodyDefinition
  ): Body {
    return Bodies.rectangle(
      position.x,
      position.y,
      this.size.width,
      this.size.height,
      this.collapsible
        ? {
            collisionFilter: {
              category: CATEGORY_COLLAPSIBLE,
              mask: CATEGORY_DETECTABLE | CATEGORY_SENSOR, // Robots can push it, and sensors can detect it
            },
            restitution: 0.2,
            friction: 1,
            frictionAir: 1,
            ...options,
          }
        : {
            collisionFilter: { group: -1 },
            ...options,
          }
    );
  }
}

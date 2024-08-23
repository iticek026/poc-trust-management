import { Bodies, Body } from "matter-js";
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
  private coordinates: Coordinates;
  private id: number;
  private matterBody: Body;

  constructor(
    size: Size,
    collapsible: boolean,
    coordinates: Coordinates,
    type: EntityType
  ) {
    super(type);
    this.size = size;
    this.collapsible = collapsible;
    this.coordinates = coordinates;
    this.matterBody = this.create();
    this.id = this.matterBody.id;
  }

  getId(): number {
    return this.id;
  }

  getBody(): Body {
    return this.matterBody;
  }

  protected create(): Body {
    return Bodies.rectangle(
      this.coordinates.x,
      this.coordinates.y,
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
          }
        : {
            collisionFilter: { group: -1 },
          }
    );
  }
}

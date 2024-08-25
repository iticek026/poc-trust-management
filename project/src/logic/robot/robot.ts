import { Bodies, Body, IChamferableBodyDefinition } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { DetectionController } from "./controllers/detectionController";
import { CATEGORY_SENSOR, CATEGORY_DETECTABLE } from "../../utils/consts";
import { EntityType, RobotState } from "../../utils/interfaces";
import { Entity } from "../common/entity";
import { EntityCache } from "../../utils/cache";
import { Size } from "../environment/interfaces";
import { Base } from "../environment/base";

// https://stackoverflow.com/questions/67648409/how-to-move-body-to-another-position-with-animation-in-matter-js

export const ROBOT_RADIUS = 30;
export const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

export class Robot extends Entity {
  private id: number;
  private matterBody: Body;
  private movementController: MovementController;
  private detectionController: DetectionController;

  public bodyChildren: { mainBody: Body; others: Body[] };
  readonly type: EntityType = EntityType.ROBOT;
  public state: RobotState;
  private base: Base;

  constructor(
    position: Coordinates,
    movementController: MovementController,
    detectionController: DetectionController,
    base: Base
  ) {
    super(EntityType.ROBOT);
    this.bodyChildren = this.createBodyChildren();
    this.matterBody = this.create(position, undefined, this.bodyChildren);
    this.movementController = movementController;
    this.detectionController = detectionController;
    this.id = this.matterBody.id;
    this.state = RobotState.SEARCHING;
    this.base = base;
  }

  private createBodyChildren() {
    const mainBody = this.buildMatterBody();
    const circle = this.buildDetectionCircle();

    return { mainBody: mainBody, others: [circle] };
  }

  protected create(
    position: Coordinates,
    options?: IChamferableBodyDefinition,
    children?: { mainBody: Body; others: Body[] }
  ) {
    let body: Body;

    if (!children) {
      body = this.buildMatterBody();
    } else {
      body = Body.create({
        parts: [children.mainBody, ...children.others],
        collisionFilter: { group: -1 },
        render: { fillStyle: "blue", strokeStyle: "blue", lineWidth: 3 },
        ...options,
      });
    }

    const correctPosition = position.add(ROBOT_RADIUS);
    Body.setPosition(body, correctPosition);

    return body;
  }

  private buildDetectionCircle() {
    return Bodies.circle(0, 0, DETECTION_RADIUS, {
      isSensor: true, // Sensor bodies don't collide but can detect overlaps
      isStatic: true, // Keep the detection radius static relative to the robot
      collisionFilter: {
        group: -1, // Ensure that the detection radius does not collide with the robot itself
        category: CATEGORY_SENSOR,
        mask: CATEGORY_DETECTABLE,
      },
      label: "detectionCircle",
    });
  }

  private buildMatterBody() {
    const bodyStyle = { fillStyle: "#222" };
    const robotParticle = Bodies.circle(0, 0, ROBOT_RADIUS, {
      collisionFilter: {
        group: -1,
        category: CATEGORY_DETECTABLE,
        mask: CATEGORY_SENSOR | CATEGORY_DETECTABLE,
      },
      frictionAir: 0.03,
      density: 0.3,
      friction: 0.8,
      restitution: 1,
      label: "robot",
      render: bodyStyle,
    });

    return robotParticle;
  }

  getPosition() {
    return this.matterBody.position;
  }

  getId() {
    return this.id;
  }

  getRobotMatterBody() {
    return this.matterBody;
  }

  getBody(): Body {
    return this.matterBody;
  }

  getSize(): Size {
    return { width: ROBOT_RADIUS * 2, height: ROBOT_RADIUS * 2 };
  }

  setPosition(position: Coordinates) {
    Body.setPosition(this.matterBody, position);
  }

  public update(cache: EntityCache, destination?: Coordinates) {
    const nearbyObjects = this.detectionController?.detectNearbyObjects(
      this,
      cache
    );

    let objectToPush: Entity | undefined;
    nearbyObjects?.forEach((object) => {
      if (
        object.type === EntityType.SEARCHED_OBJECT &&
        this.state === RobotState.SEARCHING
      ) {
        this.movementController.stop(this);
        this.state = RobotState.TRANSPORTING;
        // this.movementController.adjustPositionToNearestSide(this, object);
        objectToPush = object;
        return;
      } else if (
        object.type === EntityType.SEARCHED_OBJECT &&
        this.state === RobotState.TRANSPORTING
      ) {
        objectToPush = object;
      }
    });

    if (this.state === RobotState.TRANSPORTING && objectToPush) {
      this.movementController.pushObject(
        this.matterBody,
        objectToPush,
        this.base.getBody()
      );
    }

    if (this.state === RobotState.SEARCHING) {
      this.movementController?.move(this, destination);
    }
  }
}

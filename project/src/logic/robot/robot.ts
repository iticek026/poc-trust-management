import { Bodies, Body } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { DetectionController } from "./controllers/detectionController";
import { CATEGORY_SENSOR, CATEGORY_DETECTABLE } from "../../utils/consts";
import { EntityType } from "../../utils/interfaces";
import { Entity } from "../common/entity";
import { EntityCache } from "../../utils/cache";

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

  constructor(
    position: Coordinates,
    movementController: MovementController,
    detectionController: DetectionController
  ) {
    super(EntityType.ROBOT);
    this.bodyChildren = this.createBodyChildren();
    this.matterBody = this.create(position, this.bodyChildren);
    this.movementController = movementController;
    this.detectionController = detectionController;
    this.id = this.matterBody.id;
  }

  private createBodyChildren() {
    const mainBody = this.buildMatterBody();
    const circle = this.buildDetectionCircle();

    return { mainBody: mainBody, others: [circle] };
  }

  protected create(
    position: Coordinates,
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

  public getPosition() {
    return this.matterBody.position;
  }

  public getId() {
    return this.id;
  }

  public getRobotMatterBody() {
    return this.matterBody;
  }

  getBody(): Body {
    return this.matterBody;
  }

  public update(cache: EntityCache, destination?: Coordinates) {
    const nearbyObjects = this.detectionController?.detectNearbyObjects(
      this,
      cache
    );

    nearbyObjects?.forEach((object) => {
      if (object.type === EntityType.SEARCHED_OBJECT) {
        console.log(
          `Robot ${this.id} detected an object within range:`,
          object
        );
      }
    });

    this.movementController?.move(this, destination);
  }
}

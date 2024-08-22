import { Bodies, Body, Engine, Query } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { randomPointFromOtherSides } from "../../utils/robotUtils";
import { Environment } from "../environment/environment";

// https://stackoverflow.com/questions/67648409/how-to-move-body-to-another-position-with-animation-in-matter-js

const ROBOT_SPEED = 10;
export const ROBOT_RADIUS = 30;
const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

export class Robot {
  private id: number;
  private matterBody: Body;
  private destination: Coordinates;
  private engine: Engine | undefined;

  public bodyChildren: { mainBody: Body; others: Body[] };

  constructor(position: Coordinates) {
    const correctPosition = position.add(ROBOT_RADIUS);

    const body = this.buildMatterBody();
    const circle = this.buildDetectionCircle();

    this.bodyChildren = { mainBody: body, others: [circle] };

    this.matterBody = Body.create({
      parts: [this.bodyChildren.mainBody, ...this.bodyChildren.others],
      collisionFilter: { group: -1 },
    });

    Body.setPosition(this.matterBody, correctPosition);

    this.id = this.matterBody.id;
    this.destination = position;
    this.move();
  }

  public setEngine(engine: Engine) {
    this.engine = engine;
  }

  getPosition() {
    return this.matterBody.position;
  }

  getId() {
    return this.id;
  }

  private detectNearbyObjects(): Body[] {
    if (!this.engine) {
      throw new Error("Engine not set for this robot.");
    }

    const detectionRegion = {
      min: {
        x: this.matterBody.position.x - DETECTION_RADIUS,
        y: this.matterBody.position.y - DETECTION_RADIUS,
      },
      max: {
        x: this.matterBody.position.x + DETECTION_RADIUS,
        y: this.matterBody.position.y + DETECTION_RADIUS,
      },
    };

    // Query for bodies within the detection region
    const nearbyBodies = Query.region(
      this.engine.world.bodies,
      detectionRegion
    );

    // Optionally, filter out the robot's own body from the results
    return nearbyBodies.filter((body) => body.id !== this.matterBody.id);
  }

  public update() {
    // this.updateDetectionCircle();
    const nearbyObjects = this.detectNearbyObjects();

    nearbyObjects.forEach((object) => {
      console.log(`Robot ${this.id} detected an object within range:`, object);
    });

    this.move();
  }

  private buildDetectionCircle() {
    return Bodies.circle(0, 0, DETECTION_RADIUS, {
      isSensor: true, // Sensor bodies don't collide but can detect overlaps
      isStatic: true, // Keep the detection radius static relative to the robot
      collisionFilter: {
        group: -1, // Ensure that the detection radius does not collide with the robot itself
      },
      label: "detectionCircle",
    });
  }

  private buildMatterBody() {
    const robotParticle = Bodies.circle(0, 0, ROBOT_RADIUS, {
      collisionFilter: { group: -1 },
      frictionAir: 0.03,
      density: 0.3,
      friction: 0.8,
      restitution: 1,
      label: "robot",
    });

    return robotParticle;
  }

  public getRobotMatterBody(engine: Engine, environment: Environment) {
    this.setEngine(engine);
    this.destination = randomPointFromOtherSides(environment, this);
    return this.matterBody;
  }

  public setDestination(destination: Coordinates) {
    this.destination = destination;
  }

  private move() {
    const { x: destinationX, y: destinationY } = this.destination;

    const direction = {
      x: destinationX - this.matterBody.position.x,
      y: destinationY - this.matterBody.position.y,
    };

    // Normalize the direction vector
    const distance = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );

    const stoppingDistance = 5;

    // Check if the robot is close enough to the target to stop moving
    if (distance > stoppingDistance) {
      // Normalize the direction vector
      const normalizedDirection = {
        x: direction.x / distance,
        y: direction.y / distance,
      };

      // Set the robot's velocity towards the target
      const velocity = {
        x: normalizedDirection.x * ROBOT_SPEED,
        y: normalizedDirection.y * ROBOT_SPEED,
      };

      Body.setVelocity(this.matterBody, velocity);
    } else {
      // Optionally, you can set the velocity to zero to stop the robot completely
      Body.setVelocity(this.matterBody, { x: 0, y: 0 });
    }
  }
}

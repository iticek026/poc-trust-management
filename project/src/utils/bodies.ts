import { Bodies, IChamferableBodyDefinition, Body } from "matter-js";
import { DETECTION_RADIUS, ROBOT_RADIUS } from "../logic/robot/robot";
import { CATEGORY_SENSOR, CATEGORY_DETECTABLE, CATEGORY_COLLAPSIBLE } from "./consts";
import { Coordinates } from "../logic/environment/coordinates";
import { Size } from "../logic/common/interfaces/size";

function buildDetectionCircle() {
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

function buildMatterBody() {
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

function createRobotBody() {
  const mainBody = buildMatterBody();
  const circle = buildDetectionCircle();

  return [mainBody, circle];
}

export function createRobot(position: Coordinates) {
  const robotParts = createRobotBody();

  const body = Body.create({
    parts: robotParts,
    collisionFilter: { group: -1 },
    render: { fillStyle: "blue", strokeStyle: "blue", lineWidth: 3 },
  });

  Body.setPosition(body, position);

  return body;
}

export function createRectangle(
  position: Coordinates,
  collapsible: boolean,
  size: Size,
  options?: IChamferableBodyDefinition,
): Body {
  return Bodies.rectangle(
    position.x,
    position.y,
    size.width,
    size.height,
    collapsible
      ? {
          collisionFilter: {
            category: CATEGORY_COLLAPSIBLE,
            mask: CATEGORY_DETECTABLE | CATEGORY_SENSOR | CATEGORY_COLLAPSIBLE, // Robots can push it, and sensors can detect it
          },
          restitution: 0.2,
          friction: 1,
          frictionAir: 1,
          ...options,
        }
      : {
          collisionFilter: { group: -1 },
          ...options,
        },
  );
}

import { Bodies, IChamferableBodyDefinition, Body, Constraint, Composite, Bounds } from "matter-js";
import { DETECTION_RADIUS, ROBOT_RADIUS } from "../logic/robot/robot";
import { CATEGORY_SENSOR, CATEGORY_DETECTABLE, CATEGORY_COLLAPSIBLE } from "./consts";
import { Coordinates } from "../logic/environment/coordinates";
import { Size } from "../logic/common/interfaces/size";

function buildDetectionCircle() {
  return Bodies.circle(0, 0, DETECTION_RADIUS, {
    isSensor: true,
    collisionFilter: {
      group: -1,
      category: CATEGORY_SENSOR,
      mask: CATEGORY_DETECTABLE,
    },
    label: "detectionCircle",
    render: {
      fillStyle: "rgba(255, 0, 0, 0.5)",
      visible: true,
      strokeStyle: "red",
      lineWidth: 1,
    },
  });
}

function buildMatterBody() {
  const bodyStyle = { fillStyle: "#7A87FF" };
  const robotParticle = Bodies.circle(0, 0, ROBOT_RADIUS, {
    collisionFilter: {
      group: -1,
      category: CATEGORY_DETECTABLE,
      mask: CATEGORY_SENSOR | CATEGORY_DETECTABLE | CATEGORY_COLLAPSIBLE, // Can detect other robots and sensors
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

  const constraint = Constraint.create({
    bodyA: robotParts[0],
    bodyB: robotParts[1],
    stiffness: 1, // Keep them tightly connected
    length: 0,
  });

  const composite = Composite.create();
  Composite.add(composite, [...robotParts, constraint]);

  Body.setPosition(robotParts[0], position);
  Body.setPosition(robotParts[1], position);

  return composite;
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

export function createWorldBounds(size: { width: number; height: number }, padding: number) {
  return Bounds.create([
    { x: padding + 5, y: padding + 5 },
    { x: size.width - padding - 5, y: size.height - padding - 5 },
  ]);
}

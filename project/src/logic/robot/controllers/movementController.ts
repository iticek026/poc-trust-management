import { Body, Bounds, Query, Vector, Vertices } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";
import { Coordinates } from "../../environment/coordinates";
import { Environment } from "../../environment/environment";
import { ObjectSide, RobotState } from "../../common/interfaces/interfaces";
import { Entity } from "../../common/entity";
import { PlanningController } from "./planningController";
import { OccupiedSides } from "../../common/interfaces/occupiedSide";
import Matter from "matter-js";
import { castRay } from "../../../utils/detection";

export interface MovementControllerInterface {
  /**
   * Set movement direction towards the currentDestination or continue moving towards the last set currentDestination
   * @param currentDestination
   */
  move(robot: Robot, currentDestination?: Coordinates): void;

  /**
   * Stops robot movement
   * @param robot
   */
  stop(robot: Robot): void;
}

const ROBOT_SPEED = 10;

export class MovementController implements MovementControllerInterface {
  private currentDestination: Coordinates;
  private mainDestination: Coordinates;
  private obstacleBody?: Body;
  private edgeIndex = 0;
  private t = 0;

  constructor(environment: Environment) {
    this.currentDestination = this.getRandomBorderPosition(environment.size.width, environment.size.height);
    this.mainDestination = this.currentDestination;
  }

  private updateDestination(currentDestination?: Coordinates, mainDestination = true) {
    if (mainDestination) {
      this.mainDestination = currentDestination ?? this.mainDestination;
    }
    this.currentDestination = currentDestination ?? this.currentDestination;

    return mainDestination ? this.mainDestination : this.currentDestination;
  }

  public stop(robot: Robot): void {
    Body.setVelocity(robot.getBody(), { x: 0, y: 0 });
    robot.state = RobotState.IDLE;
  }

  getMainDestination() {
    return this.mainDestination;
  }

  public move(robot: Robot, currentDestination?: Coordinates, changesMainDestination = true): void {
    if (robot.state === RobotState.IDLE) {
      return;
    }

    const destination = this.updateDestination(currentDestination, changesMainDestination);
    const { x: destinationX, y: destinationY } = destination;

    const direction = {
      x: destinationX - robot.getBody().position.x,
      y: destinationY - robot.getBody().position.y,
    };

    const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);

    const stoppingDistance = 5;

    if (distance > stoppingDistance) {
      const normalizedDirection = {
        x: direction.x / distance,
        y: direction.y / distance,
      };

      const velocity = {
        x: normalizedDirection.x * ROBOT_SPEED,
        y: normalizedDirection.y * ROBOT_SPEED,
      };

      Body.setVelocity(robot.getBody(), velocity);
    } else {
      Body.setVelocity(robot.getBody(), { x: 0, y: 0 });
    }
  }

  private getRandomBorderPosition(environmentWidth: number, environmentHeight: number): Coordinates {
    const randomBorder = Math.floor(Math.random() * 4);

    switch (randomBorder) {
      case 0: // Top border
        return new Coordinates(Math.random() * environmentWidth, 0);
      case 1: // Bottom border
        return new Coordinates(Math.random() * environmentWidth, environmentHeight);
      case 2: // Left border
        return new Coordinates(0, Math.random() * environmentHeight);
      case 3: // Right border
        return new Coordinates(environmentWidth, Math.random() * environmentHeight);
      default:
        throw new Error("Invalid border selected");
    }
  }

  findNearestAvailableSide(robot: Body, object: Body, occupiedSides: OccupiedSides): keyof typeof ObjectSide {
    const objectPosition = object.position;
    const robotPosition = robot.position;

    const distances = {
      Top: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(0, -ROBOT_RADIUS)))),
      Bottom: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(0, ROBOT_RADIUS)))),
      Left: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(-ROBOT_RADIUS, 0)))),
      Right: Vector.magnitude(Vector.sub(robotPosition, Vector.add(objectPosition, Vector.create(ROBOT_RADIUS, 0)))),
    };

    const sortedSides = Object.keys(distances).sort(
      (a, b) => distances[a as keyof typeof ObjectSide] - distances[b as keyof typeof ObjectSide],
    );

    for (const side of sortedSides) {
      if (!occupiedSides[side as keyof typeof ObjectSide].isOccupied) {
        return side as keyof typeof ObjectSide;
      }
    }

    return sortedSides[0] as keyof typeof ObjectSide;
  }

  moveRobotToAssignedSide(robot: Robot, object: Entity, side: ObjectSide, occupiedSides: OccupiedSides) {
    const objectPosition = object.getPosition();

    // +1 is added to the halfWidth and halfHeight to avoid overlap
    const halfWidth = object.getSize().width / 2 + 1;
    const halfHeight = object.getSize().height / 2 + 1;
    let targetPosition: Vector;

    switch (side) {
      case ObjectSide.Top:
        targetPosition = Vector.add(objectPosition, Vector.create(0, -ROBOT_RADIUS - halfHeight));
        break;
      case ObjectSide.Bottom:
        targetPosition = Vector.add(objectPosition, Vector.create(0, ROBOT_RADIUS + halfHeight));
        break;
      case ObjectSide.Left:
        targetPosition = Vector.add(objectPosition, Vector.create(-ROBOT_RADIUS - halfWidth, 0));
        break;
      case ObjectSide.Right:
        targetPosition = Vector.add(objectPosition, Vector.create(ROBOT_RADIUS + halfWidth, 0));
        break;
    }

    Body.setPosition(robot.getBody(), targetPosition);
    Body.setVelocity(robot.getBody(), { x: 0, y: 0 });

    const distance = Vector.magnitude(Vector.sub(targetPosition, robot.getPosition()));
    if (distance < 5) {
      occupiedSides[side].isOccupied = true;
      occupiedSides[side].robotId = robot.getId();
      robot.state = RobotState.IDLE;
      console.log(`Robot has taken position at ${side}.`);
    }
  }

  public adjustPositionToNearestSide(robot: Robot, object: Entity, occupiedSides: OccupiedSides) {
    const side = this.findNearestAvailableSide(robot.getBody(), object.getBody(), occupiedSides);
    const halfWidth = object.getSize().width / 2;
    const halfHeight = object.getSize().height / 2;

    const robotHalfHeight = robot.getSize().height / 2;
    const robotHalfWidth = robot.getSize().width / 2;
    const objectPosition = object.getPosition();
    switch (side) {
      case ObjectSide.Top:
        this.updateDestination(new Coordinates(objectPosition.x, objectPosition.y - halfHeight - robotHalfHeight));
        break;
      case ObjectSide.Bottom:
        this.updateDestination(new Coordinates(objectPosition.x, objectPosition.y + halfHeight + robotHalfHeight));
        break;
      case ObjectSide.Left:
        this.updateDestination(new Coordinates(objectPosition.x - halfWidth - robotHalfWidth, objectPosition.y));
        break;
      case ObjectSide.Right:
        this.updateDestination(new Coordinates(objectPosition.x + halfWidth + robotHalfWidth, objectPosition.y));
        break;
    }
  }

  // Execute movement based on the trajectory
  public executeTurnBasedObjectPush(
    assignedRobot: Robot,
    robotPosition: ObjectSide,
    object: Entity,
    planningController: PlanningController,
  ) {
    if (!object) {
      throw new Error("Object must be set before planning trajectory.");
    }

    const objectBody = object.getBody();

    const index = planningController.getCurrentIndex();
    const trajectory = planningController.getTrajectory();

    if (index < trajectory.length) {
      const targetPosition = trajectory[index];

      if (robotPosition === targetPosition.side) {
        const pushForce = Vector.normalise(Vector.sub(targetPosition.position, objectBody.position));
        Body.applyForce(assignedRobot.getBody(), objectBody.position, Vector.mult(pushForce, 0.8));
      } else {
        const relativePosition = this.getRelativePosition(object, robotPosition);
        const desiredPosition = Vector.add(objectBody.position, relativePosition);

        Body.setPosition(assignedRobot.getBody(), desiredPosition);
      }
    }
  }

  private getRelativePosition(object: Entity, index: ObjectSide): Vector {
    switch (index) {
      case ObjectSide.Bottom:
        return Vector.create(0, object.getSize().height / 2 + ROBOT_RADIUS + 1);
      case ObjectSide.Top:
        return Vector.create(0, -object.getSize().height / 2 - ROBOT_RADIUS - 1);
      case ObjectSide.Right:
        return Vector.create(object.getSize().width / 2 + ROBOT_RADIUS + 1, 0);
      case ObjectSide.Left:
        return Vector.create(-object.getSize().width / 2 - ROBOT_RADIUS - 1, 0);
    }
  }

  getObstacleId() {
    return this.obstacleBody?.id;
  }

  public onSensorCollisionStart(obstacle: Body, robot: Robot) {
    this.obstacleBody = obstacle;

    const robotPosition = robot.getPosition();
    const closestVertex = obstacle.vertices.reduce((prev, current) =>
      Vector.magnitude(Vector.sub(robotPosition, current)) < Vector.magnitude(Vector.sub(robotPosition, prev))
        ? current
        : prev,
    );

    this.edgeIndex = obstacle.vertices.findIndex((vertex) => vertex === closestVertex);
    this.t = 0;
  }

  public findClosestObstacle(robot: Robot, obstacles: Entity[]) {
    const bodies = obstacles.map((obstacle) => obstacle.getBody());
    const robotPosition = this.mainDestination;
    const closestObstacle = bodies.reduce((prev, current) =>
      Vector.magnitude(Vector.sub(robotPosition, current.position)) <
      Vector.magnitude(Vector.sub(robotPosition, prev.position))
        ? current
        : prev,
    );

    return closestObstacle;
  }

  public calibratePosition(robot: Robot, obstacles: Entity[]) {
    if (!this.obstacleBody) return;
    const a = getDistancedVertex(this.edgeIndex);
    const start = Vector.add(this.obstacleBody.vertices[this.edgeIndex], a);

    const futurePosition = new Coordinates(start.x, start.y);
    this.move(robot, futurePosition, false);

    const distance = Vector.magnitude(Vector.sub(start, robot.getPosition()));

    const isInAnotherObstacle = obstacles.some((obstacle) =>
      Bounds.contains(obstacle.getBody().bounds, futurePosition),
    );
    if (distance < 5 || isInAnotherObstacle) {
      robot.state = RobotState.OBSTACLE_AVOIDANCE;
    }
  }

  public followBorder(robot: Robot, bodies: Body[]) {
    if (!this.obstacleBody) return;

    const obstaclePosition = this.obstacleBody.vertices;
    const speed = 0.01;

    const start = obstaclePosition[this.edgeIndex];
    // const end = obstaclePosition[(this.edgeIndex + 1) % obstaclePosition.length];

    const startVertex = Vector.add(getDistancedVertex(this.edgeIndex), start);
    // const endVertex = getDistancedVertex((this.edgeIndex + 1) % obstaclePosition.length);

    // const body = robot.getBody();
    const newCoords = new Coordinates(startVertex.x, startVertex.y);
    this.move(robot, newCoords, false);

    // body.position.x = lerp(start.x + startVertex.x, end.x + endVertex.x, this.t);
    // body.position.y = lerp(start.y + startVertex.y, end.y + endVertex.y, this.t);

    const b = Query.ray(bodies, robot.getPosition(), { x: this.mainDestination.x, y: this.mainDestination.y }, 60);

    if (b.length === 0) {
      robot.state = RobotState.SEARCHING;
      this.obstacleBody = undefined;
    }
    const distance = Vector.magnitude(Vector.sub(startVertex, robot.getPosition()));

    const futurePosition = new Coordinates(startVertex.x, startVertex.y);

    const isInAnotherObstacle = bodies.some((obstacle) => Bounds.contains(obstacle.bounds, futurePosition));

    // this.t += speed;
    if (distance < 5 || isInAnotherObstacle) {
      // this.t = 0;
      this.edgeIndex = (this.edgeIndex + 1) % obstaclePosition.length; // Move to the next edge
    }
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getDistancedVertex(edgeIndex: number) {
  let additionalX = 0;
  let additionalY = 0;
  const distance = ROBOT_RADIUS + 35;
  switch (edgeIndex) {
    case 0:
      additionalY = -distance;
      additionalX = -distance;
      break;
    case 1:
      additionalX = distance;
      additionalY = -distance;
      break;
    case 2:
      additionalX = distance;
      additionalY = distance;
      break;
    case 3:
      additionalX = -distance;
      additionalY = distance;
      break;
  }

  return { x: additionalX, y: additionalY };
}
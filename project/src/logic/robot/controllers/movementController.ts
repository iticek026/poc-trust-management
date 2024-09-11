import { Body, Bounds, Query, Vector } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";
import { Coordinates } from "../../environment/coordinates";
import { Environment } from "../../environment/environment";
import { ObjectSide } from "../../common/interfaces/interfaces";
import { Entity } from "../../common/entity";
import { PlanningController } from "./planningController";
import { OccupiedSides } from "../../common/interfaces/occupiedSide";
import { getDistancedVertex, randomBorderPosition } from "../../../utils/environment";

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

  constructor(environment: Environment) {
    this.currentDestination = randomBorderPosition(environment.size.width, environment.size.height);
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
  }

  getMainDestination() {
    return this.mainDestination;
  }

  public move(robot: Robot, currentDestination?: Coordinates, changesMainDestination = true): void {
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
      this.stop(robot);
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

  moveRobotToAssignedSide(robot: Robot, object: Entity, side: ObjectSide, occupiedSides: OccupiedSides): boolean {
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
    this.stop(robot);

    const distance = Vector.magnitude(Vector.sub(targetPosition, robot.getPosition()));
    if (distance < 5) {
      occupiedSides[side].isOccupied = true;
      occupiedSides[side].robotId = robot.getId();
      return true;
    }

    return false;
  }

  // Execute movement based on the trajectory
  public executeTurnBasedObjectPush(
    assignedRobot: Robot,
    robotPosition: ObjectSide,
    object: Entity | undefined,
    planningController: PlanningController,
  ) {
    if (!object) {
      throw new Error("Object must be set before planning trajectory.");
    }

    const objectBody = object.getBody();

    const index = planningController.getStep();
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
  }

  public findClosestObstacleToFinalDestination(obstacles: Entity[]) {
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

  public calibrateObjectAvoidancePosition(robot: Robot, obstacles: Entity[]): boolean {
    if (!this.obstacleBody || obstacles.length === 0) return false;
    const a = getDistancedVertex(this.edgeIndex);
    const start = Vector.add(this.obstacleBody.vertices[this.edgeIndex], a);

    const futurePosition = new Coordinates(start.x, start.y);
    this.move(robot, futurePosition, false);

    const distance = Vector.magnitude(Vector.sub(start, robot.getPosition()));

    const isInAnotherObstacle = obstacles.some((obstacle) =>
      Bounds.contains(obstacle.getBody().bounds, futurePosition),
    );

    return distance < 5 || isInAnotherObstacle;
  }

  public avoidObstacle(robot: Robot, bodies: Body[]): boolean {
    if (!this.obstacleBody) return false;

    const isFreeSpaceInFrontOfRobot = Query.ray(
      bodies,
      robot.getPosition(),
      { x: this.mainDestination.x, y: this.mainDestination.y },
      ROBOT_RADIUS * 2,
    );

    if (isFreeSpaceInFrontOfRobot.length === 0) {
      this.obstacleBody = undefined;
      return true;
    }

    const obstacleVertices = this.obstacleBody.vertices;
    const startVertex = Vector.add(getDistancedVertex(this.edgeIndex), obstacleVertices[this.edgeIndex]);

    const finalDestination = new Coordinates(startVertex.x, startVertex.y);
    this.move(robot, finalDestination, false);

    const distance = Vector.magnitude(Vector.sub(startVertex, robot.getPosition()));
    const futurePosition = new Coordinates(startVertex.x, startVertex.y);
    const isFinalDestinationAnotherObstacle = bodies.some((obstacle) =>
      Bounds.contains(obstacle.bounds, futurePosition),
    );

    if (distance < 5 || isFinalDestinationAnotherObstacle) {
      this.edgeIndex = (this.edgeIndex + 1) % obstacleVertices.length; // Move to the next edge
    }

    return false;
  }
}

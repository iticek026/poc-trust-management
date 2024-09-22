import { Body, Bounds, Query, Vector } from "matter-js";
import { Robot, ROBOT_RADIUS } from "../robot";
import { Coordinates } from "../../environment/coordinates";
import { Environment } from "../../environment/environment";
import { ObjectSide } from "../../common/interfaces/interfaces";
import { Entity } from "../../common/entity";
import { OccupiedSides } from "../../common/interfaces/occupiedSide";
import { getDistancedVertex, randomBorderPosition } from "../../../utils/environment";
import { getObjectMiddleSideCoordinates } from "../../../utils/robotUtils";
import { isNearFinalDestination } from "../../../utils/movement";

export interface MovementControllerInterface {
  /**
   * Set movement direction towards the currentDestination or continue moving towards the last set currentDestination
   * @param currentDestination
   */
  move(currentDestination?: Coordinates): void;

  /**
   * Stops robot movement
   * @param robot
   */
  stop(): void;
}

const ROBOT_SPEED = 10;

export class MovementController implements MovementControllerInterface {
  private currentDestination: Coordinates;
  private mainDestination: Coordinates;
  private obstacleBody?: Body;
  private edgeIndex = 0;
  private robot: Robot;

  constructor(robot: Robot, environment: Environment) {
    this.currentDestination = randomBorderPosition(environment.size.width, environment.size.height);
    this.mainDestination = this.currentDestination;
    this.robot = robot;
  }

  private updateDestination(currentDestination?: Coordinates, mainDestination = true) {
    if (mainDestination) {
      this.mainDestination = currentDestination ?? this.mainDestination;
    }
    this.currentDestination = currentDestination ?? this.currentDestination;

    return mainDestination ? this.mainDestination : this.currentDestination;
  }

  public stop(): void {
    this.robot.stopBody();
  }

  getMainDestination() {
    return this.mainDestination;
  }

  public move(currentDestination?: Coordinates, changesMainDestination = true): void {
    const destination = this.updateDestination(currentDestination, changesMainDestination);
    const { x: destinationX, y: destinationY } = destination;

    const direction = {
      x: destinationX - this.robot.getBody().position.x,
      y: destinationY - this.robot.getBody().position.y,
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

      Body.setVelocity(this.robot.getBody(), velocity);
    } else {
      this.stop();
    }
  }

  findNearestAvailableSide(object: Body, occupiedSides: OccupiedSides): keyof typeof ObjectSide {
    const objectPosition = object.position;
    const robotPosition = this.robot.getPosition();

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

  moveRobotToAssignedSide(object: Entity, side: ObjectSide) {
    const targetPosition = getObjectMiddleSideCoordinates(object, side);
    this.robot.setPosition(targetPosition);
    this.stop();
  }

  getObstacleId() {
    return this.obstacleBody?.id;
  }

  resetObstacle() {
    this.obstacleBody = undefined;
  }

  public onSensorCollisionStart(obstacle: Body) {
    this.obstacleBody = obstacle;

    const robotPosition = this.robot.getPosition();
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

  public calibrateObjectAvoidancePosition(obstacles: Entity[]): boolean {
    if (!this.obstacleBody || obstacles.length === 0) return false;
    const a = getDistancedVertex(this.edgeIndex);
    const start = Vector.add(this.obstacleBody.vertices[this.edgeIndex], a);

    const futurePosition = new Coordinates(start.x, start.y);
    this.move(futurePosition, false);

    const isInAnotherObstacle = obstacles.some((obstacle) =>
      Bounds.contains(obstacle.getBody().bounds, futurePosition),
    );

    return isNearFinalDestination(start, this.robot.getPosition()) || isInAnotherObstacle;
  }

  public avoidanceCompleted(entities: Entity[]): boolean {
    const obstacles = entities.map((obstacle) => obstacle.getBody());

    const isFreeSpaceInFrontOfRobot = Query.ray(
      obstacles,
      this.robot.getPosition(),
      { x: this.mainDestination.x, y: this.mainDestination.y },
      ROBOT_RADIUS * 2,
    );

    return isFreeSpaceInFrontOfRobot.length === 0;
  }

  public avoidObstacle(entities: Entity[]) {
    if (!this.obstacleBody) return false;

    const bodies = entities.map((obstacle) => obstacle.getBody());

    const obstacleVertices = this.obstacleBody.vertices;
    const startVertex = Vector.add(getDistancedVertex(this.edgeIndex), obstacleVertices[this.edgeIndex]);

    const finalDestination = new Coordinates(startVertex.x, startVertex.y);
    this.move(finalDestination, false);

    const distance = Vector.magnitude(Vector.sub(startVertex, this.robot.getPosition()));
    const futurePosition = new Coordinates(startVertex.x, startVertex.y);
    const isFinalDestinationAnotherObstacle = bodies.some((obstacle) =>
      Bounds.contains(obstacle.bounds, futurePosition),
    );

    if (distance < 5 || isFinalDestinationAnotherObstacle) {
      this.edgeIndex = (this.edgeIndex + 1) % obstacleVertices.length; // Move to the next edge
    }
  }
}

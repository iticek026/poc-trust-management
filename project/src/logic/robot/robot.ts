import { Body, Query } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { DetectionController } from "./controllers/detectionController";
import { EntityType, ObjectSide, RobotState } from "../common/interfaces/interfaces";
import { Entity } from "../common/entity";
import { Size } from "../common/interfaces/size";
import { PlanningController } from "./controllers/planningController";
import { createRobot } from "../../utils/bodies";
import { CommunicationController } from "./controllers/communication/comunicationController";
import { Message, MessageType } from "../common/interfaces/task";
import { OccupiedSides } from "../common/interfaces/occupiedSide";
import { StateManagement } from "../stateManagement/stateManagement";

// https://stackoverflow.com/questions/67648409/how-to-move-body-to-another-position-with-animation-in-matter-js

export const ROBOT_RADIUS = 30;
export const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

export abstract class Robot extends Entity {
  protected movementController: MovementController;
  protected detectionController: DetectionController;
  protected communicationController: CommunicationController | undefined;
  protected stateManagement: StateManagement;

  protected assignedSide: ObjectSide | undefined;

  constructor(position: Coordinates, movementController: MovementController, detectionController: DetectionController) {
    super(EntityType.ROBOT, position, { width: ROBOT_RADIUS, height: ROBOT_RADIUS });

    this.movementController = movementController;
    this.detectionController = detectionController;
    this.stateManagement = new StateManagement();
  }

  getAssignedSide() {
    return this.assignedSide;
  }

  protected setCommunicationController(communicationController: CommunicationController): void {
    this.communicationController = communicationController;
  }

  abstract assignCommunicationController(robots: Robot[]): void;

  protected create(position: Coordinates) {
    const robotParts = createRobot();

    const body = Body.create({
      parts: robotParts,
      collisionFilter: { group: -1 },
      render: { fillStyle: "blue", strokeStyle: "blue", lineWidth: 3 },
    });

    Body.setPosition(body, position);

    return body;
  }

  private reportStatus() {
    return {
      id: this.getId(),
      position: this.getPosition(),
      state: this.stateManagement.getState(),
      assignedSide: this.assignedSide,
    };
  }

  getSize(): Size {
    return { width: ROBOT_RADIUS * 2, height: ROBOT_RADIUS * 2 };
  }

  getCommunicationController(): CommunicationController | undefined {
    return this.communicationController;
  }

  private notifyOtherMembers(searchedObject: Entity) {
    this.communicationController?.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y },
    });
  }

  public update(occupiedSides: OccupiedSides, destination?: Coordinates): Entity[] {
    const { searchedItem, obstacles } = this.detectionController.detectNearbyObjects(this);

    if (this.stateManagement.isCalibratingPosition()) {
      if (searchedItem) {
        this.handleCalibratingPosition(searchedItem, occupiedSides);
      } else {
        const isCalibrated = this.movementController.calibrateObjectAvoidancePosition(this, obstacles);
        if (isCalibrated) {
          this.stateManagement.changeState(RobotState.OBSTACLE_AVOIDANCE);
        }
      }
    } else if ((this.stateManagement.isTransporting() || this.stateManagement.isPlanning()) && searchedItem) {
      this.handleTransportingOrPlanning(searchedItem);
    } else if (this.stateManagement.isObstacleAvoidance()) {
      if (obstacles.length > 0) {
        const closestObstacle = this.movementController.findClosestObstacleToFinalDestination(obstacles);
        if (this.movementController.getObstacleId() && closestObstacle.id !== this.movementController.getObstacleId()) {
          this.movementController.onSensorCollisionStart(closestObstacle, this);
          this.stateManagement.changeState(RobotState.CALIBRATING_POSITION);
          this.movementController.stop(this);
          return obstacles;
        }
      }

      const allObstacles = obstacles.map((obstacle) => obstacle.getBody());

      const alreadyAvoided = this.movementController.avoidObstacle(this, allObstacles);
      if (alreadyAvoided) {
        this.stateManagement.changeState(RobotState.SEARCHING);
      }
    } else if (this.stateManagement.isSearching()) {
      this.handleSearchingState(searchedItem, obstacles, destination);
    }

    return obstacles;
  }

  private handleSearchingState(searchedItem: Entity | undefined, obstacles: Entity[], destination?: Coordinates) {
    const allObstacles = obstacles.map((obstacle) => obstacle.getBody());

    const mainDestination = this.movementController.getMainDestination();
    // this.detectionController.castRay(this, allObstacles, mainDestination, this.cache);
    let b = Query.ray(allObstacles, this.getPosition(), { x: mainDestination.x, y: mainDestination.y }, 60);
    const obstacleId = this.movementController.getObstacleId();
    b = b.filter((body) => body.bodyB.id !== obstacleId);

    if (searchedItem) {
      this.notifyOtherMembers(searchedItem);
      this.stateManagement.changeState(RobotState.CALIBRATING_POSITION);
    } else if (obstacles.length > 0 && b.length > 0) {
      const closestObstacle = this.movementController.findClosestObstacleToFinalDestination(obstacles);
      this.movementController.onSensorCollisionStart(closestObstacle, this);
      this.stateManagement.changeState(RobotState.CALIBRATING_POSITION);
      this.movementController.stop(this);
    } else {
      this.move(destination);
    }
  }

  private handleCalibratingPosition(objectToPush: Entity, occupiedSides: OccupiedSides) {
    if (!this.assignedSide) {
      this.assignedSide = this.assignSide(objectToPush, occupiedSides);
    }

    const isAtAssignedSide = this.movementController.moveRobotToAssignedSide(
      this,
      objectToPush,
      this.assignedSide as ObjectSide,
      occupiedSides,
    );
    if (isAtAssignedSide) {
      this.stateManagement.changeState(RobotState.IDLE);
    }
  }

  private assignSide(objectToPush: Entity, occupiedSides: OccupiedSides): ObjectSide {
    const nearestSide = this.movementController.findNearestAvailableSide(
      this.getBody(),
      objectToPush.getBody(),
      occupiedSides,
    );
    return ObjectSide[nearestSide];
  }

  private handleTransportingOrPlanning(objectToPush: Entity) {
    // Implement logic for transporting or planning if needed
    // This can be expanded or adapted depending on what needs to be done
  }

  public executePush(robotSide: ObjectSide, object: Entity, planningController: PlanningController) {
    this.movementController.executeTurnBasedObjectPush(this, robotSide, object, planningController);
  }

  public executeTask(message: Message) {
    switch (message.content.type) {
      case "MOVE_TO_LOCATION":
        const coordinates = new Coordinates(message.content.payload.x, message.content.payload.y);
        this.handleMoveToLocation(coordinates);
        break;
      case "CHANGE_BEHAVIOR":
        this.handleChangeBehavior(message.content.payload);
        break;
      case "REPORT_STATUS":
        this.reportStatus();
        break;
      default:
        console.log(`Unknown message type: ${message.content.type}`);
    }
  }

  private handleMoveToLocation(location: Coordinates) {
    console.log(`Robot ${this.getId()} moving to location:`, location);
    this.move(location);
  }

  private handleChangeBehavior(newBehavior: RobotState) {
    console.log(`Robot ${this.getId()} changing behavior to:`, newBehavior);
    this.stateManagement.changeState(newBehavior);
  }

  public stop() {
    this.movementController.stop(this);
    this.stateManagement.changeState(RobotState.IDLE);
  }

  public move(destination?: Coordinates) {
    if (this.stateManagement.isIdle()) return;
    this.movementController.move(this, destination);
  }

  public updateState(newState: RobotState) {
    this.stateManagement.changeState(newState);
  }
}

import { Body } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { DetectionController } from "./controllers/detectionController";
import { EntityType, ObjectSide, RobotState } from "../common/interfaces/interfaces";
import { Entity } from "../common/entity";
import { Size } from "../common/interfaces/size";
import { PlanningController } from "./controllers/planningController";
import { createRobot } from "../../utils/bodies";
import { CommunicationController } from "./controllers/communication/comunicationController";
import { MessageType } from "../common/interfaces/task";
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

  // public executePush(robotSide: ObjectSide, object: Entity, planningController: PlanningController) {
  //   this.movementController.executeTurnBasedObjectPush(this, robotSide, object, planningController);
  // }

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

  getAssignedSide() {
    return this.assignedSide;
  }

  getSize(): Size {
    return { width: ROBOT_RADIUS * 2, height: ROBOT_RADIUS * 2 };
  }

  getCommunicationController(): CommunicationController | undefined {
    return this.communicationController;
  }

  getState(): RobotState {
    return this.stateManagement.getState();
  }

  public update(
    occupiedSides: OccupiedSides,
    destination?: Coordinates,
    planningController?: PlanningController,
  ): { searchedItem?: Entity; obstacles: Entity[] } {
    const { searchedItem, obstacles } = this.detectionController.detectNearbyObjects(this);

    if (this.stateManagement.isCalibratingPosition()) {
      this.handleCalibratingPositionState(searchedItem, obstacles, occupiedSides);
    } else if (this.isPlanning(searchedItem)) {
      this.handlePlanningState();
    } else if (this.isTransporting(searchedItem)) {
      this.handleTransporting(planningController, searchedItem);
    } else if (this.stateManagement.isObstacleAvoidance()) {
      this.handleObstacleAvoidanceState(obstacles);
    } else if (this.stateManagement.isSearching()) {
      this.handleSearchingState(searchedItem, obstacles, destination);
    }

    return { searchedItem, obstacles };
  }

  private handleCalibratingPositionState(
    searchedItem: Entity | undefined,
    obstacles: Entity[],
    occupiedSides: OccupiedSides,
  ) {
    if (searchedItem) {
      this.handleCalibratingPosition(searchedItem, occupiedSides);
    } else {
      const isCalibrated = this.movementController.calibrateObjectAvoidancePosition(this, obstacles);
      if (isCalibrated) {
        this.stateManagement.changeState(RobotState.OBSTACLE_AVOIDANCE);
      }
    }
  }

  private isTransporting(searchedItem: Entity | undefined): boolean {
    return this.stateManagement.isTransporting() && searchedItem !== undefined;
  }

  private isPlanning(searchedItem: Entity | undefined): boolean {
    return this.stateManagement.isPlanning() && searchedItem !== undefined;
  }

  private handleObstacleAvoidanceState(obstacles: Entity[]) {
    if (obstacles.length > 0) {
      const closestObstacle = this.movementController.findClosestObstacleToFinalDestination(obstacles);
      const obstacleId = this.movementController.getObstacleId();

      if (obstacleId && closestObstacle.id !== obstacleId) {
        this.handleObstacleCollision(closestObstacle);
        return;
      }
    }

    const allObstacles = obstacles.map((obstacle) => obstacle.getBody());
    const alreadyAvoided = this.movementController.avoidObstacle(this, allObstacles);

    if (alreadyAvoided) {
      this.stateManagement.changeState(RobotState.SEARCHING);
    }
  }

  private handleSearchingState(searchedItem: Entity | undefined, obstacles: Entity[], destination?: Coordinates) {
    const allObstacles = obstacles.map((obstacle) => obstacle.getBody());
    const filteredObstacles = this.getFilteredObstacles(allObstacles);

    if (searchedItem) {
      this.notifyOtherMembers(searchedItem);
      this.stateManagement.changeState(RobotState.CALIBRATING_POSITION);
    } else if (obstacles.length > 0 && filteredObstacles.length > 0) {
      const closestObstacle = this.movementController.findClosestObstacleToFinalDestination(obstacles);
      this.handleObstacleCollision(closestObstacle);
    } else {
      this.move(destination);
    }
  }

  private handlePlanningState() {
    this.stateManagement.changeState(RobotState.TRANSPORTING);
  }

  private handleObstacleCollision(closestObstacle: Body) {
    this.movementController.onSensorCollisionStart(closestObstacle, this);
    this.stateManagement.changeState(RobotState.CALIBRATING_POSITION);
    this.movementController.stop(this);
  }

  private getFilteredObstacles(obstacles: Body[]): Entity[] {
    const mainDestination = this.movementController.getMainDestination();
    let bodies = this.detectionController.castRay(this, obstacles, mainDestination);
    const obstacleId = this.movementController.getObstacleId();
    return bodies.filter((body) => body.getId() !== obstacleId);
  }

  protected setCommunicationController(communicationController: CommunicationController): void {
    this.communicationController = communicationController;
  }

  abstract assignCommunicationController(robots: Robot[]): void;

  protected create(position: Coordinates) {
    return createRobot(position);
  }

  private notifyOtherMembers(searchedObject: Entity) {
    this.communicationController?.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y },
    });
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

  private handleTransporting(planningController?: PlanningController, objectToPush?: Entity) {
    if (!this.assignedSide || !planningController) {
      throw new Error("Assigned side must be set before transporting object.");
    }

    this.movementController.executeTurnBasedObjectPush(this, this.assignedSide, objectToPush, planningController);

    // Implement logic for transporting or planning if needed
    // This can be expanded or adapted depending on what needs to be done
  }
}

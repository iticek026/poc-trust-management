import { Body } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { DetectionController } from "./controllers/detectionController";
import { EntityType, ObjectSide, RobotState } from "../common/interfaces/interfaces";
import { Entity } from "../common/entity";
import { Size } from "../common/interfaces/size";
import { createRobot } from "../../utils/bodies";
import { CommunicationController } from "./controllers/communication/comunicationController";
import { MessageType } from "../common/interfaces/task";
import { OccupiedSides } from "../common/interfaces/occupiedSide";
import { MissionStateHandlerInstance } from "../simulation/missionStateHandler";

import { createMachine, StateMachineReturtValue, StateMachineState } from "../stateMachine/stateMachine";

import { RobotUpdateCycle } from "./controllers/interfaces";
import { createRobotStateMachine } from "../stateMachine/robotStateMachine";
import { PlanningController } from "./controllers/planningController";

// https://stackoverflow.com/questions/67648409/how-to-move-body-to-another-position-with-animation-in-matter-js

export const ROBOT_RADIUS = 30;
export const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

export abstract class Robot extends Entity {
  protected movementController: MovementController;
  protected detectionController: DetectionController;
  protected communicationController?: CommunicationController;
  protected planningController: PlanningController;

  protected stateMachine: (robot: Robot, state: StateMachineState) => StateMachineReturtValue;
  private state: RobotState;

  protected assignedSide: ObjectSide | undefined;

  constructor(
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
  ) {
    super(EntityType.ROBOT, position, { width: ROBOT_RADIUS, height: ROBOT_RADIUS });

    this.movementController = movementControllerFactory(this);
    this.detectionController = detectionControllerFactory(this);
    this.planningController = planningControllerFactory(this);

    this.stateMachine = createMachine(createRobotStateMachine());
    this.state = RobotState.SEARCHING;
  }

  public stop() {
    this.movementController.stop();
    this.state = RobotState.IDLE;
  }

  public move(destination?: Coordinates) {
    if (this.state === RobotState.IDLE) return;
    this.movementController.move(destination);
  }

  public updateState(newState: RobotState) {
    this.state = newState;
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
    return this.state;
  }

  public update(args: RobotUpdateCycle): { searchedItem?: Entity; obstacles: Entity[] } {
    const { searchedItem, obstacles } = this.detectionController.detectNearbyObjects();

    this.state = this.stateMachine(this, { ...args, searchedItem, obstacles }).transition(this.state, "switch");

    MissionStateHandlerInstance.addObstacles(obstacles);

    return { searchedItem, obstacles };
  }

  getMovementController() {
    return this.movementController;
  }

  public getObstaclesInFrontOfRobot(obstacles: Body[]): Entity[] {
    const mainDestination = this.movementController.getMainDestination();
    let bodies = this.detectionController.castRay(obstacles, mainDestination);
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

  public notifyOtherMembers(searchedObject: Entity) {
    this.communicationController?.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y },
    });
  }

  public assignSide(objectToPush: Entity, occupiedSides: OccupiedSides) {
    const nearestSide = this.movementController.findNearestAvailableSide(objectToPush.getBody(), occupiedSides);

    const side = ObjectSide[nearestSide];
    this.assignedSide = ObjectSide[nearestSide];
    occupiedSides[side].isOccupied = true;
    occupiedSides[side].robotId = this.getId();
  }
}

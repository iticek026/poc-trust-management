import { Body, IChamferableBodyDefinition, Vector } from "matter-js";
import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { DetectionController } from "./controllers/detectionController";
import { EntityType, ObjectSide, RobotState } from "../common/interfaces/interfaces";
import { Entity } from "../common/entity";
import { Size } from "../common/interfaces/size";
import { createRobot } from "../../utils/bodies";
import { MissionStateHandlerInstance } from "../simulation/missionStateHandler";

import {
  createMachine,
  StateMachineDefinition,
  StateMachineReturtValue,
  StateMachineState,
} from "../stateMachine/stateMachine";

import { RobotUpdateCycle } from "./controllers/interfaces";
import { PlanningController } from "./controllers/planningController";

import { RobotInterface } from "./interface";
import { TrustRobot } from "../tms/actors/trustRobot";
import { BaseCommunicationControllerInterface } from "./controllers/communication/interface";
import { Logger } from "../logger/logger";
import { timestamp } from "../simulation/simulation";

export const ROBOT_RADIUS = 30;

export abstract class Robot extends Entity implements RobotInterface {
  protected movementController: MovementController;
  protected detectionController: DetectionController;
  protected planningController: PlanningController;
  protected communicationController: BaseCommunicationControllerInterface;
  protected lastPosition: { position: Vector; logTime: number };

  private robotsInInteraction: Set<number> = new Set();
  private stateMachine: (robot: TrustRobot, state: StateMachineState) => StateMachineReturtValue;
  private state: RobotState;

  protected isActive: boolean = true;

  protected assignedSide: ObjectSide | undefined;

  constructor(
    label: string,
    position: Coordinates,
    movementControllerFactory: (robot: Robot) => MovementController,
    detectionControllerFactory: (robot: Robot) => DetectionController,
    planningControllerFactory: (robot: Robot) => PlanningController,
    stateMachineDefinition: StateMachineDefinition<TrustRobot>,
    communicationController: BaseCommunicationControllerInterface,
  ) {
    super(label, EntityType.ROBOT, position, { width: ROBOT_RADIUS, height: ROBOT_RADIUS });

    this.movementController = movementControllerFactory(this);
    this.detectionController = detectionControllerFactory(this);
    this.planningController = planningControllerFactory(this);

    this.stateMachine = createMachine(stateMachineDefinition);
    this.state = RobotState.SEARCHING;
    this.communicationController = communicationController;
    this.lastPosition = { position, logTime: 0 };
  }

  getIsActive() {
    return this.isActive;
  }

  setIsActive(isActive: boolean) {
    this.isActive = isActive;
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
    Logger.info(`[${this.getLabel()}]: changed state from ${this.state} to ${newState}`, console.trace());
    this.state = newState;
  }

  getAssignedSide() {
    return this.assignedSide;
  }

  getActualAssignedSide() {
    return this.assignedSide;
  }

  setAssignedSide(side: ObjectSide) {
    this.assignedSide = side;
  }

  getSize(): Size {
    return { width: ROBOT_RADIUS * 2, height: ROBOT_RADIUS * 2 };
  }

  getState(): RobotState {
    return this.state;
  }

  protected create(position: Coordinates, options?: IChamferableBodyDefinition) {
    return createRobot(position, options?.render?.fillStyle);
  }

  protected updateCircle(
    robot: TrustRobot,
  ): (args: RobotUpdateCycle) => { searchedItem?: Entity; obstacles: Entity[] } {
    return (args: RobotUpdateCycle) => {
      const { searchedItem, obstacles, robots } = this.detectionController.detectNearbyObjects();

      this.state = this.stateMachine(robot, {
        ...args,
        searchedItem,
        obstacles,
        robots,
        robotsInInteraction: this.robotsInInteraction,
        lastPosition: this.lastPosition,
      }).transition(this.state, "switch");

      if (timestamp >= this.lastPosition.logTime + 1000) {
        const currentPosition = { ...this.getPosition() };
        this.lastPosition = {
          logTime: timestamp,
          position: currentPosition,
        };
      }

      this.robotsInInteraction = new Set(robots.map((robot) => robot.getId()));

      MissionStateHandlerInstance.addObstacles(obstacles);

      return { searchedItem, obstacles };
    };
  }

  getMovementController() {
    return this.movementController;
  }

  getPlanningController() {
    return this.planningController;
  }

  getObstaclesInFrontOfRobot(obstacles: Body[]): Entity[] {
    const mainDestination = this.movementController.getMainDestination();
    let bodies = this.detectionController.castRay(obstacles, mainDestination);
    const obstacleId = this.movementController.getObstacleId();
    return bodies.filter((body) => body.getId() !== obstacleId);
  }
}

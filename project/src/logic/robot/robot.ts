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
import { MissionState, MissionStateHandlerInstance } from "../simulation/missionStateHandler";
import { isValue } from "../../utils/checks";
import {
  createMachine,
  StateMachineDefinition,
  StateMachineReturtValue,
  StateMachineState,
} from "../../utils/stateMachine";
import { getObjectMiddleSideCoordinates } from "../../utils/robotUtils";
import { isNearFinalDestination } from "../../utils/movement";
import { RobotUpdateCycle } from "./controllers/interfaces";

// https://stackoverflow.com/questions/67648409/how-to-move-body-to-another-position-with-animation-in-matter-js

export const ROBOT_RADIUS = 30;
export const DETECTION_RADIUS = ROBOT_RADIUS * 3; // Adjust this value for the desired detection range

export abstract class Robot extends Entity {
  protected movementController: MovementController;
  protected detectionController: DetectionController;
  protected communicationController: CommunicationController | undefined;
  protected stateMachine: (robot: Robot, state: StateMachineState) => StateMachineReturtValue;
  private state: RobotState;

  protected assignedSide: ObjectSide | undefined;

  constructor(position: Coordinates, movementController: MovementController, detectionController: DetectionController) {
    super(EntityType.ROBOT, position, { width: ROBOT_RADIUS, height: ROBOT_RADIUS });

    this.movementController = movementController;
    this.detectionController = detectionController;
    this.stateMachine = createMachine(this.createStateMachine());
    this.state = RobotState.SEARCHING;
  }

  public stop() {
    this.movementController.stop(this);
    this.state = RobotState.IDLE;
  }

  public move(destination?: Coordinates) {
    if (this.state === RobotState.IDLE) return;
    this.movementController.move(this, destination);
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
    const { searchedItem, obstacles } = this.detectionController.detectNearbyObjects(this);

    this.state = this.stateMachine(this, { ...args, searchedItem, obstacles }).transition(this.state, "switch");

    MissionStateHandlerInstance.addObstacles(obstacles);

    return { searchedItem, obstacles };
  }

  getMovementController() {
    return this.movementController;
  }

  private createStateMachine(): StateMachineDefinition {
    return {
      initialState: RobotState.SEARCHING,
      states: {
        [RobotState.SEARCHING]: {
          transitions: [
            {
              switch: {
                target: RobotState.OBSTACLE_AVOIDANCE,
                condition: (_, state) => {
                  console.log("Switching to OBSTACLE_AVOIDANCE");
                  const obstaclesBodies = state.obstacles.map((obstacle) => obstacle.getBody());
                  const obstaclesInFrontOfRobot = this.getObstaclesInFrontOfRobot(obstaclesBodies);
                  return state.obstacles.length > 0 && obstaclesInFrontOfRobot.length > 0;
                },
              },
            },
            {
              switch: {
                target: RobotState.OBJECT_FOUND,
                condition: (_, state) => {
                  console.log("Switching to OBJECT_FOUND");

                  return isValue(state.searchedItem);
                },
              },
            },
          ],
          actions: {
            onEnter: () => {
              console.log("Entering searching");
            },
            onExit: () => {
              console.log("Exiting searching");
            },
            onSameState: (robot, state) => {
              robot.move(state.destination);
            },
          },
        },

        [RobotState.OBJECT_FOUND]: {
          transitions: {
            switch: {
              target: RobotState.IDLE,
              condition: (robot, state) => {
                console.log("Switching to IDLE");

                const targetPosition = getObjectMiddleSideCoordinates(
                  state.searchedItem as Entity,
                  robot.assignedSide as ObjectSide,
                );

                return isNearFinalDestination(robot.getPosition(), targetPosition);
              },
            },
          },
          actions: {
            onEnter: (robot, state) => {
              robot.notifyOtherMembers(state.searchedItem as Entity);
              robot.assignSide(state.searchedItem as Entity, state.occupiedSides);
              robot
                .getMovementController()
                .moveRobotToAssignedSide(robot, state.searchedItem as Entity, robot.getAssignedSide() as ObjectSide);
            },
            onExit: () => {},
            onSameState: () => {},
          },
        },

        [RobotState.OBSTACLE_AVOIDANCE]: {
          transitions: {
            switch: {
              target: RobotState.SEARCHING,
              condition: (robot, state) => {
                console.log("Switching to SEARCHING");

                return robot.getMovementController().avoidanceCompleted(robot, state.obstacles);
              },
            },
          },
          actions: {
            onEnter: (robot, state) => {
              const closestObstacle = robot
                .getMovementController()
                .findClosestObstacleToFinalDestination(state.obstacles);
              robot.getMovementController().onSensorCollisionStart(closestObstacle, robot);
            },
            onExit: (robot) => {
              robot.getMovementController().resetObstacle();
            },
            onSameState: (robot, state) => {
              robot.getMovementController().avoidObstacle(this, state.obstacles);
            },
          },
        },
        [RobotState.IDLE]: {
          transitions: {
            switch: {
              target: RobotState.IDLE,
              condition: (_, state) => {
                console.log("Switching to IDLE");

                return state.searchedItem === undefined;
              },
            },
          },
          actions: {
            onEnter: (robot) => {
              robot.stop();
            },
            onExit: () => {
              console.log("Exiting idle");
            },
            onSameState: () => {},
          },
        },
        [RobotState.PLANNING]: {
          transitions: {
            switch: {
              target: RobotState.TRANSPORTING,
              condition: () => {
                console.log("Switching to TRANSPORTING");

                return true;
              },
            },
          },
          actions: {
            onEnter: () => {},
            onExit: () => {},
            onSameState: () => {},
          },
        },
        [RobotState.TRANSPORTING]: {
          transitions: {
            switch: {
              target: RobotState.PLANNING,
              condition: (_, state) => {
                console.log("Switching to PLANNING");

                return !state.obstacles.every((o) => MissionStateHandlerInstance.getObstacleById(o.getId()));
              },
            },
          },
          actions: {
            onEnter: () => {},
            onExit: (robot) => {
              robot.getCommunicationController()?.broadcastMessage({
                type: MessageType.CHANGE_BEHAVIOR,
                payload: RobotState.PLANNING,
              });
              MissionStateHandlerInstance.setMissionState(MissionState.PLANNING);
            },
            onSameState: (robot, state) => {
              this.movementController.executeTurnBasedObjectPush(
                this,
                robot.getAssignedSide() as ObjectSide,
                state.searchedItem,
                state.planningController,
              );
            },
          },
        },
      },
    };
  }

  private getObstaclesInFrontOfRobot(obstacles: Body[]): Entity[] {
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

  public notifyOtherMembers(searchedObject: Entity) {
    this.communicationController?.broadcastMessage({
      type: MessageType.MOVE_TO_LOCATION,
      payload: { x: searchedObject.getPosition().x, y: searchedObject.getPosition().y },
    });
  }

  private assignSide(objectToPush: Entity, occupiedSides: OccupiedSides) {
    const nearestSide = this.movementController.findNearestAvailableSide(
      this.getBody(),
      objectToPush.getBody(),
      occupiedSides,
    );

    const side = ObjectSide[nearestSide];
    this.assignedSide = ObjectSide[nearestSide];
    occupiedSides[side].isOccupied = true;
    occupiedSides[side].robotId = this.getId();
  }
}

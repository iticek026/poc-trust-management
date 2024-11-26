import { isValue } from "../../utils/checks";
import { isNearFinalDestination } from "../../utils/movement";
import { getObjectMiddleSideCoordinates } from "../../utils/robotUtils";
import { StateMachineDefinition } from "./stateMachine";
import { Entity } from "../common/entity";
import { RobotState, ObjectSide } from "../common/interfaces/interfaces";
import { MessageType } from "../common/interfaces/task";
import { MissionStateHandlerInstance } from "../simulation/missionStateHandler";
import { EntityCacheInstance } from "../../utils/cache";
import { Coordinates } from "../environment/coordinates";
import { MaliciousRobot } from "../tms/actors/maliciousRobot";

export function createMaliciousStateMachine(): StateMachineDefinition<MaliciousRobot> {
  return {
    initialState: RobotState.SEARCHING,
    states: {
      [RobotState.SEARCHING]: {
        transitions: [
          {
            switch: {
              target: RobotState.OBSTACLE_AVOIDANCE,
              condition: (robot, state) => {
                const obstaclesBodies = state.obstacles.map((obstacle) => obstacle.getBody());
                const obstaclesInFrontOfRobot = robot.getObstaclesInFrontOfRobot(obstaclesBodies);
                return state.obstacles.length > 0 && obstaclesInFrontOfRobot.length > 0;
              },
            },
          },
          {
            switch: {
              target: RobotState.OBJECT_FOUND,
              condition: (_, state) => {
                return isValue(state.searchedItem) && !state.occupiedSidesHandler.areAllSidesOccupied(4);
              },
            },
          },
        ],
        actions: {
          onEnter: () => {},
          onExit: () => {},
          onSameState: (robot, state) => {
            if (state.robots.length > 0) {
              const robots = state.robots.filter((r) => !state.robotsInInteraction.has(r.getId()));
              if (robots.length > 0) {
                robot.broadcastMessage(
                  {
                    type: MessageType.REPORT_STATUS,
                    payload: ["data"],
                  },
                  robots,
                );
              }
            }

            if (state.timeElapsed) {
              robot.broadcastMessage({
                type: MessageType.MOVE_TO_LOCATION,
                payload: { x: robot.getPosition().x, y: robot.getPosition().y, fromLeader: false },
              });
              console.log(`Hello world!`);
            }

            robot.move(state.destination);
          },
        },
      },

      [RobotState.OBJECT_FOUND]: {
        transitions: {
          switch: {
            target: RobotState.IDLE,
            condition: (robot, state) => {
              const targetPosition = getObjectMiddleSideCoordinates(
                state.searchedItem as Entity,
                robot.getActualAssignedSide() as ObjectSide,
              );

              return isNearFinalDestination(robot.getPosition(), targetPosition);
            },
          },
        },
        actions: {
          onEnter: (robot, state) => {
            state.occupiedSidesHandler.assignSide(state.searchedItem as Entity, robot);
            robot
              .getMovementController()
              .moveRobotToAssignedSide(state.searchedItem as Entity, robot.getActualAssignedSide() as ObjectSide);
          },
          onExit: () => {},
          onSameState: (robot, state) => {
            if (robot.getAssignedSide()) {
              robot
                .getMovementController()
                .moveRobotToAssignedSide(state.searchedItem as Entity, robot.getActualAssignedSide() as ObjectSide);
            }
          },
        },
      },

      [RobotState.OBSTACLE_AVOIDANCE]: {
        transitions: {
          switch: {
            target: RobotState.SEARCHING,
            condition: (robot, state) => {
              return robot.getMovementController().avoidanceCompleted(state.obstacles);
            },
          },
        },
        actions: {
          onEnter: (robot, state) => {
            const closestObstacle = robot
              .getMovementController()
              .findClosestObstacleToFinalDestination(state.obstacles);
            robot.getMovementController().onSensorCollisionStart(closestObstacle);
          },
          onExit: (robot) => {
            robot.getMovementController().resetObstacle();
          },
          onSameState: (robot, state) => {
            robot.getMovementController().avoidObstacle(state.obstacles);
          },
        },
      },
      [RobotState.IDLE]: {
        transitions: [
          {
            switch: {
              target: RobotState.IDLE,
              condition: (_, state) => {
                return state.searchedItem === undefined;
              },
            },
          },
          {
            switch: {
              target: RobotState.PLANNING,
              condition: (robot, state) => {
                return (
                  state.searchedItem !== undefined &&
                  state.occupiedSidesHandler.areAllSidesOccupied(4) &&
                  state.occupiedSidesHandler.isRobotAssignedToSide(robot.getId())
                );
              },
            },
          },
        ],
        actions: {
          onEnter: (robot) => {
            robot.stop();
          },
          onExit: () => {},
          onSameState: (robot, state) => {
            // if (robot.getAssignedSide()) {
            //   robot
            //     .getMovementController()
            //     .moveRobotToAssignedSide(state.searchedItem as Entity, robot.getActualAssignedSide() as ObjectSide);
            // }
          },
        },
      },
      [RobotState.PLANNING]: {
        transitions: {
          switch: {
            target: RobotState.TRANSPORTING,
            condition: () => {
              return true;
            },
          },
        },
        actions: {
          onEnter: () => {},
          onExit: () => {},
          onSameState: () => {
            console.log(`Planning`);
          },
        },
      },
      [RobotState.TRANSPORTING]: {
        transitions: {
          switch: {
            target: RobotState.PLANNING,
            condition: (_, state) => {
              return !state.obstacles.every((o) => MissionStateHandlerInstance.getObstacleById(o.getId()));
            },
          },
        },
        actions: {
          onEnter: () => {},
          onExit: () => {},
          onSameState: (robot, state) => {
            if (!state.occupiedSidesHandler.areAllSidesOccupied(4)) {
              if (robot.getAssignedSide()) {
                robot
                  .getMovementController()
                  .moveRobotToAssignedSide(state.searchedItem as Entity, robot.getActualAssignedSide() as ObjectSide);
              }
              return;
            }

            const otherRobots = Object.values(state.occupiedSidesHandler.getOccupiedSides())
              .map((side) => side.robotId)
              .filter((id) => id !== robot.getId())
              .map((id) => EntityCacheInstance.getRobotById(id!)!);

            robot.getPlanningController().executeTurnBasedObjectPush(robot, state.searchedItem, otherRobots);
          },
        },
      },
      [RobotState.RETURNING_HOME]: {
        transitions: {},
        actions: {
          onEnter: () => {},
          onExit: () => {},
          onSameState: (robot, _) => {
            robot.move(robot.getPlanningController().getBase().getPosition() as Coordinates);
          },
        },
      },
    },
  };
}

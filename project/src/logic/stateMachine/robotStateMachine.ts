import { isValue } from "../../utils/checks";
import { isNearFinalDestination } from "../../utils/movement";
import { getObjectMiddleSideCoordinates } from "../../utils/robotUtils";
import { StateMachineDefinition } from "./stateMachine";
import { Entity } from "../common/entity";
import { RobotState, ObjectSide } from "../common/interfaces/interfaces";
import { MessageType } from "../common/interfaces/task";
import { MissionStateHandlerInstance, MissionState } from "../simulation/missionStateHandler";
import { EntityCacheInstance } from "../../utils/cache";

export function createRobotStateMachine(): StateMachineDefinition {
  return {
    initialState: RobotState.SEARCHING,
    states: {
      [RobotState.SEARCHING]: {
        transitions: [
          {
            switch: {
              target: RobotState.OBSTACLE_AVOIDANCE,
              condition: (robot, state) => {
                // console.log("Switching to OBSTACLE_AVOIDANCE");
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
                // console.log("Switching to OBJECT_FOUND");
                return isValue(state.searchedItem);
              },
            },
          },
        ],
        actions: {
          onEnter: () => {
            // console.log("Entering searching");
          },
          onExit: () => {
            // console.log("Exiting searching");
          },
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
            robot.move(state.destination);
          },
        },
      },

      [RobotState.OBJECT_FOUND]: {
        transitions: {
          switch: {
            target: RobotState.IDLE,
            condition: (robot, state) => {
              // console.log("Switching to IDLE");

              const targetPosition = getObjectMiddleSideCoordinates(
                state.searchedItem as Entity,
                robot.getAssignedSide() as ObjectSide,
              );

              return isNearFinalDestination(robot.getPosition(), targetPosition);
            },
          },
        },
        actions: {
          onEnter: (robot, state) => {
            robot.notifyOtherMembersToMove(state.searchedItem as Entity);
            robot.assignSide(state.searchedItem as Entity, state.occupiedSides);
            robot
              .getMovementController()
              .moveRobotToAssignedSide(state.searchedItem as Entity, robot.getAssignedSide() as ObjectSide);
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
              // console.log("Switching to SEARCHING");

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
        transitions: {
          switch: {
            target: RobotState.IDLE,
            condition: (_, state) => {
              // console.log("Switching to IDLE");

              return state.searchedItem === undefined;
            },
          },
        },
        actions: {
          onEnter: (robot) => {
            robot.stop();
          },
          onExit: () => {
            // console.log("Exiting idle");
          },
          onSameState: () => {},
        },
      },
      [RobotState.PLANNING]: {
        transitions: {
          switch: {
            target: RobotState.TRANSPORTING,
            condition: () => {
              // console.log("Switching to TRANSPORTING");

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
              // console.log("Switching to PLANNING");

              return !state.obstacles.every((o) => MissionStateHandlerInstance.getObstacleById(o.getId()));
            },
          },
        },
        actions: {
          onEnter: () => {},
          onExit: (robot) => {
            robot.broadcastMessage({
              type: MessageType.CHANGE_BEHAVIOR,
              payload: RobotState.PLANNING,
            });
            MissionStateHandlerInstance.setMissionState(MissionState.PLANNING);
          },
          onSameState: (robot, state) => {
            const otherRobots = Object.values(state.occupiedSides)
              .map((side) => side.robotId)
              .filter((id) => id !== robot.getId())
              .map((id) => EntityCacheInstance.getRobotById(id!)!);

            robot
              .getPlanningController()
              .executeTurnBasedObjectPush(
                robot,
                robot.getAssignedSide() as ObjectSide,
                state.searchedItem,
                otherRobots,
              );
          },
        },
      },
    },
  };
}

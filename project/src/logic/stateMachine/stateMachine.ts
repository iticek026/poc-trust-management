import { RobotState } from "../common/interfaces/interfaces";
import { DetectionResult } from "../robot/controllers/detectionController";
import { RobotUpdateCycle } from "../robot/controllers/interfaces";
import { Robot } from "../robot/robot";
import { isValue } from "../../utils/checks";

type StateMachineEvents = "switch";
type StateMachineStates = RobotState;

type ConditionalStateMachineTransition = {
  [event: string]: {
    target: StateMachineStates;
    condition: (robot: Robot, state: StateMachineState) => boolean;
  };
};

export type StateMachineDefinition = {
  initialState: StateMachineStates;
  states: {
    [state: string]: {
      transitions: ConditionalStateMachineTransition | ConditionalStateMachineTransition[];
      actions: {
        onEnter: (robot: Robot, state: StateMachineState) => void;
        onExit: (robot: Robot, state: StateMachineState) => void;
        onSameState: (robot: Robot, state: StateMachineState) => void;
      };
    };
  };
};

export type StateMachineState = RobotUpdateCycle & DetectionResult;

export type StateMachineReturtValue = {
  value: StateMachineStates;
  transition(currentState: StateMachineStates, event: StateMachineEvents): StateMachineStates;
};
export type StateMachine = (robot: Robot, state: StateMachineState) => StateMachineReturtValue;

export const createMachine =
  (stateMachineDefinition: StateMachineDefinition): StateMachine =>
  (robot: Robot, state: StateMachineState) => {
    const machine: StateMachineReturtValue = {
      value: stateMachineDefinition.initialState,
      transition: (currentState: StateMachineStates, event: StateMachineEvents) => {
        const currentStateDefinition = stateMachineDefinition.states[currentState];

        let destinationTransition;
        if (Array.isArray(currentStateDefinition.transitions)) {
          const conditionalTransition = currentStateDefinition.transitions.filter((item) =>
            item[event].condition(robot, state),
          );

          if (conditionalTransition.length > 1) {
            throw new Error("Multiple transitions are imposible, some condition is wrong");
          }

          if (conditionalTransition.length === 1) {
            destinationTransition = conditionalTransition[0][event];
          }
        } else {
          destinationTransition = currentStateDefinition.transitions[event];
        }

        if (isValue(destinationTransition) && destinationTransition.condition(robot, state)) {
          const destinationState = destinationTransition.target;
          const destinationStateDefinition = stateMachineDefinition.states[destinationState];

          currentStateDefinition.actions.onExit(robot, state);
          destinationStateDefinition.actions.onEnter(robot, state);

          machine.value = destinationState;
        } else {
          currentStateDefinition.actions.onSameState(robot, state);
          machine.value = currentState;
        }

        return machine.value;
      },
    };
    return machine;
  };

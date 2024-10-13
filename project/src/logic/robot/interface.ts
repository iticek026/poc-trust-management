import { Entity } from "../common/entity";
import { ObjectSide, RobotState } from "../common/interfaces/interfaces";
import { Size } from "../common/interfaces/size";
import { Coordinates } from "../environment/coordinates";
import { MovementController } from "./controllers/movementController";
import { PlanningController } from "./controllers/planningController";
import { Body } from "matter-js";

export interface RobotInterface {
  /**
   * Stops the robot from its current movement or activity.
   */
  stop(): void;

  /**
   * Moves the robot towards a specified destination.
   * If no destination is provided, the robot will continue its current path.
   *
   * @param destination - Optional coordinates for the robot's target location.
   */
  move(destination?: Coordinates): void;

  /**
   * Updates the robot's current state to the provided state.
   *
   * @param newState - The new state to assign to the robot (e.g., IDLE, SEARCHING).
   */
  updateState(newState: RobotState): void;

  /**
   * Retrieves the side of the object that the robot is assigned to.
   *
   * @returns The side of the object the robot is assigned to, or undefined if not assigned.
   */
  getAssignedSide(): ObjectSide | undefined;

  /**
   * Gets the size (width and height) of the robot's physical representation.
   *
   * @returns The size of the robot as a `Size` object.
   */
  getSize(): Size;

  /**
   * Retrieves the robot's current state (e.g., SEARCHING, TRANSPORTING).
   *
   * @returns The robot's current state as a `RobotState`.
   */
  getState(): RobotState;

  /**
   * Gets the robot's movement controller, which is responsible for managing
   * the robot's physical movement and path planning.
   *
   * @returns The movement controller instance.
   */
  getMovementController(): MovementController;

  /**
   * Retrieves the robot's planning controller, which is used for collaborative
   * path planning and decision-making processes.
   *
   * @returns The planning controller instance.
   */
  getPlanningController(): PlanningController;

  /**
   * Identifies and returns obstacles that are in front of the robot.
   * This helps the robot to avoid obstacles in its path.
   *
   * @param obstacles - An array of obstacles represented by `Body` objects.
   * @returns A list of `Entity` objects that represent obstacles in front of the robot.
   */
  getObstaclesInFrontOfRobot(obstacles: Body[]): Entity[];
}

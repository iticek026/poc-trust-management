import { Coordinates } from "../../environment/coordinates";
import { OccupiedSidesHandler } from "../../simulation/occupiedSidesHandler";
import { EnvironmentGrid } from "../../visualization/environmentGrid";
import { PlanningController } from "./planningController";

export type RobotUpdateCycle = {
  occupiedSidesHandler: OccupiedSidesHandler;
  planningController: PlanningController;
  grid: EnvironmentGrid;
  destination?: Coordinates;
  timeElapsed: boolean;
};

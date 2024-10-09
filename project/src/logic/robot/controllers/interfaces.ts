import { OccupiedSides } from "../../common/interfaces/occupiedSide";
import { Coordinates } from "../../environment/coordinates";
import { EnvironmentGrid } from "../../visualization/environmentGrid";
import { PlanningController } from "./planningController";

export type RobotUpdateCycle = {
  occupiedSides: OccupiedSides;
  planningController: PlanningController;
  grid: EnvironmentGrid;
  destination?: Coordinates;
  timeElapsed: boolean;
};

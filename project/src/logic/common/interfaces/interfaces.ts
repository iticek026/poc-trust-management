import { Vector } from "matter-js";

export enum EntityType {
  SEARCHED_OBJECT = "SearchedObject",
  ROBOT = "Robot",
  BASE = "Base",
}

export enum RobotState {
  IDLE = "IDLE",
  SEARCHING = "SEARCHING",
  TRANSPORTING = "TRANSPORTING",
  CALIBRATING_POSITION = "CALIBRATING_POSITION",
  PLANNING = "PLANNING",
}

export enum ObjectSide {
  Top = "Top",
  Bottom = "Bottom",
  Left = "Left",
  Right = "Right",
}

export interface TrajectoryStep {
  position: Vector;
  side: ObjectSide;
}

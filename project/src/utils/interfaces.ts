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

export enum MissioState {
  SEARCHING = "SEARCHING",
  TRANSPORTING = "TRANSPORTING",
  PLANNING = "PLANNING",
}

export enum ObjectSide {
  Top = "Top",
  Bottom = "Bottom",
  Left = "Left",
  Right = "Right",
}

export type OccupiedSide = { robotId: undefined; isOccupied: false } | { robotId: number; isOccupied: true };

export interface OccupiedSides {
  Top: OccupiedSide;
  Bottom: OccupiedSide;
  Left: OccupiedSide;
  Right: OccupiedSide;
}

export interface TrajectoryStep {
  position: Vector;
  side: ObjectSide;
}

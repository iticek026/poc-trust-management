import { Vector } from "matter-js";

export enum EntityType {
  FREE,
  SEARCHED_OBJECT,
  ROBOT,
  BASE,
  OBSTACLE,
  PATH,
  EXPLORED,
}

export enum RobotState {
  IDLE = "IDLE",
  SEARCHING = "SEARCHING",
  TRANSPORTING = "TRANSPORTING",
  CALIBRATING_POSITION = "CALIBRATING_POSITION",
  PLANNING = "PLANNING",
  OBSTACLE_AVOIDANCE = "OBSTACLE_AVOIDANCE",
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

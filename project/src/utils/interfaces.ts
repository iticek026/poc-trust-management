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

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export interface OccupiedSides {
  Top: boolean;
  Bottom: boolean;
  Left: boolean;
  Right: boolean;
}

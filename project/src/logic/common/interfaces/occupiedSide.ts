export type OccupiedSide = { robotId: undefined; isOccupied: false } | { robotId: number; isOccupied: true };

export type OccupiedSides = {
  Top: OccupiedSide;
  Bottom: OccupiedSide;
  Left: OccupiedSide;
  Right: OccupiedSide;
};

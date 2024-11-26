import { ObjectSide } from "../common/interfaces/interfaces";

export function getOppositeAssignedSide(side: ObjectSide) {
  switch (side) {
    case ObjectSide.Top:
      return ObjectSide.Bottom;
    case ObjectSide.Bottom:
      return ObjectSide.Top;
    case ObjectSide.Left:
      return ObjectSide.Right;
    case ObjectSide.Right:
      return ObjectSide.Left;
  }
}

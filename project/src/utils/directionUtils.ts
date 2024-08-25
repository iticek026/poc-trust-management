import { Vector } from "matter-js";
import { Direction } from "./interfaces";

const DIRECTION_VECTORS = {
  UP: Vector.create(0, -1),
  DOWN: Vector.create(0, 1),
  LEFT: Vector.create(-1, 0),
  RIGHT: Vector.create(1, 0),
};

export const directionToVector = (direction: Direction): Vector => {
  switch (direction) {
    case Direction.Up:
      return DIRECTION_VECTORS.UP;
    case Direction.Down:
      return DIRECTION_VECTORS.DOWN;
    case Direction.Left:
      return DIRECTION_VECTORS.LEFT;
    case Direction.Right:
      return DIRECTION_VECTORS.RIGHT;
  }
};

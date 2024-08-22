import { Coordinates } from "../logic/environment/coordinates";
import { Robot } from "../logic/robot/robot";

export default [
  new Robot(new Coordinates(0, 0)),
  new Robot(new Coordinates(600, 600)),
  //   new Robot({ x: 30, y: 30 }),
  //   new Robot({ x: 40, y: 40 }),
  //   new Robot({ x: 50, y: 50 }),
  //   new Robot({ x: 60, y: 60 }),
  //   new Robot({ x: 70, y: 70 }),
  //   new Robot({ x: 80, y: 80 }),
] satisfies Robot[];

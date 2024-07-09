import { Base } from "./base";
import { Goal } from "./goal";

export class Environment {
  goal: Goal;
  base: Base;
  height: number;
  width: number;
  constructor(goal: Goal, base: Base, height: number, width: number) {
    this.goal = goal;
    this.base = base;
    this.height = height;
    this.width = width;
  }
}

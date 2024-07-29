import { Bodies, Composite, World } from "matter-js";
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

  createBorders(world: World): void {
    const wallThickness = 100;

    Composite.add(world, [
      // Top
      Bodies.rectangle(
        this.width / 2,
        -wallThickness / 2,
        this.width,
        wallThickness,
        { isStatic: true }
      ),
      // Bottom
      Bodies.rectangle(
        this.width / 2,
        this.height + wallThickness / 2,
        this.width,
        wallThickness,
        { isStatic: true }
      ),
      // Left
      Bodies.rectangle(
        -wallThickness / 2,
        this.height / 2,
        wallThickness,
        this.height,
        { isStatic: true }
      ),
      // Right
      Bodies.rectangle(
        this.width + wallThickness / 2,
        this.height / 2,
        wallThickness,
        this.height,
        { isStatic: true }
      ),
    ]);
  }
}

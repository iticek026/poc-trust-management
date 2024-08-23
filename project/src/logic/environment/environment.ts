import { World, Composite, Bodies } from "matter-js";
import { Base } from "./base";
import { CollapsibleObject } from "./collapsibleObject";
import { Size } from "./interfaces";

export class Environment {
  searchedObject: CollapsibleObject;
  base: Base;
  size: Size;
  constructor(searchedObject: CollapsibleObject, base: Base, size: Size) {
    this.searchedObject = searchedObject;
    this.base = base;
    this.size = size;
  }

  createBorders(world: World): void {
    const wallThickness = 100;

    Composite.add(world, [
      // Top
      Bodies.rectangle(
        this.size.width / 2,
        -wallThickness / 2,
        this.size.width,
        wallThickness,
        { isStatic: true }
      ),
      // Bottom
      Bodies.rectangle(
        this.size.width / 2,
        this.size.height + wallThickness / 2,
        this.size.width,
        wallThickness,
        { isStatic: true }
      ),
      // Left
      Bodies.rectangle(
        -wallThickness / 2,
        this.size.height / 2,
        wallThickness,
        this.size.height,
        { isStatic: true }
      ),
      // Right
      Bodies.rectangle(
        this.size.width + wallThickness / 2,
        this.size.height / 2,
        wallThickness,
        this.size.height,
        { isStatic: true }
      ),
    ]);
  }
}

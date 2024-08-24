import { World, Composite, Bodies } from "matter-js";
import { Base } from "./base";
import { CollapsibleObject } from "./collapsibleObject";
import { Size } from "./interfaces";
import { EnvironmentObject } from "./environmentObject";
import { Coordinates } from "./coordinates";
import { SearchedObject } from "./searchedObject";

export class Environment {
  searchedObject: CollapsibleObject;
  base: Base;
  size: Size;
  constructor(searchedObject: SearchedObject, base: Base, size: Size) {
    this.searchedObject = this.adjustCoordinates(searchedObject, size);
    this.base = this.adjustCoordinates(base, size);
    this.size = size;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  // Function to adjust the coordinates of a body to ensure it stays within bounds
  private adjustCoordinates<T extends EnvironmentObject>(
    body: T,
    envSize: Size
  ): T {
    const halfWidth = body.getSize().width / 2;
    const halfHeight = body.getSize().height / 2;

    // Clamp the body's position to keep it within the simulation area
    const adjustedX = this.clamp(
      body.getPosition().x,
      halfWidth,
      envSize.width - halfWidth
    );
    const adjustedY = this.clamp(
      body.getPosition().y,
      halfHeight,
      envSize.height - halfHeight
    );

    body.setPosition(new Coordinates(adjustedX, adjustedY));
    return body;
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

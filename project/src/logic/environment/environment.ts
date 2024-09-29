import { World, Composite, Bodies } from "matter-js";
import { Base } from "./base";
import { Size } from "../common/interfaces/size";
import { EnvironmentObject } from "./environmentObject";
import { Coordinates } from "./coordinates";
import { SearchedObject } from "./searchedObject";
import { CollapsibleObject } from "./collapsibleObject";

export class Environment {
  searchedObject: SearchedObject;
  base: Base;
  obstacles?: CollapsibleObject[];
  size: Size;
  constructor(searchedObject: SearchedObject, base: Base, size: Size, obstacles?: EnvironmentObject[]) {
    this.searchedObject = this.adjustCoordinates(searchedObject, size);
    this.base = this.adjustCoordinates(base, size);
    this.size = size;
    this.obstacles = obstacles?.map((obstacle) => this.adjustCoordinates(obstacle, size));
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private adjustCoordinates<T extends EnvironmentObject>(body: T, envSize: Size): T {
    const halfWidth = body.getSize().width / 2;
    const halfHeight = body.getSize().height / 2;

    const adjustedX = this.clamp(body.getPosition().x, halfWidth, envSize.width - halfWidth);
    const adjustedY = this.clamp(body.getPosition().y, halfHeight, envSize.height - halfHeight);

    body.setPosition(new Coordinates(adjustedX, adjustedY));
    return body;
  }

  createBorders(world: World): void {
    const wallThickness = 100;

    const style = { fillStyle: "black" };
    Composite.add(world, [
      Bodies.rectangle(this.size.width / 2, -wallThickness / 2, this.size.width, wallThickness, {
        isStatic: true,
        render: style,
      }),
      Bodies.rectangle(this.size.width / 2, this.size.height + wallThickness / 2, this.size.width, wallThickness, {
        isStatic: true,
        render: style,
      }),
      Bodies.rectangle(-wallThickness / 2, this.size.height / 2, wallThickness, this.size.height, {
        isStatic: true,
        render: style,
      }),
      Bodies.rectangle(this.size.width + wallThickness / 2, this.size.height / 2, wallThickness, this.size.height, {
        isStatic: true,
        render: style,
      }),
    ]);
  }
}

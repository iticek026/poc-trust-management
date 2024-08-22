export class Coordinates {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Coordinates | number): Coordinates {
    if (typeof other === "number") {
      return new Coordinates(this.x + other, this.y + other);
    }
    return new Coordinates(this.x + other.x, this.y + other.y);
  }
}

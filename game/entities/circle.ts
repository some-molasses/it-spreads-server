export class Circle {
  x: number;
  y: number;
  r: number;

  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  /**
   * @returns The distance between centres
   */
  distanceTo(circle: Circle) {
    return Math.sqrt(
      Math.pow(this.x + this.r / 2 - (circle.x + circle.r / 2), 2) +
        Math.pow(this.y + this.r / 2 - (circle.y + circle.r / 2), 2)
    );
  }
}

import { toDecimals } from "../../util";
import { Team } from "../globals";
import { Circle } from "./circle";

export class Player extends Circle {
  dx: number = 0;
  dy: number = 0;
  team: Team;

  constructor(x: number, y: number, team: Team) {
    super(x, y, 25);

    this.team = team;
  }

  toJSON() {
    return [
      toDecimals(this.x, 2),
      toDecimals(this.y, 2),
      toDecimals(this.dx, 2),
      toDecimals(this.dy, 2),
      this.team,
    ];
  }
}

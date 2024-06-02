import { toDecimals } from "../../util";
import { Team } from "../globals";
import { Circle } from "./circle";

export class Player extends Circle {
  dx: number;
  dy: number;
  team: Team;

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

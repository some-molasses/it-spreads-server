import { Connections } from "../../connections";
import { toDecimals } from "../../util";
import { Team } from "../globals";
import { Circle } from "./circle";

export class Player extends Circle {
  dx: number = 0;
  dy: number = 0;
  id: number;
  team: Team;

  constructor(x: number, y: number, id: number, team: Team) {
    super(x, y, 25);

    this.team = team;
    this.id = id;
  }

  getConnection() {
    const connection = Connections.connectedClients.find(
      (connection) => connection.playerId === this.id
    );

    if (!connection) {
      console.error(`player.getConnection not found for ${this.id}`);
    }

    return connection;
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

import { Player } from "./entities/player";
import { Team } from "./globals";
import { Spill } from "./spill";

class TeamState {
  player: Player;
  spill: Spill;

  getGame: () => GameState;

  constructor(team: Team, getGame: () => GameState) {
    this.getGame = getGame;
    this.player = new Player(0, 0, 50);
    this.spill = new Spill(getGame, team);
  }
}

export class GameState {
  teams = {
    [Team.GREEN]: new TeamState(Team.GREEN, () => this),
    [Team.PURPLE]: new TeamState(Team.PURPLE, () => this),
  };
}

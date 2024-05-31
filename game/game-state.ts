import { Player } from "./entities/player";
import { Team } from "./globals";
import { Spill } from "./spill";

class TeamState {
  game: GameState;
  player: Player;
  spill: Spill;

  constructor(team: Team, game: GameState) {
    this.game = game;
    this.player = new Player(0, 0, 50);
    this.spill = new Spill(game, team);
  }
}

export class GameState {
  teams = {
    [Team.GREEN]: new TeamState(Team.GREEN, this),
    [Team.PURPLE]: new TeamState(Team.PURPLE, this),
  };
}

import { Player } from "./entities/player";
import { Team } from "./globals";
import { Spill } from "./spill";

class TeamState {
  player: Player;
  spill: Spill;

  getGame: () => Game;

  constructor(team: Team, getGame: () => Game) {
    this.getGame = getGame;
    this.player = new Player(0, 0, 50);
    this.spill = new Spill(getGame, team);
  }
}

export class Game {
  interval: NodeJS.Timeout;
  teams: Record<Team, TeamState> = {
    [Team.GREEN]: new TeamState(Team.GREEN, () => this),
    [Team.PURPLE]: new TeamState(Team.PURPLE, () => this),
  };

  // activate() {
  //   console.info("Activating game");
  // }

  // deactivate() {
  //   console.info("Game deactivated");
  // }

  updateGameState() {
    for (const team of Object.values(this.teams)) {
      team.spill.update();
    }
  }

  getData() {
    const result = {};
    for (const key in this.teams) {
      result[key] = this.teams[key].getData();
    }
  }

  setPlayer(values: { x: number; y: number; dx: number; dy: number }) {
    this.teams[0].player.x = values.x;
    this.teams[0].player.y = values.y;
  }

  toJSON() {
    return {
      teams: this.teams,
    };
  }
}

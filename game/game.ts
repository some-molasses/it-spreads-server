import { Player } from "./entities/player";
import { Team } from "./globals";
import { Spill } from "./spill";

class TeamState {
  spill: Spill;

  getGame: () => Game;

  constructor(team: Team, getGame: () => Game) {
    this.getGame = getGame;
    this.spill = new Spill(getGame, team);
  }
}

export class Game {
  players: Player[] = [];
  interval: NodeJS.Timeout;
  teams: Record<Team, TeamState> = {
    [Team.GREEN]: new TeamState(Team.GREEN, () => this),
    [Team.PURPLE]: new TeamState(Team.PURPLE, () => this),
  };

  activate() {
    console.info("Activating game");
    this.interval = setInterval(() => this.main(), 1000 / 60);
  }

  addPlayer(x: number, y: number) {
    this.players.push(new Player(x, y, 50));
  }

  deactivate() {
    clearInterval(this.interval);
    console.info("Game deactivated");
  }

  main() {
    this.updateGameState();
  }

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

  setPlayer(
    index: number,
    values: { x: number; y: number; dx: number; dy: number }
  ) {
    this.players[index].x = values.x;
    this.players[index].y = values.y;
  }

  toJSON() {
    return {
      teams: this.teams,
    };
  }
}

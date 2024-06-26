import { Connections } from "../connections";
import { Player } from "./entities/player";
import { Team } from "./globals";
import { Spill } from "./spill";

const GAME_LENGTH = 1.5 * 60 * 1000;

class TeamState {
  spill: Spill;
  team: Team;
  score: number = 0;

  getGame: () => Game;

  constructor(team: Team, getGame: () => Game) {
    this.getGame = getGame;
    this.spill = new Spill(getGame, team);
    this.team = team;
  }

  /**
   * Returns a score for the current state of the game
   */
  scoreFrame(): number {
    return this.getGame().teams[this.team].spill.scoreSpill() / 1000;
  }

  toJSON() {
    return {
      score: Math.round(this.score),
      spill: this.spill,
    };
  }
}

export class Game {
  players: Record<number, Player | undefined> = {};

  interval?: NodeJS.Timeout;
  teams: Record<Team, TeamState> = {
    [Team.GREEN]: new TeamState(Team.GREEN, () => this),
    [Team.PURPLE]: new TeamState(Team.PURPLE, () => this),
  };
  startTime: number = Date.now();

  get maxPlayersPerTeam() {
    const secondsElapsed = (Date.now() - this.startTime) / 1000;

    if (secondsElapsed < 50) {
      return Math.ceil(secondsElapsed / 10);
    } else {
      return 16;
    }
  }

  get playersByTeam() {
    return Connections.connectionsByTeam;
  }

  get playersRemainingByTeam() {
    const connectionsPerTeam = this.playersByTeam;

    return {
      [Team.GREEN]:
        this.maxPlayersPerTeam - connectionsPerTeam[Team.GREEN].length,
      [Team.PURPLE]:
        this.maxPlayersPerTeam - connectionsPerTeam[Team.PURPLE].length,
    };
  }

  activate() {
    this.startTime = Date.now();
    this.interval = setInterval(() => this.main(), 1000 / 60);

    this.teams[Team.GREEN].spill.activate();
    this.teams[Team.PURPLE].spill.activate();
  }

  addPlayer(x: number, y: number, id: number) {
    this.players[id] = new Player(
      x,
      y,
      id,
      Object.values(this.players).filter((p) => !!p).length % 2 === 0
        ? Team.GREEN
        : Team.PURPLE
    );
  }

  deactivate() {
    clearInterval(this.interval);

    this.players = {};

    this.teams[Team.GREEN].score = 0;
    this.teams[Team.PURPLE].score = 0;

    this.teams[Team.GREEN].spill.deactivate();
    this.teams[Team.PURPLE].spill.deactivate();

    this.startTime = 0;

    console.info("Game deactivated");
  }

  main() {
    this.updateGameState();
  }

  updateGameState() {
    for (const ts of Object.values(this.teams)) {
      ts.spill.update();
      ts.score = ts.score * 0.9995 + ts.scoreFrame();
    }
  }

  setPlayer(
    id: number,
    values: { x: number; y: number; dx: number; dy: number }
  ) {
    if (this.players[id] === undefined) {
      console.error("Player does not exist");
      return;
    }

    const definedPlayer = this.players[id] as Player;

    definedPlayer.x = values.x;
    definedPlayer.y = values.y;
    definedPlayer.dx = values.dx;
    definedPlayer.dy = values.dy;
  }

  toJSON() {
    return {
      players: this.players,
      teams: this.teams,
      timeRemaining: GAME_LENGTH - (Date.now() - this.startTime),
      playersRemaining: this.playersRemainingByTeam,
      maxPlayersPerTeam: this.maxPlayersPerTeam,
    };
  }
}

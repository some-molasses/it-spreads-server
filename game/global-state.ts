import { Game } from "./game";

export class GlobalState {
  // @todo make this generate on game start
  static activeGames: Game[] = [new Game()];
}

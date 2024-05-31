import { GameState } from "./game-state";

export class GlobalState {
  // @todo make this generate on game start
  static activeGames: GameState[] = [new GameState()];
}

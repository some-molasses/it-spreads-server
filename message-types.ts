import { GameState } from "./game/game-state";

export interface ServerSentWebsocketMessage {
  type: "STATE";
  payload: GameStatePayload;
}

interface GameStatePayload {
  state: GameState;
}

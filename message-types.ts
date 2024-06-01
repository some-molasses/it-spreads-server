import { GameState } from "./game/game-state";

export interface ServerSentWebsocketMessage {
  type: "STATE";
  payload: GameStatePayload;
}

interface GameStatePayload {
  state: GameState;
}

export interface ClientSentWebsocketMessage {
  type: "STATE";
  payload: ClientSentWebsocketMessage.GameStatePayload;
}

export namespace ClientSentWebsocketMessage {
  export interface GameStatePayload {
    player: {
      x: number;
      y: number;
      dx: number;
      dy: number;
    };
  }
}

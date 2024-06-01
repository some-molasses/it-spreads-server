import { Game } from "./game/game";

export interface ServerSentWebsocketMessage {
  type: "STATE";
  payload: GameStatePayload;
}

interface GameStatePayload {
  state: Game;
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

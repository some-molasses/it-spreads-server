import { Game } from "./game/game";

export interface ServerSentWebsocketMessage {
  type: "STATE" | "HANDSHAKE";
  payload:
    | ServerSentWebsocketMessage.GameStatePayload
    | ServerSentWebsocketMessage.HandshakePayload;
}

export namespace ServerSentWebsocketMessage {
  export interface GameStatePayload {
    state: Game;
  }

  export interface HandshakePayload {
    localPlayerIndex: number;
  }
}

export interface ClientSentWebsocketMessage {
  type: "STATE";
  payload: ClientSentWebsocketMessage.GameStatePayload;
}

export namespace ClientSentWebsocketMessage {
  export interface GameStatePayload {
    localPlayerIndex: number;
    player: {
      x: number;
      y: number;
      dx: number;
      dy: number;
    };
  }
}

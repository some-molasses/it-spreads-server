import { Game } from "./game/game";

export type ServerSentWebsocketMessage =
  | ServerSentWebsocketMessage.GameStateMessage
  | ServerSentWebsocketMessage.HandshakeMessage;

export namespace ServerSentWebsocketMessage {
  export interface GameStateMessage {
    type: "STATE";
    state: Game;
  }

  export interface HandshakeMessage {
    type: "HANDSHAKE";
    localPlayerId: number;
  }
}

export interface ClientSentWebsocketMessage {
  type: "STATE";
  payload: ClientSentWebsocketMessage.GameStatePayload;
}

export namespace ClientSentWebsocketMessage {
  export interface GameStatePayload {
    localPlayerId: number;
    player: {
      x: number;
      y: number;
      dx: number;
      dy: number;
    };
  }
}

import { WebSocket } from "ws";
import {
  ClientSentWebsocketMessage,
  ServerSentWebsocketMessage,
} from "./message-types";
import { GlobalState } from "./game/global-state";
import { CONFIG } from "./config";

interface Connection {
  isToBeKilled: boolean;
  playerId: number;

  ws: WebSocket;
}

export class Connections {
  static connectedClients: Connection[] = [];

  static init() {
    setInterval(() => {
      Connections.cleanConnections();
    }, 5000);
  }

  static registerConnection(ws: WebSocket) {
    const playerId = Math.floor(Math.random() * 100000);

    Connections.connectedClients.push({ ws, isToBeKilled: false, playerId });

    GlobalState.activeGames[0].activate();

    ws.on("error", console.error);

    ws.on("message", (message) => {
      Connections.handleMessage(JSON.parse(message.toString()));
    });

    GlobalState.activeGames[0].addPlayer(
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT / 2,
      playerId
    );

    ws.on("close", () => Connections.closeConnection(ws));

    const handshake: ServerSentWebsocketMessage = {
      type: "HANDSHAKE",
      localPlayerId: playerId,
    };

    ws.send(JSON.stringify(handshake));
  }

  static cleanConnections() {
    // kill all connections marked for deletion
    const allClientsDead = Connections.connectedClients.reduce(
      (prev, connection) => prev && connection.isToBeKilled,
      true
    );

    if (allClientsDead) {
      GlobalState.activeGames[0].deactivate();
    }
  }

  static closeConnection(ws: WebSocket) {
    ws.close();

    // for concurrency
    const killableClient = Connections.connectedClients.find(
      (client) => client.ws === ws
    );

    if (killableClient) {
      killableClient.isToBeKilled = true;
    }

    Connections.cleanConnections();
  }

  static handleMessage(data: ClientSentWebsocketMessage) {
    console.debug("received: %s", data);

    if (data.type === "STATE") {
      GlobalState.activeGames[0].setPlayer(
        data.payload.localPlayerId,
        data.payload.player
      );

      GlobalState.activeGames[0].updateGameState();

      this.sendState();
    }
  }

  static sendState() {
    const message: ServerSentWebsocketMessage = {
      type: "STATE",
      state: GlobalState.activeGames[0],
    };

    this.sendToAll(message);
  }

  private static sendToAll(message: ServerSentWebsocketMessage) {
    console.info(
      `Sending message to ${Connections.connectedClients.length} connections`
    );

    Connections.connectedClients.forEach((client) => {
      if (client.isToBeKilled) {
        return;
      }

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      } else {
        throw new Error("Connection is not open!");
      }
    });
  }
}

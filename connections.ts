import { WebSocket } from "ws";
import {
  ClientSentWebsocketMessage,
  ServerSentWebsocketMessage,
} from "./message-types";
import { GlobalState } from "./game/global-state";
import { CONFIG } from "./config";
import { Team } from "./game/globals";

interface Connection {
  isToBeKilled: boolean;
  playerId: number;
  lastUpdateTime: number;
  connectionTime: number;

  ws: WebSocket;
}

export class Connections {
  static connectedClients: Connection[] = [];

  static get connectionsByTeam(): Record<Team, Connection[]> {
    const connectionsByTeam: Record<Team, Connection[]> = {
      [Team.GREEN]: [],
      [Team.PURPLE]: [],
    };

    for (const connection of Connections.connectedClients) {
      const player = GlobalState.activeGames[0].players[connection.playerId];

      if (!player) {
        console.error(
          `Connection ${connection.playerId} has no associated player`
        );

        continue;
      }

      connectionsByTeam[player.team].push(connection);
    }

    return connectionsByTeam;
  }

  static init() {
    setInterval(() => {
      Connections.cleanConnections();
    }, 5000);
  }

  static registerConnection(ws: WebSocket) {
    const playerId = Math.floor(Math.random() * 100000);

    Connections.connectedClients.push({
      ws,
      isToBeKilled: false,
      playerId,
      connectionTime: Date.now(),
      lastUpdateTime: Date.now(),
    });

    if (Object.values(GlobalState.activeGames[0].players).length === 0) {
      GlobalState.activeGames[0].activate();
    }

    ws.on("error", console.error);

    ws.on("message", (message) => {
      const thisClient = Connections.connectedClients.find(
        (client) => client.playerId === playerId
      );

      if (!thisClient) {
        console.error("Client not found in connectedClients array");
        return;
      }

      thisClient.lastUpdateTime = Date.now();

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
    for (const connection of Connections.connectedClients) {
      if (Date.now() - connection.lastUpdateTime > 10000) {
        connection.isToBeKilled = true;
      }
    }

    for (const connection of Connections.connectedClients) {
      if (connection.isToBeKilled) {
        console.info(`Deleting player with player ID ${connection.playerId}`);
        GlobalState.activeGames[0].players[connection.playerId] = undefined;
        connection.ws.close();
      }
    }

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
      console.info(`Marking client ${killableClient.playerId} for deletion`);
      killableClient.isToBeKilled = true;
    }

    Connections.cleanConnections();
  }

  static handleMessage(data: ClientSentWebsocketMessage) {
    if (data.type === "STATE") {
      GlobalState.activeGames[0].setPlayer(
        data.payload.localPlayerId,
        data.payload.player
      );

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
      `Sending message to ${
        Connections.connectedClients.filter((c) => !c.isToBeKilled).length
      } connections`
    );

    Connections.connectedClients.forEach((client) => {
      if (client.isToBeKilled) {
        return;
      }

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      } else {
        console.error("Connection is not open!");
      }
    });
  }
}

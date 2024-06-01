import { WebSocket } from "ws";
import {
  ClientSentWebsocketMessage,
  ServerSentWebsocketMessage,
} from "./message-types";
import { GlobalState } from "./game/global-state";

interface Connection {
  isToBeKilled: boolean;
  ws: WebSocket;
}

export class Connections {
  static connectedClients: Connection[] = [];

  static registerConnection(ws: WebSocket) {
    Connections.connectedClients.push({ ws, isToBeKilled: false });

    ws.on("error", console.error);

    ws.on("message", Connections.handleMessage);

    ws.on("close", () => Connections.closeConnection(ws));
  }

  static cleanConnections() {
    // kill all connections marked for deletion
    Connections.connectedClients = Connections.connectedClients.filter(
      (client) => !client.isToBeKilled
    );
  }

  static closeConnection(ws: WebSocket) {
    ws.close();

    // for concurrency
    Connections.connectedClients.find(
      (client) => client.ws === ws
    )!.isToBeKilled = true;

    Connections.cleanConnections();
  }

  static handleMessage(data: ClientSentWebsocketMessage) {
    console.log("received: %s", data);

    if (data.type === "STATE") {
      GlobalState.activeGames[0].setPlayer(data.payload.player);
      console.log(data.payload);
    }
  }

  static sendState() {
    const message: ServerSentWebsocketMessage = {
      type: "STATE",
      payload: { state: GlobalState.activeGames[0] },
    };

    this.sendToAll(message);
  }

  private static sendToAll(message: ServerSentWebsocketMessage) {
    console.info(
      `Sending message to ${Connections.connectedClients.length} connections`
    );

    Connections.connectedClients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      } else {
        throw new Error("Connection is not open!");
      }
    });
  }
}

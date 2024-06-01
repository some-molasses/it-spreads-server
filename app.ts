import express from "express";
import { WebSocketServer } from "ws";

import LifeTest from "./api/life-test.js";
import {
  ClientSentWebsocketMessage,
  ServerSentWebsocketMessage,
} from "./message-types";
import { GlobalState } from "./game/global-state";

const app = express();
const port = process.env.PORT || 3001;

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

const wss = new WebSocketServer({ server: server });

// app.get("/", (req, res) => res.json({ hello: "world" }).status(200).send());

// server.on("upgrade", (req, socket, head) => {
//   wsServer.handleUpgrade(req, socket, head, (ws) => {
//     wsServer.emit("connection", ws, req);
//   });
// });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data: ClientSentWebsocketMessage) {
    console.log("received: %s", data);

    if (data.type === "STATE") {
      GlobalState.activeGames[0].setPlayer(data.payload.player);
      console.log(data.payload);
    }
  });

  const message: ServerSentWebsocketMessage = {
    type: "STATE",
    payload: { state: GlobalState.activeGames[0] },
  };

  ws.send(JSON.stringify(message));
});

app.use(LifeTest);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

import express from "express";
import { WebSocketServer, WebSocket } from "ws";

import LifeTest from "./api/life-test.js";
import { Connections } from "./connections";

const app = express();
const port = process.env.PORT || 3001;

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

const wss = new WebSocketServer({ server: server });

wss.on("connection", function connection(ws: WebSocket) {
  Connections.registerConnection(ws);
});

app.use(LifeTest);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

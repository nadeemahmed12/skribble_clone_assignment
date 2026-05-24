import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import roomHandler from "./socket/roomHandler.js";
import gameHandler from "./socket/gameHandler.js";
import RoomManager from "./managers/RoomManager.js";
import drawingHandler from "./socket/drawingHandler.js";
import words from "./utils/words.js";

const app = express();
const roomManager = new RoomManager();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);
  roomHandler(io, socket, roomManager);
  gameHandler(io, socket, roomManager);
  drawingHandler(io, socket, roomManager);

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);

    const updatedRoom = roomManager.removePlayer(socket.id);

    if (!updatedRoom) {
      return;
    }

    io.to(updatedRoom.roomId).emit("room_state", updatedRoom);

    // IF DRAWER LEFT
    if (updatedRoom.players.length > 0) {
      const nextDrawer = updatedRoom.players[0];

      updatedRoom.gameState.currentDrawer = nextDrawer;

      updatedRoom.gameState.timeLeft = updatedRoom.settings.drawTime;

      const randomWords = [...words]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      io.to(updatedRoom.roomId).emit("game_started", updatedRoom);

      if (nextDrawer) {
        io.to(nextDrawer.socketId).emit("choose_word", randomWords);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import generateRoomId from "../utils/generateRoomId.js";
import getRandomWords from "../utils/getRandomWords.js";

function roomHandler(io, socket, roomManager) {
  // CREATE ROOM
  socket.on("create_room", ({ username, settings }) => {
    socket.username = username;

    const roomId = generateRoomId();

    const player = {
      socketId: socket.id,
      username,
      score: 0,
    };
    const room = roomManager.createRoom(roomId, player, settings);
    socket.join(roomId);
    socket.emit("room_created", room);
    console.log("Room Created:", roomId);
  });

  // JOIN ROOM
  socket.on("join_room", ({ roomId, username }) => {
    socket.username = username;
    const player = {
      socketId: socket.id,
      username,
      score: 0,
    };
    const result = roomManager.joinRoom(roomId, player);

    if (result.error) {
      socket.emit("error_message", result.error);

      return;
    }
    socket.join(roomId);
    io.to(roomId).emit("player_joined", result);
    // IF GAME ALREADY RUNNING
    if (result.gameState?.started) {
      io.to(roomId).emit("game_started", result);
    }
    console.log(`${username} joined ${roomId}`);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    roomManager.removePlayer(socket.id);

    console.log("User disconnected:", socket.id);
  });

  // START GAME
  socket.on("start_game", ({ roomId }) => {
    const room = roomManager.startGame(roomId);

    if (!room) {
      return;
    }
    const currentDrawer = room.gameState.currentDrawer;
    const wordOptions = getRandomWords(3);

    // SEND WORDS ONLY TO DRAWER
    io.to(roomId).emit("game_started", room);

    setTimeout(() => {
      io.sockets.sockets
        .get(currentDrawer.socketId)
        ?.emit("choose_word", wordOptions);
    }, 500);
  });

  // GET ROOM STATE
  socket.on("get_room_state", ({ roomId }) => {
    const room = roomManager.getRoom(roomId);

    if (!room) {
      return;
    }

    socket.emit("room_state", room);
  });
}

export default roomHandler;

class RoomManager {
  constructor() {
    this.rooms = {};
  }

  createRoom(roomId, hostPlayer, settings) {
    this.rooms[roomId] = {
      roomId,

      hostId: hostPlayer.socketId,

      players: [hostPlayer],

      settings: {
        maxPlayers: settings.maxPlayers || 8,
        rounds: settings.rounds || 3,
        drawTime: settings.drawTime || 80,
      },

      gameState: {
        started: false,
        currentRound: 1,
        currentDrawerIndex: 0,
        currentWord: "",
        scores: {},
        timeLeft: 80,
      },
    };

    return this.rooms[roomId];
  }

  joinRoom(roomId, player) {
    const room = this.rooms[roomId];

    if (!room) {
      return { error: "Room does not exist" };
    }

    if (room.players.length >= room.settings.maxPlayers) {
      return { error: "Room is full" };
    }

    room.players.push(player);

    return room;
  }

  getRoom(roomId) {
    return this.rooms[roomId];
  }

  removePlayer(socketId) {
    for (const roomId in this.rooms) {
      const room = this.rooms[roomId];

      const removedPlayer = room.players.find(
        (player) => player.socketId === socketId,
      );

      room.players = room.players.filter(
        (player) => player.socketId !== socketId,
      );

      // IF CURRENT DRAWER LEFT
      if (
        removedPlayer &&
        room.gameState.currentDrawer &&
        removedPlayer.socketId === room.gameState.currentDrawer.socketId
      ) {
        room.gameState.currentDrawer = room.players[0];
        room.gameState.drawerIndex = 0;
      }

      // DELETE ROOM IF EMPTY
      if (room.players.length === 0) {
        delete this.rooms[roomId];
        return null;
      }

      return room;
    }
  }

  startGame(roomId) {
    const room = this.rooms[roomId];

    if (!room) {
      return null;
    }

    room.gameState.started = true;

    room.gameState.currentRound = 1;

    room.gameState.currentDrawerIndex = 0;

    // FIRST DRAWER
    const currentDrawer = room.players[room.gameState.currentDrawerIndex];

    room.gameState.currentDrawer = currentDrawer;

    return room;
  }
}

const roomManager = new RoomManager();

export default RoomManager;

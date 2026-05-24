import words from "../utils/words.js";

function startRoundTimer(io, roomManager, roomId) {
  const room = roomManager.getRoom(roomId);

  if (!room) {
    return;
  }

  //room.gameState.timeLeft = room.settings.drawTime;
  room.gameState.timeLeft = 10;

  const timer = setInterval(() => {
    room.gameState.timeLeft--;

    io.to(roomId).emit("timer_update", room.gameState.timeLeft);

    // TIMER END
    if (room.gameState.timeLeft <= 0) {
      clearInterval(timer);
      io.to(roomId).emit("round_ended");
      const nextIndex = (room.gameState.drawerIndex + 1) % room.players.length;
      if (nextIndex === 0) {
        room.gameState.round++;
      }

      if (room.gameState.round > room.settings.rounds) {
        let winner = room.players[0];

        room.players.forEach((player) => {
          if (player.score > winner.score) {
            winner = player;
          }
        });

        io.to(roomId).emit(
          "game_over",
          `🏆 ${winner.username} wins with ${winner.score} points!`,
        );

        return;
      }

      // NEXT DRAWER
      const nextDrawer = room.players[nextIndex];
      room.gameState.currentDrawer = nextDrawer;
      room.gameState.drawerIndex = nextIndex;
      // RESET WORD
      room.gameState.currentWord = "";
      room.gameState.guessedPlayers = [];
      // SEND UPDATED ROOM
      io.to(roomId).emit("game_started", room);
      // RANDOM WORDS
      const randomWords = [...words]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // SEND WORDS ONLY TO NEXT DRAWER
      io.to(nextDrawer.socketId).emit("choose_word", randomWords);
    }
  }, 1000);
}

const gameHandler = (io, socket, roomManager) => {
  socket.on("start_game", ({ roomId }) => {
    const room = roomManager.rooms[roomId];
    if (!room) return;
    // RANDOM DRAWER
    const randomIndex = Math.floor(Math.random() * room.players.length);
    const drawer = room.players[randomIndex];
    // GAME STATE
    room.gameState = {
      currentDrawer: drawer,
      drawerIndex: randomIndex,
      guessedPlayers: [],
      round: 1,
      maxRounds: 3,
      currentWord: "",
      timeLeft: room.settings.drawTime,
    };

    // SEND GAME START TO ALL PLAYERS
    io.to(roomId).emit("game_started", room);
    // RANDOM WORDS
    const randomWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 3);
    // SEND WORDS ONLY TO DRAWER
    setTimeout(() => {
      io.to(drawer.socketId).emit("choose_word", randomWords);
    }, 500);
  });

  socket.on("send_guess", ({ roomId, guess }) => {
    const username = socket.username;
    const room = roomManager.getRoom(roomId);
    if (!room) {
      return;
    }
    const correctWord = room.gameState.currentWord;
    // CORRECT GUESS
    if (!correctWord) {
      return;
    }

    const alreadyGuessed = room.gameState.guessedPlayers.includes(socket.id);

    if (alreadyGuessed) {
      return;
    }

    if (guess.toLowerCase() === correctWord.toLowerCase()) {
      const guessedPlayer = room.players.find(
        (player) => player.socketId === socket.id,
      );

      if (guessedPlayer) {
        guessedPlayer.score += 10;
        room.gameState.guessedPlayers.push(socket.id);
      }
      io.to(roomId).emit("room_state", room);
      io.to(roomId).emit("correct_guess", `${username} guessed correctly!`);
    } else {
      io.to(roomId).emit("new_message", {
        username,
        guess,
      });
    }
  });

  socket.on("select_word", ({ roomId, word }) => {
    const room = roomManager.getRoom(roomId);

    if (!room) {
      return;
    }

    room.gameState.currentWord = word;

    room.players.forEach((player) => {
      // DRAWER
      if (player.socketId === room.gameState.currentDrawer.socketId) {
        io.to(player.socketId).emit("word_selected", {
          ...room,
          gameState: {
            ...room.gameState,
            currentWord: word,
          },
        });
      }

      // OTHER PLAYERS
      else {
        io.to(player.socketId).emit("word_selected", {
          ...room,
          gameState: {
            ...room.gameState,
            currentWord: null,
            wordLength: word.length,
          },
        });
      }
    });

    startRoundTimer(io, roomManager, roomId);

    console.log("Selected Word:", word);
  });

  socket.on("clear_canvas", ({ roomId }) => {
    io.to(roomId).emit("canvas_cleared");
  });
};

export default gameHandler;

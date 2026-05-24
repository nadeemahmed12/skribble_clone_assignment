import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket/socket";
import { useLocation } from "react-router-dom";

function Game() {
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);

  const [wordOptions, setWordOptions] = useState([]);
  const [guess, setGuess] = useState("");
  const [messages, setMessages] = useState([]);
  const [brushColor, setBrushColor] = useState("black");

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const location = useLocation();
  const username = location.state?.username || localStorage.getItem("username");

  const handleSelectWord = (word) => {
    socket.emit("select_word", {
      roomId,
      word,
    });
  };

  const hiddenWord = room?.gameState?.wordLength
    ? Array(room.gameState.wordLength).fill("_").join(" ")
    : "";

  const currentUsername =
    location.state?.username || localStorage.getItem("username");

  const isDrawer = socket.id === room?.gameState?.currentDrawer?.socketId;

  const clearCanvas = () => {
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = brushColor;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    socket.emit("clear_canvas", {
      roomId,
    });
  };

  const handleGuess = () => {
    if (!guess.trim()) {
      return;
    }
    socket.emit("send_guess", {
      roomId,
      guess,
    });

    setGuess("");
  };

  useEffect(() => {
    // FETCH ROOM
    socket.emit("get_room_state", {
      roomId,
    });

    // ROOM STATE
    socket.on("room_state", (updatedRoom) => {
      setRoom(updatedRoom);
    });
    // CHOOSE WORD
    socket.on("choose_word", (words) => {
      console.log("Words Received:", words);
      setWordOptions(words);
    });

    return () => {
      socket.off("room_state");
      socket.off("choose_word");
    };
  }, [roomId]);

  useEffect(() => {
    socket.on("word_selected", (updatedRoom) => {
      setRoom(updatedRoom);
      setWordOptions([]);
    });
    return () => {
      socket.off("word_selected");
    };
  }, []);

  useEffect(() => {
    socket.on("game_started", (updatedRoom) => {
      setRoom(updatedRoom);
    });
    return () => {
      socket.off("game_started");
    };
  }, []);

  useEffect(() => {
    socket.on("game_over", (message) => {
      alert(message);
    });

    return () => {
      socket.off("game_over");
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = brushColor;
    socket.on("start_drawing", ({ x, y, color }) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
    });
    socket.on("drawing", ({ x, y, color }) => {
      ctx.strokeStyle = color;

      ctx.lineTo(x, y);

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(x, y);
    });
    socket.on("stop_drawing", () => {
      ctx.closePath();
    });
    return () => {
      socket.off("start_drawing");
      socket.off("drawing");
      socket.off("stop_drawing");
    };
  }, [brushColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const startDrawing = (e) => {
      if (!isDrawer) {
        return;
      }
      isDrawing.current = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      socket.emit("start_drawing", {
        roomId,
        x: e.offsetX,
        y: e.offsetY,
        color: brushColor,
      });
    };

    const draw = (e) => {
      if (!isDrawer) {
        return;
      }
      if (!isDrawing.current) {
        return;
      }

      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);

      socket.emit("drawing", {
        roomId,
        x: e.offsetX,
        y: e.offsetY,
        color: brushColor,
      });
    };

    const stopDrawing = () => {
      if (!isDrawer) {
        return;
      }
      isDrawing.current = false;

      ctx.closePath();

      socket.emit("stop_drawing", {
        roomId,
      });
    };
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
    };
  }, [roomId, isDrawer]);

  useEffect(() => {
    socket.on("new_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("correct_guess", (message) => {
      setMessages((prev) => [
        ...prev,
        {
          username: "SYSTEM",
          guess: message,
        },
      ]);
    });
    return () => {
      socket.off("new_message");
      socket.off("correct_guess");
    };
  }, []);

  useEffect(() => {
    socket.on("timer_update", (time) => {
      setTimeLeft(time);
    });

    socket.on("round_ended", () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setWordOptions([]);
      // setRoom((prev) => ({
      //   ...prev,
      //   gameState: {
      //     ...prev.gameState,
      //     currentWord: "",
      //     wordLength: 0,
      //   },
      // }));
      console.log("Round Ended!");
    });

    socket.on("canvas_cleared", () => {
      const canvas = canvasRef.current;

      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    return () => {
      socket.off("timer_update");
      socket.off("round_ended");
      socket.off("canvas_cleared");
    };
  }, []);

  return (
    <div>
      <h1>Game Started 🎮</h1>
      <h2>Time Left: {timeLeft}s</h2>

      <h2>Current Drawer: {room?.gameState?.currentDrawer?.username}</h2>
      <h2>Players Score</h2>

      {room?.players.map((player) => (
        <p key={player.socketId}>
          {player.username} : {player.score || 0}
        </p>
      ))}
      <h2>Word: {isDrawer ? room?.gameState?.currentWord : hiddenWord}</h2>

      {/* DRAWER ONLY */}
      {isDrawer && wordOptions.length > 0 && (
        <div>
          <h2>Choose a Word</h2>

          {wordOptions.map((word) => (
            <button key={word} onClick={() => handleSelectWord(word)}>
              {word}
            </button>
          ))}
        </div>
      )}

      {isDrawer && <button onClick={clearCanvas}>Clear Canvas</button>}

      {isDrawer && (
        <div>
          <button onClick={() => setBrushColor("black")}>Black</button>

          <button onClick={() => setBrushColor("red")}>Red</button>

          <button onClick={() => setBrushColor("blue")}>Blue</button>

          <button onClick={() => setBrushColor("green")}>Green</button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{
          border: "2px solid black",
          backgroundColor: "white",
        }}
      ></canvas>
      {!isDrawer && (
        <div>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
          />

          <button onClick={handleGuess}>Send</button>
        </div>
      )}
      <div>
        <h2>Chat</h2>

        {messages.map((msg, index) =>
          msg.username === "SYSTEM" ? (
            <p key={index}>
              <strong>🎉 {msg.guess}</strong>
            </p>
          ) : (
            <p key={index}>
              <strong>{msg.username}:</strong> {msg.guess}
            </p>
          ),
        )}
      </div>
    </div>
  );
}

export default Game;

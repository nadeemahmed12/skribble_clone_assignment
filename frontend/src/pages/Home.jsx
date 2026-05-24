import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import socket from "../socket/socket";

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  // CREATE ROOM
  const handleCreateRoom = () => {
   localStorage.setItem("username", username);
    if (!username.trim()) {
      alert("Enter username");
      return;
    }

    socket.emit("create_room", {
      username,

      settings: {
        maxPlayers: 8,
        rounds: 3,
        drawTime: 80,
      },
    });
  };

  // JOIN ROOM
  const handleJoinRoom = () => {
    localStorage.setItem("username", username);

    if (!username.trim() || !roomId) {
      alert("Enter all fields");
      return;
    }

    socket.emit("join_room", {
      roomId,
      username,
    });
  };

  useEffect(() => {
    // ROOM CREATED
    socket.on("room_created", (room) => {
      navigate(`/lobby/${room.roomId}`, {
        state: {
          room,
          username,
        },
      });
    });

    // PLAYER JOINED
    socket.on("player_joined", (room) => {
      navigate(`/lobby/${room.roomId}`, {
        state: {
          room,
          username,
        },
      });
    });

    return () => {
      socket.off("room_created");
      socket.off("player_joined");
    };
  }, [navigate, username]);

  return (
    <div>
      <h1>Skribbl Clone</h1>

      <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleCreateRoom}>Create Room</button>

      <br />
      <br />

      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}

export default Home;

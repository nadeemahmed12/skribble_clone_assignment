import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import socket from "../socket/socket";

function Lobby() {
  const { roomId } = useParams();

  const navigate = useNavigate();

  // ROOM STATE
  const [room, setRoom] = useState(null);

  // FETCH + LISTEN
  useEffect(() => {
    // FETCH ROOM
    socket.emit("get_room_state", {
      roomId,
    });

    // ROOM STATE
    socket.on("room_state", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    // PLAYER JOINED
    socket.on("player_joined", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    // GAME STARTED
    socket.on("game_started", () => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off("room_state");

      socket.off("player_joined");

      socket.off("game_started");
    };
  }, [roomId, navigate]);

  // START GAME
  const handleStartGame = () => {
    
    socket.emit("start_game", {
      roomId,
    });
  };

  return (
    <div>
      <h1>Lobby</h1>

      <h2>Room ID: {roomId}</h2>

      <h3>Players</h3>

      {room?.players.map((player) => (
        <p key={player.socketId}>{player.username}</p>
      ))}

      {socket.id === room?.hostId && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
    </div>
  );
}

export default Lobby;

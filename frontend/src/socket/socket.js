import { io } from "socket.io-client";

const socket = io(
  "https://skribble-clone-assignment.onrender.com"
);
export default socket;
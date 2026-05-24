function drawingHandler(io, socket) {
  socket.on("start_drawing", ({ roomId, x, y, color }) => {
    socket.to(roomId).emit("start_drawing", {
      x,
      y,
      color,
    });
  });

  socket.on("drawing", ({ roomId, x, y, color }) => {
    socket.to(roomId).emit("drawing", {
      x,
      y,
      color,
    });
  });

  socket.on("stop_drawing", ({ roomId }) => {
    socket.to(roomId).emit("stop_drawing");
  });
}

export default drawingHandler;

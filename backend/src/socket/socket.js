const { Server } = require("socket.io");

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // room-wise users store
  const users = {}; // { roomId: [{ id, username }] }

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM + ADD USER
    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);

      // save on socket (for disconnect)
      socket.roomId = roomId;
      socket.username = username;

      if (!users[roomId]) users[roomId] = [];

      // avoid duplicate same socket
      const exists = users[roomId].find((u) => u.id === socket.id);
      if (!exists) {
        users[roomId].push({ id: socket.id, username });
      }

      // emit updated user list (only usernames)
      io.to(roomId).emit(
        "user-list",
        users[roomId].map((u) => u.username)
      );
    });

    // CODE SYNC
    socket.on("code-change", ({ roomId, code }) => {
      socket.to(roomId).emit("code-update", code);
    });

    // CHAT WITH USERNAME
    socket.on("send-message", ({ roomId, message, username }) => {
      io.to(roomId).emit("receive-message", { message, username });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      const { roomId, username } = socket;

      if (roomId && users[roomId]) {
        users[roomId] = users[roomId].filter(
          (u) => u.id !== socket.id
        );

        io.to(roomId).emit(
          "user-list",
          users[roomId].map((u) => u.username)
        );
      }

      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
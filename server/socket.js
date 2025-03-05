const { Server } = require("socket.io");
require("dotenv").config();

let onlineUsers = [];

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  io.on("connection", (socket) => {
    console.log("new connection", socket.id);

    socket.on("addNewUser", (userId) => {
      if (!onlineUsers.some((user) => user.userId === userId)) {
        onlineUsers.push({ userId, socketId: socket.id });
      }
      io.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("sendMessage", (message) => {
      const user = onlineUsers.find((user) => user.userId === message.recipientId);
      if (user) {
        io.to(user.socketId).emit("getMessage", message);
        io.to(user.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
        });
      }
    });

    socket.on("callUser", (data) => {
      io.to(data.userToCall).emit("callIncoming", {
        signal: data.signalData,
        from: data.from,
        fromId: data.fromId,
        name: data.name,
        type: data.type,
      });
    });

    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal);
    });

    socket.on("endCall", (data) => {
      io.to(data.to).emit("callEnded");
    });

    socket.on("ICEcandidate", (data) => {
      try {
        io.to(data.target).emit("ICEcandidate", {
          candidate: data.candidate,
          sender: data.sender,
        });
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);
      socket.broadcast.emit("callEnded", { reason: "User disconnected" });
    });
  });

  return io;
};

module.exports = setupSocket;

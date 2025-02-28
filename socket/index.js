const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  // listen to a connectiom
  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId == userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
    io.emit("getOnlineUsers", onlineUsers);
  });

  // send message
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId
    );
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
    // Verify data contains correct target socket ID
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
      // Forward directly using socket ID
      io.to(data.target).emit("ICEcandidate", {
        candidate: data.candidate,
        sender: data.sender,
      });
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId != socket.id);
    io.emit("getOnlineUsers", onlineUsers);
    // Clean up any ongoing calls
    socket.broadcast.emit("callEnded", { reason: "User disconnected" });
  });
});

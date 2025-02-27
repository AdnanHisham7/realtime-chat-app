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
    console.log(data, "kikiki");
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
    io.to(data.target).emit("ICEcandidate", {
      candidate: data.candidate,
      sender: data.sender,
    });
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId != socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

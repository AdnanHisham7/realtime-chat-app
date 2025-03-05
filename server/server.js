const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const setupSocket = require("./socket");

const app = express();
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Start the server
const expressServer = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize WebSocket server
setupSocket(expressServer);

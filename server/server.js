const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use(cors());
app.use("/users", userRoutes);

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
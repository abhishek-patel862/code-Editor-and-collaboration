const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const runRoutes = require("./src/routes/runRoutes"); // 🔥 NEW
const socketHandler = require("./src/socket/socket");

const app = express();

// 🔥 MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔥 DB CONNECT
connectDB();

// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/run", runRoutes); // 🔥 NEW RUN ROUTE

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 🔥 SERVER + SOCKET
const server = http.createServer(app);
socketHandler(server);

// 🔥 START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
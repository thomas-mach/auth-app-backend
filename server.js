const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { socketController } = require("./controllers/socketController");
const socketAuth = require("./middlewares/socketAuth"); // Importa il middleware

dotenv.config();
const app = require("./app");

const server = http.createServer(app); // Crea il server HTTP
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Permetti il frontend
    credentials: true,
  },
});

// Middleware per autenticazione con JWT
io.use(socketAuth);
socketController(io);

const PORT = process.env.PORT || 3003;

mongoose.connect(process.env.DATABASE).then((con) => {
  console.log("Database connected...");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

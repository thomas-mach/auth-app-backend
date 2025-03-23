const jwt = require("jsonwebtoken");

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("❌ Autenticazione richiesta"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Salva l'utente autenticato
    next();
  } catch (err) {
    next(new Error("❌ Token non valido"));
  }
};

module.exports = socketAuth;

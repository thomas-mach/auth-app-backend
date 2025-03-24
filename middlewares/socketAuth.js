const jwt = require("jsonwebtoken");
const Blacklist = require("../model/blacklistModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const socketAuth = catchAsync(async (socket, next) => {
  //   const token = socket.handshake.auth?.token;
  //   const cookies = socket.handshake.headers.cookie;
  //   console.log("Cookies from socket:", cookies);
  const token = socket.handshake.headers.cookie
    ?.split(";")
    .find((c) => c.trim().startsWith("jwt="));
  console.log("Token from socketAuth", token);
  if (!token) return next(new Error("❌ Autenticazione richiesta"));

  if (token) {
    const jwtToken = token.split("=")[1];
    console.log("JWT token", jwtToken);
    const blacklisted = await Blacklist.findOne({ token: jwtToken });
    console.log("BLACKLISTED:", blacklisted);
    if (blacklisted) {
      return next(new AppError("Token not valid!", 400));
    }
  }

  try {
    const jwtToken = token.split("=")[1];
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    socket.user = decoded; // Salva l'utente autenticato
    next();
  } catch (err) {
    next(new Error("❌ Token non valido"));
  }
});

module.exports = socketAuth;

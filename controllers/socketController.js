const catchAsync = require("../utils/catchAsync");
const Message = require("../model/messageModel");
const AppError = require("../utils/appError");

// Funzione per gestire la connessione socket
exports.socketController = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 Utente connesso: ${socket.id}`);

    // Gestisce la ricezione del messaggio
    socket.on("message", async (msg) => {
      console.log("📩 Messaggio ricevuto:", msg);
      console.log(socket);

      try {
        // Validazione del messaggio
        if (!msg) {
          return socket.emit("error", {
            message: "Dati mancanti nel messaggio",
          });
        }

        // Salva il messaggio nel database
        const newMessage = await Message.create({
          message: msg,
          sender: socket.user.id,
        });

        const fullMessage = await newMessage.populate("sender", "name avatar");

        // Invia il messaggio a tutti i client connessi
        io.emit("message", fullMessage);
      } catch (error) {
        console.error("❌ Errore nel salvataggio del messaggio:", error);
        socket.emit("error", { message: "Errore interno del server" });
      }
    });

    // Gestisce la disconnessione dell'utente
    socket.on("disconnect", () => {
      console.log(`🔴 Utente disconnesso: ${socket.id}`);
    });
  });
};

const Message = require("../model/messageModel");

// Funzione per gestire la connessione socket
exports.socketController = (io) => {
  let connectedUsers = 0;

  io.on("connection", (socket) => {
    connectedUsers++;
    io.emit("userCount", connectedUsers);
    console.log(`🟢 Utente connesso, Totale: ${connectedUsers}`);

    socket.on("request_user_data", () => {
      io.emit("user_data", { userId: socket.user.id });
    });

    // Gestisce la ricezione del messaggio
    socket.on("message", async (msg) => {
      console.log("📩 Messaggio ricevuto:", msg);
      try {
        if (!msg) {
          return socket.emit("error", {
            message: "Dati mancanti nel messaggio",
          });
        }

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

    socket.on("getUserCount", () => {
      socket.emit("userCount", connectedUsers);
    });

    // Gestisce la disconnessione dell'utente
    socket.on("disconnect", () => {
      connectedUsers = Math.max(0, connectedUsers - 1); // Evita numeri negativi
      io.emit("userCount", connectedUsers);
      console.log(`🔴 Utente disconnesso, Totale: ${connectedUsers}`);
    });
  });
};

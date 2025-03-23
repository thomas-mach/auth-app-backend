const catchAsync = require("../utils/catchAsync");
const Message = require("../model/messageModel");
const AppError = require("../utils/appError");

// const socketController = (io) => {
//   io.on("connection", (socket) => {
//     console.log(`🟢 Utente connesso: ${socket.id}`);

//     // Riceve un messaggio dal client
//     socket.on("message", async (msg) => {
//       console.log(msg);
//       try {
//         // Validazione dei dati
//         if (!msg) {
//           return socket.emit("error", {
//             message: "Dati mancanti nel messaggio",
//           });
//         }

//         // Salva il messaggio nel database
//         const newMessage = await Message.create({
//           message: msg,
//         });

//         // const savedMessage = await newMessage.save();

//         // Invia il messaggio a tutti i client connessi nella stessa chat
//         io.emit("message", newMessage.message);
//       } catch (error) {
//         console.error("❌ Errore nel salvataggio del messaggio:", error);
//         socket.emit("error", { message: "Errore interno del server" });
//       }
//     });

//     // Disconnessione dell'utente
//     socket.on("disconnect", () => {
//       console.log(`🔴 Utente disconnesso: ${socket.id}`);
//     });
//   });
// };

// module.exports = socketController;

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

        // Invia il messaggio a tutti i client connessi
        io.emit("message", newMessage.message);
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

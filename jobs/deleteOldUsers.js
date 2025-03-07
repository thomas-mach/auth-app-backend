const cron = require("node-cron");
const User = require("../model/userModel");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB);

// Job: elimina utenti disattivati da più di 30 giorni
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Controllo utenti disattivati...");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDay() - 30);

  try {
    const result = await User.deleteMany({
      isActive: false,
      deactivatedAt: { $lt: thirtyDaysAgo },
    });

    console.log(
      `🗑️ Eliminati ${result.deletedCount} utenti disattivati da più di 30 giorni`
    );
  } catch (error) {
    console.error("❌ Errore nella cancellazione utenti:", error);
  }
});

console.log("✅ Cron job per eliminazione utenti avviato...");

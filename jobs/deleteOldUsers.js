const cron = require("node-cron");
const User = require("../model/userModel");
const Message = require("../model/messageModel");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.DATABASE);

cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Checking for deactivated users...");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const result = await User.deleteMany({
      isActive: false,
      deactivatedAt: { $lt: thirtyDaysAgo },
    });

    console.log(
      `🗑️ Deleted ${result.deletedCount} users deactivated for more than 30 days`
    );
  } catch (error) {
    console.error("❌ Error deleting users:", error);
  }
});

cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Delete yesterday chat");

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  try {
    const result = await Message.deleteMany({
      createdAt: { $lt: yesterday },
    });

    console.log(
      `🗑️ Deleted ${result.deletedCount} messages for more than 1 days`
    );
  } catch (error) {
    console.error("❌ Error sending daily reminders:", error);
  }
});

cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Checking for old blacklisted JWT");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const result = await Message.deleteMany({
      expiresAt: { $lt: sevenDaysAgo },
    });

    console.log(`🗑️ Deleted ${result.deletedCount} JWT for more than 7 days`);
  } catch (error) {
    console.error("❌ Error sending daily reminders:", error);
  }
});

console.log("✅ Cron job started...");

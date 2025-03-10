const cron = require("node-cron");
const User = require("../model/userModel");
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

console.log("✅ Cron job for user deletion started...");

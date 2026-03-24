const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dns = require("dns");
const app = require("./app");

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const DB_URI = process.env.MONGODB_URI;

if (!DB_URI) {
  console.error("❌ Missing MONGODB_URI in .env file. Database features will fail.");
}

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Database connection established
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });

require("./cronJobs/recurringTransactions");
require("./cronJobs/leaderboardReset")();
require("./cronJobs/budgetAlertMonitor")();
require("./cronJobs/resetBudgetAlerts")();

const startServer = (port) => {
  const server = app.listen(port, () => {
    // Server started
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      startServer(port + 1);
    } else {
      console.error("❌ Server error:", err);
    }
  });

  process.on("SIGINT", async () => {
    server.close(async () => {
      try {
        await mongoose.connection.close();
        process.exit(0);
      } catch (err) {
        console.error("❌ Error closing MongoDB:", err);
        process.exit(1);
      }
    });
  });
};

const DEFAULT_PORT = process.env.PORT || 5001;
startServer(Number(DEFAULT_PORT));

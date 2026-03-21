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
    console.log("✅ Connected to MongoDB");
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
    console.log(`🚀 Server running on http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("❌ Server error:", err);
    }
  });

  process.on("SIGINT", () => {
    console.log("\n🛑 Server shutting down...");
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log("✅ MongoDB connection closed");
        process.exit(0);
      });
    });
  });
};

const DEFAULT_PORT = process.env.PORT || 5001;
startServer(Number(DEFAULT_PORT));

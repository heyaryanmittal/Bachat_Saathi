// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const app = require('./app');
// const seedDatabase = require('./seed/demoData');

// // Load environment variables
// dotenv.config();

// // MongoDB connection
// const DB_URI = process.env.MONGODB_URI ;
// mongoose.connect(DB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => {
//   console.log('Connected to MongoDB');

//   // Seed database if in development
//   if (process.env.NODE_ENV === 'development') {
//     seedDatabase();
//   }
// })
// .catch((error) => {
//   console.error('MongoDB connection error:', error);
//   process.exit(1);
// });

// // Start cron jobs
// require('./cronJobs/recurringTransactions');

// // Start server
// const PORT = 5001; // Changed to 5001 to avoid conflicts
// const server = app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// server.js
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dns = require("dns");
const app = require("./app"); // Express app (your routes & middleware)

// Load environment variables
dotenv.config();

// Fix for Node.js DNS resolution issues with MongoDB SRV records
// In some environments (like Windows/certain ISPs), the default DNS doesn't handle SRV correctly.
// We force Google DNS to ensure SRV records (mongodb+srv) resolve properly.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ========================
// MongoDB Connection
// ========================
const DB_URI = process.env.MONGODB_URI;

if (!DB_URI) {
  console.error("❌ Missing MONGODB_URI in .env file. Database features will fail.");
  // process.exit(1); // Don't crash on Vercel immediately, let it run so we can see logs
}

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Seed demo data only in development mode
    // if (process.env.NODE_ENV === "development") {
    //   try {
    //     await seedDatabase();
    //     console.log("🌱 Database seeded with demo data");
    //   } catch (err) {
    //     console.error("❌ Failed to seed database:", err.message);
    //   }
    // }
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });

// ========================
// Cron Jobs (Recurring Transactions, etc.)
// ========================
require("./cronJobs/recurringTransactions");
require("./cronJobs/leaderboardReset")();
// Budget alerts: daily monitor and monthly reset
require("./cronJobs/budgetAlertMonitor")();
require("./cronJobs/resetBudgetAlerts")();

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5001; // default to 5001 if not in .env

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Server shutting down...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      process.exit(0);
    });
  });
});

const mongoose = require("mongoose");

/**
 * Database connection configuration
 * Implements secure MongoDB connection with error handling
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Security: Use new URL parser and unified topology
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Security: Handle connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure in case of connection error
    process.exit(1);
  }
};

module.exports = connectDB;

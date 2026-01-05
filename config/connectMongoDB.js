const mongoose = require("mongoose");

// This global variable persists across function executions in Vercel
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
  if (cached.conn) {
    console.log("=> Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Allow buffering commands until connection is ready
      serverSelectionTimeoutMS: 30000, // 30 seconds for server selection
      socketTimeoutMS: 45000, // 45 seconds for socket operations
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections to maintain
      maxIdleTimeMS: 60000, // Close connections after 60 seconds of inactivity
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongoose) => {
        console.log("=> New MongoDB Connection Established");
        return mongoose;
      })
      .catch((error) => {
        console.error("=> MongoDB Connection Error:", error.message);
        cached.promise = null; // Reset promise on error to allow retry
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("=> Failed to establish MongoDB connection:", error.message);
    throw error;
  }
}

module.exports = connectMongoDB;

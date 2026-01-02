const mongoose = require("mongoose");

// This global variable persists across function executions in Vercel
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("=> New MongoDB Connection Established");
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectMongoDB;

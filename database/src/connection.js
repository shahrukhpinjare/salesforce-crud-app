const mongoose = require("mongoose");

// Database connection ka local status track karta hai.
let connected = false;

// MongoDB se connect karta hai; pehle se connected ho to wahi connection reuse hota hai.
async function connectDatabase(uri) {
  if (connected) {
    return mongoose.connection;
  }

  // Connection URI missing ho to clear error deta hai.
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  connected = true;

  // Mongoose disconnect event aaye to local status bhi update karta hai.
  mongoose.connection.on("disconnected", () => {
    connected = false;
  });

  return mongoose.connection;
}

// Active database connection ko safely close karta hai.
async function disconnectDatabase() {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}

// Local flag aur Mongoose readyState dono check karke connection status batata hai.
function isDatabaseConnected() {
  return connected && mongoose.connection.readyState === 1;
}

// Connection helpers aur Mongoose instance ko baaki modules ke liye export karta hai.
module.exports = {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
  mongoose,
};

// Backend ki environment settings yahan load aur export hoti hain.
// Required values missing hon to error aata hai; optional values ke defaults hain.
require("dotenv").config();

// Required environment variable na mile to app ko clear error ke saath rokta hai.
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  // PORT set na ho to local development ke liye 3000 use hota hai.
  port: Number(process.env.PORT) || 3000,
  sessionSecret: requireEnv("SESSION_SECRET"),
  mongodbUri: requireEnv("MONGODB_URI"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  sf: {
    clientId: requireEnv("SF_CLIENT_ID"),
    clientSecret: requireEnv("SF_CLIENT_SECRET"),
    callbackUrl: requireEnv("SF_CALLBACK_URL"),
    // URL ke end ka slash hataata hai, taaki Salesforce URLs sahi tarah banein.
    loginUrl: (
      process.env.SF_LOGIN_URL || "https://login.salesforce.com"
    ).replace(/\/$/, ""),
    apiVersion: process.env.SF_API_VERSION || "59.0",
  },
};

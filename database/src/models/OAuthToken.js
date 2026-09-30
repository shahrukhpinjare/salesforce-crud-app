const { mongoose } = require("../connection");

// Har session ke Salesforce OAuth tokens aur unki connection details ka schema.
const oauthTokenSchema = new mongoose.Schema(
  {
    // Har session ka ek hi token record rahe, aur sessionId se lookup fast ho.
    sessionId: { type: String, required: true, unique: true, index: true },
    // Token ko optional taur par app ke User record se link karta hai.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // API requests ke liye access token aur Salesforce org ka base URL zaroori hain.
    accessToken: { type: String, required: true },
    refreshToken: { type: String, default: null },
    instanceUrl: { type: String, required: true },
    // Salesforce identity URL aur token expiry optional details hain.
    idUrl: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  // Document create/update hone ka time automatically maintain hota hai.
  { timestamps: true },
);

// Existing Mongoose model ko reuse karta hai, warna OAuthToken model create karta hai.
const OAuthToken =
  mongoose.models.OAuthToken || mongoose.model("OAuthToken", oauthTokenSchema);

module.exports = OAuthToken;

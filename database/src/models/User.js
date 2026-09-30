const { mongoose } = require("../connection");

// App mein Salesforce users ki basic profile aur login information store karta hai.
const userSchema = new mongoose.Schema(
  {
    // Salesforce user ki unique identity; index se lookup fast hota hai.
    salesforceUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Email trim aur lowercase hota hai, taaki format consistent rahe.
    email: { type: String, trim: true, lowercase: true },
    displayName: { type: String, trim: true },
    // User ke aakhri login ka optional time.
    lastLoginAt: { type: Date },
  },
  // User record create/update hone ka time automatically maintain hota hai.
  { timestamps: true },
);

// Existing Mongoose model reuse karta hai, warna naya User model create hota hai.
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;

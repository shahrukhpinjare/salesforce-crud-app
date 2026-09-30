const { mongoose } = require("../connection");

// User ke login/logout aur Salesforce record actions ka audit history schema.
const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      // Sirf listed actions hi audit log mein save ho sakte hain.
      required: true,
      enum: ["login", "logout", "create", "read", "update", "delete"],
    },
    // Object aur session par audit records ko jaldi search karne ke liye index hai.
    objectName: { type: String, default: null, index: true },
    recordId: { type: String, default: null },
    sessionId: { type: String, default: null, index: true },
    // Audit event ko database ke User record se link karta hai.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Extra action details ke liye flexible data field.
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  // Har document ke saath createdAt aur updatedAt automatically maintain hote hain.
  { timestamps: true },
);

// Existing Mongoose model ho to wahi reuse karta hai, warna naya model banata hai.
const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;

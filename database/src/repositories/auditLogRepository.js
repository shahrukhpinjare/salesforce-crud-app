const AuditLog = require("../models/AuditLog");

// Audit event ko consistent fields ke saath MongoDB mein save karta hai.
async function writeAudit(entry) {
  await AuditLog.create({
    action: entry.action,
    // Optional details missing hon to null store karta hai.
    objectName: entry.objectName ?? null,
    recordId: entry.recordId ?? null,
    sessionId: entry.sessionId ?? null,
    userId: entry.userId ?? null,
    metadata: entry.metadata ?? null,
  });
}

// Repository function ko doosre modules ke liye available karta hai.
module.exports = {
  writeAudit,
};
